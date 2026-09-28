---
layout: post
title: "DLL Hijacking and Sideloading"
date: 2025-12-18
permalink: /jam-software-treesize-dll-hijacking/
---

# **DLL Hijacking and Sideloading in JAM Software TreeSize Free 4.8**

_By magnafoco 🔥 - December 2025_ 

---

During security research on Windows desktop utilities, we identified **two DLL-loading weaknesses** in **JAM Software TreeSize Free 4.8** that let an attacker run arbitrary code in the context of the application.
- **Uncontrolled Search Path Element** ([CWE-427](https://cwe.mitre.org/data/definitions/427.html)): DLL search-order hijacking via a missing `version.dll`.
- **Use of Incorrectly-Resolved Name or Reference** ([CWE-706](https://cwe.mitre.org/data/definitions/706.html)): DLL sideloading / proxying via `oleacc.dll`.

Both issues share the same root cause: the application resolves and loads libraries from a directory that a non-privileged user can write to. Both were reproduced against a default installation of TreeSize Free 4.8 and reported to the vendor under coordinated disclosure.
Impact: code execution with the privileges of TreeSizeFree.exe. The practical severity depends on the deployment scenario.

## Affected product

**Vendor:** JAM Software
**Product:** TreeSize Free
**Affected version:** 4.8
**Product page:** <https://www.jam-software.com/treesize>
**Platform:** Windows
**Researchers:** Cristian Castrechini (magnafoco), Eduardo Maragno (Stux)

## Background: two ways to abuse DLL loading

When a Windows process loads a library by name, the loader walks a defined **DLL search order**. If a library is referenced without an absolute path, the directory of the executable is searched early. Two distinct problems arise when that directory, or any searched directory, is writable by an attacker:

**Search-order hijacking (a "phantom" DLL).** The application asks for a library that is *not present* in its own directory. The loader keeps searching, but an attacker who can drop a file there wins the race: their malicious library is found first and loaded. This is the case for `version.dll` below.
**Sideloading and proxying.** The application legitimately loads a library that *does* exist, but from a location the attacker can overwrite. The attacker replaces it with a *proxy DLL* that re-exports the same functions, forwards the real calls to the genuine system copy, and runs attacker code alongside, so the application keeps working and the tampering is not obvious. This is the case for `oleacc.dll` below.

Both are catalogued in MITRE ATT&CK under **[T1574 – Hijack Execution Flow](https://attack.mitre.org/techniques/T1574/)** (.001 DLL Search Order Hijacking, .002 DLL Side-Loading).

### Observing the loads

Every finding below starts the same way: [Process Monitor](https://learn.microsoft.com/sysinternals/downloads/procmon) from the Sysinternals suite, filtered to show only the DLL activity of the target process.

<figure>
  <img src="/img/06-procmon-filter.png"/>
  <figcaption>Process Monitor filter: <code>Process Name contains TreeSize</code>, <code>Operation is CreateFile</code>, <code>Path ends with .dll</code>, excluding the ProcMon binaries themselves.</figcaption>
</figure>

## Finding 1 — DLL Hijacking (version.dll)

**Affected DLL:** `version.dll`
**Prerequisites:** The attacker must be able to write to the directory from which TreeSizeFree.exe is loaded at start time.

### Analysis

With the process running under Process Monitor, TreeSizeFree.exe attempts to load `version.dll` from its own installation directory. The file is not present there and the load returns `NAME NOT FOUND`, so the loader moves on to the next location in the search order. That gap is the opportunity: whatever library is placed in the application directory under that name will be loaded on the next launch.

<figure>
  <img src="/img/07-version-dll-name-not-found.png"/>
  <figcaption><code>TreeSizeFree.exe</code> looks for <code>VERSION.dll</code> (and other libraries) in its install directory and does not find it — the highlighted entry returns <code>NAME NOT FOUND</code>.</figcaption>
</figure>

To prove code execution, we compiled a minimal `version.dll` whose `DllMain` simply displays a message box when the library is attached to the process. The library was then placed in the TreeSize Free installation folder.

<figure>
  <img src="/img/08-version-dll-poc-source.png"/>
  <figcaption>Proof-of-concept <code>version.dll</code>: <code>DllMain</code> pops a message box on <code>DLL_PROCESS_ATTACH</code>. </figcaption>
</figure>

Relaunching TreeSizeFree.exe loads our library and executes the PoC code, confirming arbitrary code execution in the context of the application.

<figure>
  <img src="/img/09-version-dll-poc-result.png"/>
  <figcaption>Launching the application executes the planted DLL, the message box confirms code execution.</figcaption>
</figure>

## Finding 2 — DLL Sideloading (oleacc.dll)

**Affected DLL:** `oleacc.dll`
**Prerequisites:** The attacker must be able to write to the directory from which the application loads its DLLs at runtime.

### Analysis

DLL sideloading with proxying works by inserting an intermediary library, a *proxy DLL*, that exposes the same exported functions as the original. The proxy loads the genuine library, forwards calls to it so the application behaves normally, and runs attacker code in between. The interference is transparent to the application.
Using the same Process Monitor filter, TreeSizeFree.exe is observed loading `oleacc.dll` from its installation directory, a directory the current user can write to.

A first, naive replacement (a custom `oleacc.dll` that does *not* export the functions the application needs) fails: TreeSize Free raises a Bad Image error (0xC0000020) because the required exports are missing. This tells us exactly which functions the proxy must provide.

<figure>
  <img src="/img/10-oleacc-bad-image-error.png"/>
  <figcaption>The application loads <code>oleacc.dll</code> from its install directory (<code>SUCCESS</code>), but a DLL missing the expected exports triggers a <code>Bad Image</code> error (<code>0xC0000020</code>).</figcaption>
</figure>

After enumerating the exports the application depends on, a proxy `oleacc.dll` was built that re-exports those functions (forwarding them to the legitimate copy in `C:\Windows\System32`) and additionally executes a payload. In our lab, the payload was a Meterpreter reverse shell used purely to demonstrate impact against our own test machine.

<figure>
  <img src="/img/11-oleacc-proxy-source.png"/>
  <figcaption>The proxy <code>oleacc.dll</code>: linker directives forward each required export to the genuine <code>System32\oleacc.dll</code>, while an embedded payload runs alongside.</figcaption>
</figure>

With a listener prepared, launching TreeSize Free loads the proxy, forwards the accessibility functions so the application runs normally, and executes the payload yielding a session on the operator console.

<figure>
  <img src="/img/12-meterpreter-session.png"/>
  <figcaption>A Meterpreter session opens against the lab host once the proxy DLL runs. Host names and addresses shown are from an isolated test environment.</figcaption>
</figure>

The resulting shell runs with the privileges of TreeSizeFree.exe. If the application is running elevated, so is the attacker's code.

<figure>
  <img src="/img/13-meterpreter-whoami-priv.png"/>
  <figcaption><code>whoami /priv</code> inside the resulting shell, the code inherits the privileges of the host process.</figcaption>
</figure>

## Impact and prerequisites

Both findings require the attacker to be able to **write to the directory the application loads from**. In the tested setup, TreeSize Free was installed per-user under `%LOCALAPPDATA%\Programs\JAM Software\TreeSize Free\`, which is writable by the current user. That shapes the realistic impact:

**Execution of arbitrary code with the privileges of the compromised application:** depending on the environment this enables persistence, defense evasion behind a trusted binary, data exfiltration, and potential lateral movement.

**Persistence and defense evasion (same-user):** the planted DLL runs every time the user starts TreeSize Free, a signed, trusted binary which is attractive for masquerading and proxy execution.

**Privilege escalation (conditional):** if TreeSize Free is ever run at a higher integrity level than the account that planted the DLL, for example launched elevated, or executed by a different/more-privileged user while the library sits in a location the attacker could write, the attacker's code inherits those higher privileges.

**Machine-wide installs:** where the product is installed under `Program Files`, a standard user cannot normally write to the application directory, so exploitation depends on the directory ACLs of the specific deployment.

## Remediation

Require code signing for loaded modules, and avoid relative paths when loading libraries or resources.

Additional hardening that is effective against this class of issue (defender- and developer-side):

**Load system libraries from a fixed, trusted location.** Reference known DLLs by absolute path, or use `LoadLibraryEx` with `LOAD_LIBRARY_SEARCH_SYSTEM32`, and call `SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32)` early in startup to remove the application directory from the search path for system modules.

**Enable safe DLL search mode** and, where appropriate, a DLL-load policy that blocks loading of non-Microsoft or unsigned libraries from user-writable locations.

**Verify signatures at load time** for the modules the application ships or depends on.

**Install to a location that standard users cannot write to** (e.g. `Program Files`) and ensure the application directory ACLs do not grant write access to unprivileged users.
**Detection:** monitor for known system DLLs (`version.dll`, `oleacc.dll`, and similar) being created or loaded from user-writable application directories.

## Credits

**Cristian Castrechini** [(magnafoco)](https://magnafoco.github.io)
**Eduardo Maragno** [(Stux)](https://stuuxx.netlify.app)

## References

[CWE-427: Uncontrolled Search Path Element](https://cwe.mitre.org/data/definitions/427.html)
[CWE-706: Use of Incorrectly-Resolved Name or Reference](https://cwe.mitre.org/data/definitions/706.html)
[MITRE ATT&CK T1574 – Hijack Execution Flow](https://attack.mitre.org/techniques/T1574/)
[Microsoft — Dynamic-Link Library Search Order](https://learn.microsoft.com/windows/win32/dlls/dynamic-link-library-search-order)
[Sysinternals Process Monitor](https://learn.microsoft.com/sysinternals/downloads/procmon)

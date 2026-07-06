---
layout: post
title: "CRTP Review"
date: 2026-07-06
permalink: /crtp_review/
---

# **Altered Security – Certified Red Team Professional: Course and Exam Review**

_By magnafoco 🔥 – July 2026_

---

Hey folks! I recently added another one to the collection: I'm officially **Certified Red Team Professional (CRTP)**, and I want to share my experience with both the course and the exam.

If you're getting into Active Directory attacks, thinking about your first red team cert, or just want to level up your offensive security game, keep reading.

## Course Overview

CRTP is built around Altered Security's **"Attacking and Defending Active Directory"** course, created and delivered by **Nikhil Mittal**. It's marketed as a beginner-friendly red team certification, and it earns that label: it assumes you know your way around Windows and PowerShell, then teaches you to think like an attacker inside a modern enterprise domain.

The core philosophy of the course is what makes it stand out. Instead of hunting for one-off, patchable software vulnerabilities, CRTP is about **abusing legitimate features and misconfigurations** in Active Directory. You learn to live off the land using native tooling (PowerShell, WMI, and friends), which is exactly how real-world engagements against hardened environments play out.

The material is well organized: ~16 hours of theory split across lesson videos, plus walkthrough objective videos that show you each attack end to end. What really shines, though, is the lab. Each student gets an individual, fully patched Windows environment (Server 2022, SQL Server, multiple domains and forests) with a solid set of learning objectives and flags to capture. Tools come pre-installed and the lab is aligned tightly with the material, so you spend your time attacking instead of debugging your setup.

The course covers a wide range of essential topics:

- Active Directory enumeration (PowerView, BloodHound, AD Module)
- Local privilege escalation techniques
- Lateral movement (PsExec, WMI, WinRM, Pass-the-Hash, Over-Pass-the-Hash)
- Domain privilege escalation (Kerberoasting, AS-REP Roasting, delegation abuse)
- Domain persistence and dominance (Golden/Silver Tickets, DCSync, Skeleton Key, custom SSP, DSRM)
- Cross-trust and cross-forest attacks (trust key abuse, SID History, child-to-parent escalation, SQL Server database links)
- Attacking Active Directory Certificate Services (AD CS)
- Defenses and bypasses (Windows Defender, MDE, MDI, LAPS, tiered administration)

## The Exam Experience

The CRTP exam is 100% hands-on and simulates a real assessment against an enterprise Active Directory environment. You're dropped in with domain user access to a foothold machine and given **24 hours** to achieve OS-level command execution across **5 target servers** spread over multiple domains and forests. After the practical, you get a further **48 hours** to write and submit a detailed report, including practical mitigations for each issue you exploited.

The course material prepares you well for what you'll face. Almost everything the exam throws at you is a variation of something you practiced in the lab, so if you actually worked through the objectives, nothing will feel completely alien.

That said, the exam rewards **methodical enumeration** above raw exploitation. There are no simulated users and no unpatched services to pop; every step forward comes from carefully mapping trusts, ACLs, group policies, and misconfigurations, then chaining them into an attack path. If you rush the enumeration, you'll stall. If you take good notes and stay organized, the chain reveals itself.

## My Experience

Coming in with some existing red team experience, I found the flow of the exam very natural and, honestly, a lot of fun. The 24 hours give you plenty of breathing room, so there's no artificial time pressure pushing you into mistakes; it's more about staying disciplined, documenting as you go, and not skipping steps.

The single best piece of advice I can give is: **enumerate everything and take notes obsessively during the course**. For every attack I studied, I documented what it abused and the exact commands. Having that personal cheat sheet ready made both the practical and the report phase dramatically smoother.

I used almost all the available time to complete the exam, because I preferred to work in a controlled way — eating, sleeping, and training — to avoid burnout and to keep from getting stuck under pressure.

## Final Thoughts

CRTP is one of the best value-for-money certifications in offensive security right now, and it's a fantastic entry point into Active Directory red teaming. The course is practical, the instruction is clear, the lab is genuinely enjoyable, and the exam is a real test of skill rather than a memorization exercise.

If you're considering it, my advice is simple: work through every lab objective, build a clean, searchable notes system, and get comfortable enumerating before you even think about exploiting. Supplementing with a few AD boxes on platforms like HackTheBox or TryHackMe never hurts either. With that preparation, it's a very achievable and rewarding cert that proves you can actually operate inside an enterprise domain.

Congrats — now you'll remember to check every single detail in an Active Directory environment, knowing that even one could be devastating. Welcome to the club! 🔥🖥️

<figure>
  <img src="/img/screen05.jpg"/>
  <figcaption>Altered Security - Certified Red Team Professional - Certificate.</figcaption>
</figure>

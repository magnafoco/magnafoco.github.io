const terminal = document.querySelector('.terminal');
const keySound = new Audio('keystroke.mp3');
keySound.volume = 0.2;
const typingSpeed = 50;

const commands = [
  {
    command: 'whoami',
    output: `magnafoco 🔥\nSenior Penetration Tester\nRed Teamer\nSecurity Researcher\nE-mail\nLinkedIn`
  },
  {
    command: 'ls blog',
    output: [
      { display: 'CVE-2025-30694', url: 'cve-2025-30694' },
      { display: 'PMPA Course & Exam Review', url: 'pmpa_review' },
      { display: 'CRTP Course & Exam Review', url: 'crtp_review' }
    ]
  }
];

let commandIndex = 0;
let readyForNext = true;

function addCursorLine() {
  const cursorLine = document.createElement('div');
  cursorLine.classList.add('line', 'cursor-line');
  cursorLine.innerHTML = `<span class="prompt">&gt;</span> <span class="cursor blinking"></span>`;
  terminal.appendChild(cursorLine);
}

function removeCursorLine() {
  const oldCursor = document.querySelector('.cursor-line');
  if (oldCursor) oldCursor.remove();
}

function showNextCommand() {
  if (commandIndex >= commands.length) return;

  removeCursorLine();

  const entry = commands[commandIndex];

  const cmdLine = document.createElement('div');
  cmdLine.classList.add('line');
  terminal.appendChild(cmdLine);

  const prompt = document.createElement('span');
  prompt.classList.add('prompt');
  prompt.textContent = '> ';
  cmdLine.appendChild(prompt);

  const commandText = document.createElement('span');
  cmdLine.appendChild(commandText);

  let cmdCharIndex = 0;

  // 🔊 Riproduci suono solo per comandi specifici
  if (entry.command === 'whoami' || entry.command === 'ls blog') {
    keySound.currentTime = 0;
    keySound.play().catch(() => {});
  }

  const typeCommand = setInterval(() => {
    if (cmdCharIndex < entry.command.length) {
      commandText.textContent += entry.command[cmdCharIndex];
      cmdCharIndex++;
    } else {
      clearInterval(typeCommand);
      setTimeout(() => typeLine(entry), 300);
    }
  }, typingSpeed);
}

function typeLine(entry) {
  if (Array.isArray(entry.output)) {
    let lineIndex = 0;

    function renderBlogEntry() {
      if (lineIndex >= entry.output.length) {
        commandIndex++;
        addCursorLine();
        readyForNext = true;
        return;
      }

      const blogEntry = entry.output[lineIndex];
      const outputLine = document.createElement('div');
      outputLine.classList.add('line');
      const link = document.createElement('a');
      link.classList.add('output-text');
      link.href = `https://magnafoco.github.io/${blogEntry.url}/`;
      link.textContent = '';
      outputLine.appendChild(link);
      terminal.appendChild(outputLine);

      let charIndex = 0;
      const typer = setInterval(() => {
        if (charIndex < blogEntry.display.length) {
          link.textContent += blogEntry.display[charIndex];
          charIndex++;
        } else {
          clearInterval(typer);
          lineIndex++;
          setTimeout(renderBlogEntry, 300);
        }
      }, 30);
    }

    renderBlogEntry();
    return;
  }

  const outputLines = entry.output.split('\n');
  let lineIndex = 0;

  function renderLine() {
    if (lineIndex >= outputLines.length) {
      commandIndex++;
      addCursorLine();
      readyForNext = true;
      return;
    }

    const text = outputLines[lineIndex];
    const lower = text.toLowerCase();

    if (entry.command === 'whoami' &&
        (lower.includes('linkedin') || lower.includes('e-mail'))) {

      const outputLine = document.createElement('div');
      outputLine.classList.add('line');
      const link = document.createElement('a');
      link.classList.add('output-text');

      if (lower.includes('e-mail')) {
        link.href = 'mailto:tumulus-reedy0t@icloud.com';
      } else {
        link.href = 'https://www.linkedin.com/in/cristian.castrechini';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      link.textContent = '';
      outputLine.appendChild(link);
      terminal.appendChild(outputLine);

      let charIndex = 0;
      const typer = setInterval(() => {
        if (charIndex < text.length) {
          link.textContent += text[charIndex];
          charIndex++;
        } else {
          clearInterval(typer);
          lineIndex++;
          setTimeout(renderLine, 300);
        }
      }, typingSpeed);
      return;
    }

    const outputLine = document.createElement('div');
    outputLine.classList.add('line', 'output-text');
    terminal.appendChild(outputLine);

    let charIndex = 0;
    const lineText = text;

    const typer = setInterval(() => {
      if (charIndex < lineText.length) {
        outputLine.textContent += lineText[charIndex];
        charIndex++;
      } else {
        clearInterval(typer);
        lineIndex++;
        setTimeout(renderLine, 300);
      }
    }, 30);
  }

  renderLine();
}

function handleScrollTrigger() {
  if (readyForNext) {
    readyForNext = false;
    showNextCommand();
  }
}

window.addEventListener('wheel', (event) => {
  if (event.deltaY > 0) handleScrollTrigger();
}, { passive: true });

window.addEventListener('touchmove', () => {
  handleScrollTrigger();
}, { passive: true });

addCursorLine();

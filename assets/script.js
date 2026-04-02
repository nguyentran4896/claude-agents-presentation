// Elements
const slides = document.querySelectorAll('.slide-inner');
const sections = document.querySelectorAll('.slide');
const tocItems = document.querySelectorAll('.toc-item');
const progressBar = document.getElementById('progress');
const navLabel = document.getElementById('navLabel');
const navCounter = document.getElementById('navCounter');
const slideCount = document.getElementById('slideCount');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Labels map (data-title → display name)
const labelMap = {
  'intro': 'Introduction',
  'mental-model-subagents': 'Subagents Model',
  'mental-model-teams': 'Teams Model',
  'subagents-lifecycle': 'Subagent Lifecycle',
  'subagents-builtin': 'Built-in Subagents',
  'subagents-in-action': 'Subagents in Action',
  'custom-subagents-def': 'Custom Agent Definition',
  'custom-subagents-config': 'Agent Configuration',
  'custom-subagents-screenshots': 'Custom Agents in Practice',
  'prompt-engineering-builder': 'Prompt Builder',
  'prompt-engineering-comparison': 'Vague vs Structured',
  'prompt-engineering-advanced': 'Advanced Prompting',
  'agent-tool-frontmatter': 'Agent Frontmatter',
  'agent-tool-reference': 'Parameter Reference',
  'agent-tool-sendmessage': 'SendMessage Pattern',
  'permissions-matrix': 'Permission Matrix',
  'permissions-auto': 'Auto Mode Deep Dive',
  'permissions-plan-security': 'Plan Mode & Security',
  'teams-def': 'What is an Agent Team?',
  'teams-tool-ops': 'TeammateTool Operations',
  'teams-inbox-worktrees': 'Inbox & Worktrees',
  'teams-screenshots': 'Teams in Practice',
  'setup-steps': 'Setup Steps',
  'setup-workflow': 'Team Lifecycle',
  'comparison': 'Subagents vs Teams',
  'decision-flow': 'Decision Flowchart',
  'inheritance-tables': 'Inheritance Tables',
  'inheritance-flow': 'Context Flow',
  'context-window-problem': 'Context Problem',
  'context-commands': 'Context Commands',
  'worktree-concept': 'Worktree Concept',
  'worktree-comparison': 'Default vs Isolated',
  'task-dag': 'Task Dependencies',
  'patterns-subagent': 'Subagent Patterns',
  'patterns-team': 'Team Patterns',
  'patterns-community': 'Community Patterns',
  'scaling-curve': 'Scaling Curve',
  'scaling-recommendations': 'Team Size Guide',
  'costs-overview': 'Token Cost Overview',
  'costs-calculator': 'Cost Calculator',
  'costs-reducers': 'Cost Reducers',
  'gotchas-critical': 'Critical Gotchas',
  'gotchas-operational': 'Operational Gotchas',
  'debugging-flowchart': 'Debugging Flowchart',
  'debugging-tools': 'Debugging Toolkit',
  'sdk-vs-tool-compare': 'SDK vs Tool',
  'sdk-vs-tool-details': 'SDK vs Tool Details',
  'ecosystem-tools': 'Tools & Collections',
  'ecosystem-integrations': 'Integrations',
  'quiz': 'Knowledge Check',
  'takeaways-actions': 'Action Items',
  'takeaways-reference': 'Reference Sheet'
};

// Slide visibility animation
const visObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
slides.forEach(s => visObs.observe(s));

// Active section tracking
let currentIdx = 0;
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const idx = Array.from(sections).indexOf(e.target);
      const title = e.target.dataset.title;
      currentIdx = idx;

      // Update TOC — clear all active
      tocItems.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.toc-branch').forEach(b => b.classList.remove('has-active'));

      // Set active item
      const match = document.querySelector(`.toc-item[data-target="${title}"]`);
      if (match) {
        match.classList.add('active');
        match.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Highlight parent branch
        const parentBranch = match.closest('.toc-branch');
        if (parentBranch) {
          parentBranch.classList.add('has-active');
          // Auto-expand if collapsed
          parentBranch.classList.remove('collapsed');
        }
      }

      // Update nav bar
      navLabel.textContent = labelMap[title] || title;
      navCounter.textContent = `${idx + 1} / ${sections.length}`;
      slideCount.textContent = `${idx + 1} / ${sections.length}`;
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => secObs.observe(s));

// Progress bar
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.width = (p * 100) + '%';
});

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    currentIdx = Math.min(currentIdx + 1, sections.length - 1);
    sections[currentIdx].scrollIntoView({ behavior: 'smooth' });
  }
  if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    currentIdx = Math.max(currentIdx - 1, 0);
    sections[currentIdx].scrollIntoView({ behavior: 'smooth' });
  }
});

// Sync keyboard index
const syncObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) currentIdx = Array.from(sections).indexOf(e.target);
  });
}, { threshold: 0.45 });
sections.forEach(s => syncObs.observe(s));

// TOC click handler
function jumpTo(e, targetTitle) {
  e.preventDefault();
  const target = document.querySelector(`.slide[data-title="${targetTitle}"]`);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
  closeSidebar();
}

// Tree branch collapse/expand
function toggleBranch(labelEl) {
  const branch = labelEl.closest('.toc-branch');
  if (branch) branch.classList.toggle('collapsed');
}

// Mobile sidebar toggle
function toggleSidebar() {
  sidebar.classList.toggle('open');
}
function closeSidebar() {
  sidebar.classList.remove('open');
}

// Tabs
function switchTab(e, id) {
  const group = e.target.closest('.tab-group') || e.target.parentElement;
  group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  const parent = group.parentElement;
  parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Animate token bars on scroll
const barObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.querySelectorAll('.bar-fill').forEach(b => {
        b.style.width = b.style.width;
        b.classList.add('animate');
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.token-calc').forEach(el => barObs.observe(el));

// ===== DAG INTERACTION =====
const dagDeps = { 1:[], 2:[], 3:[1,2], 4:[2], 5:[3,4], 6:[5] };
const dagState = { 1:'active', 2:'active', 3:'blocked', 4:'blocked', 5:'blocked', 6:'blocked' };
const statusIcons = { blocked:'○', active:'◉', done:'✓' };

function toggleDagNode(id) {
  if (dagState[id] === 'blocked') return; // can't toggle blocked
  dagState[id] = dagState[id] === 'done' ? 'active' : 'done';
  updateDag();
}

function updateDag() {
  // Recalculate blocked/active states
  for (let id = 1; id <= 6; id++) {
    if (dagState[id] === 'done') continue;
    const deps = dagDeps[id];
    const allDone = deps.every(d => dagState[d] === 'done');
    dagState[id] = allDone ? 'active' : 'blocked';
  }
  // Update DOM
  for (let id = 1; id <= 6; id++) {
    const el = document.getElementById('dag-' + id);
    if (!el) continue;
    el.className = 'dag-node ' + dagState[id];
    el.querySelector('.dag-status').textContent = statusIcons[dagState[id]];
  }
}

function resetDag() {
  Object.assign(dagState, { 1:'active', 2:'active', 3:'blocked', 4:'blocked', 5:'blocked', 6:'blocked' });
  updateDag();
}

// ===== FLOW ANIMATION REPLAY =====
function replayFlow(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const dots = el.querySelectorAll('.flow-dot, .flow-h-dot');
  dots.forEach(d => {
    d.style.animation = 'none';
    d.offsetHeight; // force reflow
    d.style.animation = '';
  });
}

// ===== CONTEXT VIS ANIMATION ON SCROLL =====
const ctxObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('animate');
  });
}, { threshold: 0.3 });
document.querySelectorAll('.ctx-vis').forEach(el => ctxObs.observe(el));

// ===== STAGGERED CARD REVEAL ON SCROLL =====
const cardObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('cards-visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.card-grid').forEach(el => cardObs.observe(el));

// ===== LIFECYCLE CLICK-TO-HIGHLIGHT =====
const lcStepLabels = ['Matching description fields...', 'Spawning fresh context...', 'Executing independently...', 'Returning result to parent'];

function activateLcStep(si) {
  const lc = document.getElementById('lifecycleAnim');
  if (!lc) return;
  lc.querySelectorAll('.lc-step').forEach(s => { s.classList.remove('step-active','step-done'); });
  lc.querySelectorAll('.lc-arrow').forEach(a => { a.classList.remove('arrow-active'); });
  const target = lc.querySelector(`.lc-step[data-step="${si}"]`);
  if (target) target.classList.add('step-active');
  lc.querySelectorAll('.lc-arrow').forEach(a => {
    a.classList.toggle('arrow-active', parseInt(a.dataset.arrow) === si - 1);
  });
  const label = document.getElementById('lcStepLabel');
  if (label) label.textContent = lcStepLabels[si] || '';
}

const lcEl = document.getElementById('lifecycleAnim');
if (lcEl) {
  lcEl.querySelectorAll('.lc-step').forEach(step => {
    step.style.cursor = 'pointer';
    step.addEventListener('click', () => {
      const si = parseInt(step.dataset.step);
      activateLcStep(si);
    });
  });
  activateLcStep(0);
}

// ===== PERMISSION MATRIX INTERACTIVITY =====
const permDescriptions = {
  'default': '<strong>Default mode</strong> — The starting point. Read operations are auto-approved. All writes and shell commands require explicit user approval via prompt. Most restrictive interactive mode.',
  'acceptEdits': '<strong>acceptEdits</strong> — File writes (Edit, Write) are auto-approved without prompting. Shell commands and MCP tools still require approval. <code>Shift+Tab</code> to enter. Good for trusted implementation work.',
  'plan': '<strong>Plan mode</strong> — Read-only. No writes, no bash, no MCP. The agent can only read and think. Perfect for Explore/Plan subagents that should never modify anything. Also great as a starting mode before approving execution.',
  'auto': '<strong>Auto mode</strong> — A separate <strong>Sonnet 4.6 classifier</strong> evaluates each action. Adds latency + cost but enables autonomous operation. Falls back after 3 consecutive blocks or 20 total. <code>Team/Enterprise plan required.</code>',
  'bypassPerms': '<strong>bypassPermissions</strong> — Everything executes immediately. No classifier, no checks. <code style="color:var(--red)">Only for isolated containers/VMs.</code> Admin can disable via <code>"disableBypassPermissionsMode": "disable"</code>.',
  'dontAsk': '<strong>dontAsk</strong> — Auto-denies every tool not explicitly in your allow rules. Even <code>ask</code> rules are denied (fully non-interactive). Unlike bypass (which auto-approves everything), this only runs pre-approved actions. Ideal for CI pipelines. <code>--permission-mode dontAsk</code>.'
};

let activePermCol = null;

function highlightPermCol(mode) {
  const table = document.getElementById('permMatrix');
  const panel = document.getElementById('permDetail');
  const card = document.getElementById('permDetailCard');

  // Toggle off if clicking same column
  if (activePermCol === mode) {
    table.classList.remove('col-highlight');
    table.querySelectorAll('.col-active').forEach(c => c.classList.remove('col-active'));
    panel.classList.remove('open');
    activePermCol = null;
    return;
  }

  activePermCol = mode;
  table.classList.add('col-highlight');

  // Find column index
  const headers = table.querySelectorAll('th[data-mode]');
  let colIdx = -1;
  headers.forEach((h, i) => {
    if (h.dataset.mode === mode) colIdx = i + 1; // +1 for first th
    h.classList.toggle('col-active', h.dataset.mode === mode);
  });

  // Highlight cells in that column
  table.querySelectorAll('tr').forEach(row => {
    const cells = row.querySelectorAll('td, th');
    cells.forEach((cell, ci) => {
      cell.classList.toggle('col-active', ci === colIdx);
    });
  });

  // Show detail
  card.innerHTML = permDescriptions[mode] || '';
  panel.classList.add('open');
}

// ===== INTERACTIVE COST CALCULATOR =====
const agentLabels = ['solo session', 'subagents', 'agent team'];
const agentMultipliers = [1, 2, 7];

function updateCostCalc() {
  const teamSize = parseInt(document.getElementById('costTeamSize').value);
  const hours = parseInt(document.getElementById('costHours').value);
  const agentLevel = parseInt(document.getElementById('costAgentUse').value);

  document.getElementById('costTeamVal').textContent = teamSize;
  document.getElementById('costHoursVal').textContent = hours + 'h';
  document.getElementById('costAgentVal').textContent = agentLabels[agentLevel];

  // Base: $6/dev/day at 8h → $0.75/dev/hour
  const hourlyRate = 0.75;
  const multiplier = agentMultipliers[agentLevel];
  const dailyCost = teamSize * hours * hourlyRate * multiplier;
  const monthlyCost = dailyCost * 22; // working days

  document.getElementById('crDaily').textContent = '$' + Math.round(dailyCost);
  document.getElementById('crMonthly').textContent = '$' + Math.round(monthlyCost).toLocaleString();
  document.getElementById('crMultiplier').textContent = '~' + multiplier + 'x';

  // Color the multiplier
  const mEl = document.getElementById('crMultiplier');
  if (multiplier <= 1) mEl.style.color = 'var(--accent4)';
  else if (multiplier <= 3) mEl.style.color = 'var(--orange)';
  else mEl.style.color = 'var(--red)';
}

// ===== CODE STEPPER =====
const stepExplanations = {
  sendMsg: [
    '<strong>1. Spawn</strong> — Call <code>Agent()</code> with a <code>name</code> parameter. This creates a named, addressable agent that persists in your session. The <code>subagent_type</code> routes to your custom agent definition.',
    '<strong>2. Execute</strong> — The agent works autonomously in its own context window. It reads files, analyzes code, and produces findings. When done, results return to your session.',
    '<strong>3. Follow-up</strong> — Instead of re-spawning, call <code>SendMessage({to: "reviewer"})</code>. This sends a new message to the <em>same running agent</em> with all its accumulated context intact.',
    '<strong>4. Continue</strong> — The agent picks up exactly where it left off. It remembers every file it read, every finding it made. No context loss, no re-initialization cost.'
  ]
};

function setCodeStep(stepperId, step) {
  const stepper = document.getElementById(stepperId + 'Stepper');
  const explanation = document.getElementById(stepperId + 'Explanation');
  const nav = document.getElementById(stepperId + 'Nav');
  const counter = document.getElementById(stepperId + 'Counter');
  if (!stepper) return;

  // Highlight lines
  stepper.querySelectorAll('.code-line').forEach(line => {
    const lineStep = parseInt(line.dataset.cstep);
    if (lineStep === step) {
      line.classList.add('line-active');
      line.classList.remove('line-dimmed');
    } else {
      line.classList.remove('line-active');
      line.classList.add('line-dimmed');
    }
  });

  // Update explanation
  const explanations = stepExplanations[stepperId];
  if (explanation && explanations) {
    explanation.innerHTML = explanations[step] || '';
  }

  // Update nav buttons
  if (nav) {
    nav.querySelectorAll('button').forEach((btn, i) => {
      btn.classList.toggle('active', i === step);
    });
  }
  if (counter) {
    counter.textContent = `Step ${step + 1} / ${explanations ? explanations.length : 4}`;
  }
}

// Initialize code stepper
setCodeStep('sendMsg', 0);

// ===== DAG SVG EDGES =====
function drawDagEdges() {
  const grid = document.getElementById('dagGrid');
  const container = document.getElementById('dagVis');
  if (!grid || !container) return;

  // Remove existing SVG
  const existingSvg = container.querySelector('.dag-svg');
  if (existingSvg) existingSvg.remove();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('dag-svg');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '1';
  svg.style.overflow = 'visible';

  const containerRect = container.getBoundingClientRect();

  const edges = [
    [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6]
  ];

  edges.forEach(([from, to]) => {
    const fromEl = document.getElementById('dag-' + from);
    const toEl = document.getElementById('dag-' + to);
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
    const y1 = fromRect.bottom - containerRect.top;
    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
    const y2 = toRect.top - containerRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midY = (y1 + y2) / 2;
    path.setAttribute('d', `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`);
    path.classList.add('dag-edge');
    path.dataset.from = from;
    path.dataset.to = to;

    // Color based on state
    if (dagState[from] === 'done' && dagState[to] === 'done') {
      path.classList.add('edge-done');
    } else if (dagState[from] === 'done') {
      path.classList.add('edge-active');
    }

    svg.appendChild(path);
  });

  container.style.position = 'relative';
  container.insertBefore(svg, container.firstChild);
}

// Override updateDag to also redraw edges
const originalUpdateDag = updateDag;
updateDag = function() {
  originalUpdateDag();
  requestAnimationFrame(drawDagEdges);
};

const originalResetDag = resetDag;
resetDag = function() {
  originalResetDag();
  requestAnimationFrame(drawDagEdges);
};

// Draw edges when DAG comes into view
const dagObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      setTimeout(drawDagEdges, 200);
    }
  });
}, { threshold: 0.3 });
const dagEl = document.getElementById('dagVis');
if (dagEl) dagObs.observe(dagEl);

// Redraw edges on resize
let dagResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(dagResizeTimer);
  dagResizeTimer = setTimeout(drawDagEdges, 150);
});

// Initial draw
setTimeout(drawDagEdges, 500);

// ===== TEAM TRIANGLE SVG EDGES =====
function drawTriangleEdges() {
  const container = document.getElementById('teamTriangle');
  if (!container) return;

  // Remove old SVG
  const oldSvg = container.querySelector('.tri-svg');
  if (oldSvg) oldSvg.remove();

  const rect = container.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  // Find the Team Lead node (sits above the container)
  const leadNode = container.parentElement.querySelector('.node.lead');

  // Find worker node positions relative to container
  const backendWrap = container.querySelector('[data-tri-node="backend"]');
  const frontendWrap = container.querySelector('[data-tri-node="frontend"]');
  const testsWrap = container.querySelector('[data-tri-node="tests"]');
  if (!backendWrap || !frontendWrap || !testsWrap) return;

  function getPos(el) {
    const n = el.querySelector('.node') || el;
    const nr = n.getBoundingClientRect();
    return {
      cx: nr.left + nr.width/2 - rect.left,
      cy: nr.top + nr.height/2 - rect.top,
      bottom: nr.bottom - rect.top,
      top: nr.top - rect.top
    };
  }

  const backend = getPos(backendWrap);
  const frontend = getPos(frontendWrap);
  const tests = getPos(testsWrap);

  // Lead position (relative to container)
  let leadBottom = 0; // top of container = bottom of lead
  let leadCx = w / 2;
  if (leadNode) {
    const lr = leadNode.getBoundingClientRect();
    leadBottom = lr.bottom - rect.top;
    leadCx = lr.left + lr.width/2 - rect.left;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('tri-svg');
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:0';

  function addEdge(x1, y1, x2, y2, delay, color1, color2) {
    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'var(--border)');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);

    // Dot forward
    const d1 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    d1.setAttribute('r', '4'); d1.setAttribute('fill', color1);
    const m1 = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
    m1.setAttribute('dur', '2.5s'); m1.setAttribute('repeatCount', 'indefinite');
    m1.setAttribute('begin', delay + 's');
    m1.setAttribute('path', `M${x1},${y1} L${x2},${y2}`);
    d1.appendChild(m1); svg.appendChild(d1);

    // Dot return
    const d2 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    d2.setAttribute('r', '4'); d2.setAttribute('fill', color2);
    const m2 = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
    m2.setAttribute('dur', '2.5s'); m2.setAttribute('repeatCount', 'indefinite');
    m2.setAttribute('begin', (delay + 1.3) + 's');
    m2.setAttribute('path', `M${x2},${y2} L${x1},${y1}`);
    d2.appendChild(m2); svg.appendChild(d2);
  }

  // Lead → Tests (vertical-ish, center)
  addEdge(leadCx, leadBottom, tests.cx, tests.top, 1.0, 'var(--accent)', 'var(--accent4)');

  // Backend → Tests (diagonal left)
  addEdge(backend.cx, backend.bottom, tests.cx - 30, tests.top, 0.0, 'var(--accent3)', 'var(--accent4)');

  // Frontend → Tests (diagonal right)
  addEdge(frontend.cx, frontend.bottom, tests.cx + 30, tests.top, 0.6, 'var(--accent3)', 'var(--accent4)');

  container.appendChild(svg);
}

// Draw triangle edges when visible
const triObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) setTimeout(drawTriangleEdges, 300);
  });
}, { threshold: 0.3 });
const triEl = document.getElementById('teamTriangle');
if (triEl) triObs.observe(triEl);

// Redraw on resize
window.addEventListener('resize', () => {
  clearTimeout(dagResizeTimer);
  dagResizeTimer = setTimeout(() => { drawDagEdges(); drawTriangleEdges(); }, 150);
});

setTimeout(drawTriangleEdges, 600);

// ===== STAT COUNTER ANIMATION =====
const statObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.querySelectorAll('.stat').forEach((s, i) => {
        s.classList.add('animate-in');
        s.style.animationDelay = (i * 0.1) + 's';
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-row').forEach(el => statObs.observe(el));

// ===== PROMPT BUILDER =====
const promptElements = [true, false, false, false, false]; // initial state
const qualityLabels = ['Vague', 'Basic', 'Good', 'Strong', 'Expert'];
const qualityClasses = ['q1', 'q2', 'q3', 'q4', 'q5'];

function togglePromptEl(el, idx) {
  promptElements[idx] = !promptElements[idx];
  el.classList.toggle('active', promptElements[idx]);
  updatePromptPreview();
}

function updatePromptPreview() {
  const sections = document.querySelectorAll('#promptPreview .pp-section');
  sections.forEach((s, i) => {
    s.classList.toggle('visible', promptElements[i]);
    s.classList.toggle('hidden', !promptElements[i]);
  });
  const count = promptElements.filter(Boolean).length;
  const fill = document.getElementById('qmFill');
  const label = document.getElementById('qmLabel');
  if (fill && label) {
    fill.className = 'qm-fill ' + qualityClasses[Math.max(0, count - 1)];
    label.textContent = qualityLabels[Math.max(0, count - 1)];
  }
}

// ===== DEBUGGING FLOWCHART =====
function toggleFcNode(el, idx) {
  // Close all others
  document.querySelectorAll('.fc-node').forEach(n => n.classList.remove('fc-active'));
  document.querySelectorAll('.fc-detail').forEach(d => d.classList.remove('open'));
  // Open this one
  el.classList.add('fc-active');
  const detail = document.getElementById('fcDetail' + idx);
  if (detail) detail.classList.add('open');
}

// ===== DECISION TREE =====
let dtState = { level1: null, level2: null };

function selectDt(level, choice) {
  if (level === 1) {
    dtState = { level1: choice, level2: null };
    // Highlight selected, dim others
    document.querySelectorAll('#dtLevel1 .dt-node').forEach(n => {
      n.classList.remove('dt-selected', 'dt-dimmed');
    });
    const nodeMap = { solo: 'dt-1a', sub: 'dt-1b', team: 'dt-1c' };
    document.getElementById(nodeMap[choice]).classList.add('dt-selected');
    Object.keys(nodeMap).forEach(k => {
      if (k !== choice) document.getElementById(nodeMap[k]).classList.add('dt-dimmed');
    });

    // If solo, skip to result
    if (choice === 'solo') {
      document.getElementById('dtConn2').style.opacity = '0';
      document.getElementById('dtLevel2').style.opacity = '0';
      document.getElementById('dtLevel2').style.pointerEvents = 'none';
      document.getElementById('dtConn3').style.opacity = '1';
      showDtResult('solo');
    } else {
      // Show level 2
      document.getElementById('dtConn2').style.opacity = '1';
      document.getElementById('dtLevel2').style.opacity = '1';
      document.getElementById('dtLevel2').style.pointerEvents = 'auto';
      document.getElementById('dtConn3').style.opacity = '0';
      hideDtResults();
      // Reset level 2 nodes
      document.querySelectorAll('#dtLevel2 .dt-node').forEach(n => {
        n.classList.remove('dt-selected', 'dt-dimmed');
      });
    }
  } else if (level === 2) {
    dtState.level2 = choice;
    document.querySelectorAll('#dtLevel2 .dt-node').forEach(n => n.classList.remove('dt-selected', 'dt-dimmed'));
    const nodeMap2 = { 'no-coord': 'dt-2a', 'coord': 'dt-2b' };
    document.getElementById(nodeMap2[choice]).classList.add('dt-selected');
    Object.keys(nodeMap2).forEach(k => {
      if (k !== choice) document.getElementById(nodeMap2[k]).classList.add('dt-dimmed');
    });

    document.getElementById('dtConn3').style.opacity = '1';
    if (choice === 'no-coord') {
      showDtResult('subagents');
    } else {
      showDtResult('team');
    }
  }
}

function showDtResult(type) {
  const level3 = document.getElementById('dtLevel3');
  level3.style.opacity = '1';
  level3.style.pointerEvents = 'auto';
  // Hide all results, show selected
  document.querySelectorAll('.dt-result').forEach(r => {
    r.classList.remove('dt-visible', 'dt-pulse');
  });
  const result = document.getElementById('dtResult' + type.charAt(0).toUpperCase() + type.slice(1));
  if (result) {
    setTimeout(() => {
      result.classList.add('dt-visible');
      setTimeout(() => result.classList.add('dt-pulse'), 300);
    }, 200);
  }
}

function hideDtResults() {
  const level3 = document.getElementById('dtLevel3');
  level3.style.opacity = '0';
  level3.style.pointerEvents = 'none';
  document.querySelectorAll('.dt-result').forEach(r => r.classList.remove('dt-visible', 'dt-pulse'));
}

function resetDecisionTree() {
  dtState = { level1: null, level2: null };
  document.querySelectorAll('#decisionTree .dt-node:not(.dt-start)').forEach(n => {
    n.classList.remove('dt-selected', 'dt-dimmed');
  });
  document.getElementById('dtConn2').style.opacity = '0';
  document.getElementById('dtConn3').style.opacity = '0';
  document.getElementById('dtLevel2').style.opacity = '0';
  document.getElementById('dtLevel2').style.pointerEvents = 'none';
  hideDtResults();
}

// ===== SCALING CHART ANIMATION =====
const scaleObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      const line = document.getElementById('scaleLine');
      if (line) line.style.strokeDashoffset = '0';
      // Animate bottleneck cards
      document.querySelectorAll('#bottleneckGrid .bottleneck-card').forEach(c => c.classList.add('visible'));
    }
  });
}, { threshold: 0.3 });
const scaleEl = document.getElementById('scaleChart');
if (scaleEl) scaleObs.observe(scaleEl);

// ===== GOTCHA ACCORDION =====
function toggleGotcha(card) {
  const wasExpanded = card.classList.contains('expanded');
  // Close all
  document.querySelectorAll('.card.expandable').forEach(c => c.classList.remove('expanded'));
  // Toggle this one
  if (!wasExpanded) card.classList.add('expanded');
}

// ===== MYTH VS REALITY TOGGLE =====
const mythData = {
  subagent: [
    { normal: '🆕 <strong>Fresh</strong> — own context (200K default, 1M with <code>[1m]</code> models)', myth: '<span class="myth-wrong">"Inherits parent context window"</span><div class="myth-right">Fresh 200K/1M — nothing carries over</div>' },
    { normal: '❌ None. Only gets the <code>prompt</code> string you pass', myth: '<span class="myth-wrong">"Sees my conversation history"</span><div class="myth-right">Only the prompt string you pass</div>' },
    { normal: '✅ Read from working directory automatically', myth: '✅ <span style="color:var(--accent4)">Correct — CLAUDE.md IS inherited</span>' },
    { normal: '✅ All parent tools by default (restrict via <code>tools</code>/<code>disallowedTools</code>)', myth: '✅ <span style="color:var(--accent4)">Correct — tools ARE inherited</span>' },
    { normal: '✅ All parent MCP tools inherited by default*', myth: '<span class="myth-wrong">"Background agents get MCP too"</span><div class="myth-right">Known bug: background agents can\'t access MCP</div>' },
    { normal: '✅ Auto-activated based on task relevance', myth: '<span class="myth-wrong">"Skills load lazily on demand"</span><div class="myth-right">Skills are FULL-injected at startup, consuming tokens</div>' },
    { normal: '🔀 <strong>Configurable per-agent</strong> — haiku/sonnet/opus', myth: '✅ <span style="color:var(--accent4)">Correct — model IS configurable</span>' },
    { normal: '✅ Inherits parent\'s permission mode', myth: '✅ <span style="color:var(--accent4)">Correct — permissions ARE inherited</span>' },
    { normal: '✅ First 200 lines loaded if <code>memory_scope</code> set', myth: '<span class="myth-wrong">"Full memory available"</span><div class="myth-right">Only first 200 lines of MEMORY.md</div>' },
    { normal: '❌ Same working directory as parent', myth: '<span class="myth-wrong">"Each agent gets its own branch"</span><div class="myth-right">Shared dir — use isolation: "worktree" for safety</div>' },
  ]
};
let mythActive = false;

function toggleMythView(showMyth) {
  mythActive = showMyth;
  const btns = document.querySelectorAll('#mythToggle button');
  btns[0].classList.toggle('active', !showMyth);
  btns[1].classList.toggle('active', showMyth);

  // Update subagent table cells
  const tables = document.getElementById('inheritanceTables');
  if (!tables) return;
  const subTable = tables.querySelector('.cmp-table');
  if (!subTable) return;
  const rows = subTable.querySelectorAll('tbody tr, tr:not(:first-child)');
  rows.forEach((row, i) => {
    const cell = row.querySelectorAll('td')[1];
    if (!cell || !mythData.subagent[i]) return;
    cell.innerHTML = showMyth ? mythData.subagent[i].myth : mythData.subagent[i].normal;
  });
}

// ===== MESSAGE DETAIL =====
const msgTemplates = {
  'task-assign': `<span style="color:#6c7086">// ~/.claude/teams/project/inboxes/backend.json</span>
{
  <span style="color:#89b4fa">"from"</span>: <span style="color:#a6e3a1">"lead"</span>,
  <span style="color:#89b4fa">"to"</span>: <span style="color:#a6e3a1">"backend"</span>,
  <span style="color:#89b4fa">"type"</span>: <span style="color:#cba6f7">"task_assignment"</span>,
  <span style="color:#89b4fa">"content"</span>: <span style="color:#a6e3a1">"Build REST API for /api/users. Include GET, POST, PUT, DELETE. Use existing auth middleware."</span>,
  <span style="color:#89b4fa">"taskId"</span>: <span style="color:#fab387">"2"</span>,
  <span style="color:#89b4fa">"timestamp"</span>: <span style="color:#a6e3a1">"2026-03-26T10:30:00Z"</span>
}`,
  'status-update': `<span style="color:#6c7086">// Status update from teammate</span>
{
  <span style="color:#89b4fa">"from"</span>: <span style="color:#a6e3a1">"backend"</span>,
  <span style="color:#89b4fa">"to"</span>: <span style="color:#a6e3a1">"lead"</span>,
  <span style="color:#89b4fa">"type"</span>: <span style="color:#cba6f7">"status_update"</span>,
  <span style="color:#89b4fa">"content"</span>: <span style="color:#a6e3a1">"6/12 endpoints done. Blocked on auth middleware types."</span>,
  <span style="color:#89b4fa">"taskId"</span>: <span style="color:#fab387">"2"</span>,
  <span style="color:#89b4fa">"progress"</span>: <span style="color:#fab387">50</span>
}`,
  'question': `<span style="color:#6c7086">// Peer-to-peer question</span>
{
  <span style="color:#89b4fa">"from"</span>: <span style="color:#a6e3a1">"frontend"</span>,
  <span style="color:#89b4fa">"to"</span>: <span style="color:#a6e3a1">"backend"</span>,
  <span style="color:#89b4fa">"type"</span>: <span style="color:#cba6f7">"question"</span>,
  <span style="color:#89b4fa">"content"</span>: <span style="color:#a6e3a1">"What's the response shape for GET /api/users/:id? Need it for the profile component."</span>,
  <span style="color:#89b4fa">"priority"</span>: <span style="color:#a6e3a1">"high"</span>
}`,
  'result': `<span style="color:#6c7086">// Task completion result</span>
{
  <span style="color:#89b4fa">"from"</span>: <span style="color:#a6e3a1">"backend"</span>,
  <span style="color:#89b4fa">"to"</span>: <span style="color:#a6e3a1">"lead"</span>,
  <span style="color:#89b4fa">"type"</span>: <span style="color:#cba6f7">"result"</span>,
  <span style="color:#89b4fa">"content"</span>: <span style="color:#a6e3a1">"API complete. 12 endpoints, full CRUD + search. All tests passing."</span>,
  <span style="color:#89b4fa">"taskId"</span>: <span style="color:#fab387">"2"</span>,
  <span style="color:#89b4fa">"filesChanged"</span>: <span style="color:#fab387">8</span>
}`
};

function showMsgDetail(type) {
  const panel = document.getElementById('msgDetailPanel');
  const content = document.getElementById('msgDetailContent');
  if (!panel || !content) return;
  if (panel.classList.contains('open') && content.dataset.type === type) {
    panel.classList.remove('open');
    return;
  }
  content.innerHTML = msgTemplates[type] || '';
  content.dataset.type = type;
  panel.classList.add('open');
}

// ===== COPY BUTTONS ON CODE BLOCKS =====
document.querySelectorAll('.code-block, .code').forEach(block => {
  const btn = document.createElement('button');
  btn.className = 'code-copy-btn';
  btn.textContent = 'Copy';
  btn.onclick = function(e) {
    e.stopPropagation();
    const codeBody = block.querySelector('.code-body') || block;
    const text = codeBody.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    });
  };
  block.style.position = 'relative';
  block.appendChild(btn);
});

// ===== KEYBOARD OVERLAY =====
const kbdOverlay = document.createElement('div');
kbdOverlay.className = 'kbd-overlay';
kbdOverlay.innerHTML = `<div class="kbd-modal">
  <h3>Keyboard Shortcuts</h3>
  <div class="kbd-row"><div class="key-combo"><span class="key">↑</span><span class="key">↓</span></div><div class="key-desc">Navigate slides</div></div>
  <div class="kbd-row"><div class="key-combo"><span class="key">←</span><span class="key">→</span></div><div class="key-desc">Navigate slides</div></div>
  <div class="kbd-row"><div class="key-combo"><span class="key">t</span></div><div class="key-desc">Toggle sidebar</div></div>
  <div class="kbd-row"><div class="key-combo"><span class="key">?</span></div><div class="key-desc">Toggle this help</div></div>
  <div class="kbd-row"><div class="key-combo"><span class="key">Esc</span></div><div class="key-desc">Close overlay</div></div>
</div>`;
document.body.appendChild(kbdOverlay);
kbdOverlay.addEventListener('click', (e) => {
  if (e.target === kbdOverlay) kbdOverlay.classList.remove('visible');
});

document.addEventListener('keydown', (e) => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    kbdOverlay.classList.toggle('visible');
  }
  if (e.key === 'Escape') kbdOverlay.classList.remove('visible');
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !kbdOverlay.classList.contains('visible')) {
    toggleSidebar();
  }
});

// ===== ANIMATED STAT COUNTERS =====
function animateCounter(el, target, prefix, suffix, duration) {
  const start = performance.now();
  const numTarget = parseFloat(target);
  const isFloat = target.includes('.');
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = numTarget * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting && !en.target.dataset.counted) {
      en.target.dataset.counted = 'true';
      en.target.querySelectorAll('.num[data-count]').forEach((num, i) => {
        setTimeout(() => {
          const val = num.dataset.count;
          const prefix = num.dataset.prefix || '';
          const suffix = num.dataset.suffix || '';
          animateCounter(num, val, prefix, suffix, 1000);
        }, i * 150);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-row').forEach(el => counterObs.observe(el));

// ===== QUIZ LOGIC =====
const quizCorrect = [1, 2, 1, 2, 2]; // B, C, B, C, C — correct option index per question
const quizVerdicts = [
  "Were you browsing memes? That's 0/5. The agents are judging you. Scroll back up, we believe in second chances.",
  "1 out of 5... even a subagent with zero context could guess better. Time to re-read the slides!",
  "You got the vibes but not the architecture. Like knowing Git exists but typing 'git yolo' every time.",
  "3/5 \u2014 decent! You won't accidentally spawn 47 agents. Probably. Maybe re-read the worktree slide though.",
  "4/5 \u2014 one slip away from perfection. You clearly paid attention. Your agents would be proud.",
  "5/5 \u2014 flawless. You know more about agent architecture than most agents know about themselves."
];
const quizVerdictColors = ['var(--red)','var(--red)','var(--orange)','var(--orange)','var(--accent)','var(--accent4)'];
let quizScore = 0;
let quizAnswered = new Array(5).fill(false);

function quizAnswer(qIdx, optIdx) {
  if (quizAnswered[qIdx]) return;
  quizAnswered[qIdx] = true;
  const card = document.querySelector('.quiz-card[data-q="' + qIdx + '"]');
  const opts = card.querySelectorAll('.quiz-opt');
  const isCorrect = optIdx === quizCorrect[qIdx];

  opts.forEach((o, i) => {
    o.classList.add('disabled');
    if (i === quizCorrect[qIdx]) o.classList.add('correct');
    if (i === optIdx && !isCorrect) o.classList.add('wrong-pick');
  });

  if (isCorrect) quizScore++;
  document.getElementById('quizScore').textContent = 'Score: ' + quizScore + ' / 5';

  // Update dot
  const dots = document.querySelectorAll('.quiz-dot');
  dots[qIdx].classList.remove('active');
  dots[qIdx].classList.add(isCorrect ? 'done' : 'wrong');

  // Show feedback + next button
  document.getElementById('quizFb' + qIdx).classList.add('show');
  card.querySelector('.quiz-next').classList.add('show');
}

function quizNext(qIdx) {
  const cards = document.querySelectorAll('.quiz-card');
  cards.forEach(function(c) { c.classList.remove('active'); });

  if (qIdx < 4) {
    cards[qIdx + 1].classList.add('active');
    var dots = document.querySelectorAll('.quiz-dot');
    dots[qIdx + 1].classList.add('active');
  } else {
    // Show verdict
    document.getElementById('quizVerdict').classList.add('active');
    document.getElementById('quizFinalScore').textContent = quizScore + '/5';
    document.getElementById('quizFinalScore').style.color = quizVerdictColors[quizScore];
    document.getElementById('quizVerdictMsg').textContent = quizVerdicts[quizScore];
  }
}

function quizReset() {
  quizScore = 0;
  quizAnswered.fill(false);
  document.getElementById('quizScore').textContent = 'Score: 0 / 5';
  var cards = document.querySelectorAll('.quiz-card');
  cards.forEach(function(c, i) {
    c.classList.remove('active');
    if (i === 0) c.classList.add('active');
    c.querySelectorAll('.quiz-opt').forEach(function(o) {
      o.classList.remove('disabled', 'correct', 'wrong-pick');
    });
    var fb = document.getElementById('quizFb' + i);
    if (fb) fb.classList.remove('show');
    var btn = c.querySelector('.quiz-next');
    if (btn) btn.classList.remove('show');
  });
  var dots = document.querySelectorAll('.quiz-dot');
  dots.forEach(function(d, i) {
    d.classList.remove('active', 'done', 'wrong');
    if (i === 0) d.classList.add('active');
  });
}
// ── Lightbox ──
(function(){
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Image preview');
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Close preview">&times;</button><img alt="">';
  document.body.appendChild(overlay);

  var lbImg = overlay.querySelector('img');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var prevFocus = null;

  function openLightbox(src, alt){
    lbImg.src = src;
    lbImg.alt = alt || '';
    prevFocus = document.activeElement;
    overlay.classList.add('open');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if(prevFocus) prevFocus.focus();
  }

  document.querySelectorAll('.slide-inner img').forEach(function(img){
    img.setAttribute('tabindex','0');
    img.setAttribute('role','button');
    img.setAttribute('aria-label','Click to enlarge image');
    img.addEventListener('click',function(){ openLightbox(this.src, this.alt); });
    img.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLightbox(this.src, this.alt); }});
  });

  overlay.addEventListener('click',function(e){ if(e.target===overlay) closeLightbox(); });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && overlay.classList.contains('open')) closeLightbox(); });
})();

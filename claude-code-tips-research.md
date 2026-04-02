# Claude Code Tips, Tricks & Best Practices - Research Compilation
## For Technical Presentation on Multi-Agent Orchestration

---

## 1. CLAUDE.md CONFIGURATION MASTERY

### Core Principles (from HumanLayer Blog + Official Docs)

**Keep it short and focused:**
- Target under 300 lines; HumanLayer's production file is "less than sixty lines"
- Claude Code's system prompt already contains ~50 instructions; frontier LLMs reliably follow ~150-200 instructions total
- LLMs bias toward content at prompt peripheries (beginning and end); as instruction count rises, quality decreases uniformly
- "For each line, ask: 'Would removing this cause Claude to make mistakes?' If not, cut it."

**Structure: WHY, WHAT, HOW:**
- WHAT: Tech stack, project structure, codebase map
- WHY: Project purpose and component functions
- HOW: Work procedures, command preferences, verification methods

**Critical insight: Claude often ignores CLAUDE.md content!**
Claude Code injects a system reminder stating: "this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task." Only universally applicable instructions survive this filter.

**Progressive Disclosure Strategy:**
Store task-specific instructions in separate markdown files:
```
agent_docs/
  |- building_the_project.md
  |- running_tests.md
  |- code_conventions.md
  |- service_architecture.md
```
In CLAUDE.md, list these files with brief descriptions. Claude reads on demand.

**Prefer references over copies:**
Use `file:line` pointers to authoritative locations rather than copying code snippets (which become outdated).

**Anti-pattern: Auto-generation.**
Avoid `/init` for production CLAUDE.md. This is "the highest leverage point of the harness" -- each line compounds impact across all workflows.

**Anti-pattern: Linting instructions.**
"Never send an LLM to do a linter's job. LLMs are comparably expensive and incredibly slow compared to traditional linters and formatters."

**Import syntax for CLAUDE.md:**
```markdown
See @README.md for project overview and @package.json for available npm commands.
# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

**Emphasis for adherence:**
Add "IMPORTANT" or "YOU MUST" to improve instruction following on critical rules.

**Wrap domain rules in conditional tags (from shanraisshan repo):**
```xml
<important if="working with database">
Always use parameterized queries
</important>
```

Sources:
- [Writing a good CLAUDE.md - HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Official Best Practices](https://code.claude.com/docs/en/best-practices)
- [Using CLAUDE.MD files - Anthropic Blog](https://claude.com/blog/using-claude-md-files)
- [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)

---

## 2. MULTI-AGENT ORCHESTRATION PATTERNS

### Subagents vs. Agent Teams (Official Docs)

| Aspect | Subagents | Agent Teams |
|--------|-----------|-------------|
| Context | Own window; results return to caller | Own window; fully independent |
| Communication | Report back to main agent only | Teammates message each other directly |
| Coordination | Main agent manages all work | Shared task list with self-coordination |
| Best for | Focused tasks where only result matters | Complex work requiring discussion |
| Token cost | Lower: results summarized back | Higher: each teammate is separate instance |

### Agent Team Architecture
- **Team lead**: Main session that creates team, spawns teammates, coordinates
- **Teammates**: Separate Claude Code instances working on assigned tasks
- **Task list**: Shared work items that teammates claim and complete
- **Mailbox**: Messaging system for inter-agent communication

### Display Modes
- **In-process**: All teammates in one terminal; Shift+Down to cycle between them
- **Split panes (tmux)**: Each teammate in own pane; configure with `"teammateMode": "tmux"` in settings.json

### 30 Tips for Agent Teams (John Kim - getpushtoprod)

**Structure:**
- Keep teams small: 3-5 teammates is the sweet spot
- 5-6 tasks per teammate keeps everyone productive
- Don't let agents touch the same files -- separate by domain/directory

**Planning:**
- Plan-first is non-negotiable; without plans, agents "go off in random directions and waste tokens"
- Enforce strict template: plan mode, no code, fixed output file, end with "READY FOR APPROVAL"
- Use delegate mode: tell the lead to wait and delegate rather than implement itself

**Quality:**
- Tell the orchestrator what quality bar you expect -- trickles down to all subagents
- Use `TeammateIdle` and `TaskCompleted` hook events for quality gates
- Start with read-only tasks (research, review) before implementation

**Best Use Cases:**
1. Parallel code review (security, performance, test coverage -- independent reviewers)
2. Competing hypotheses for debugging (5 agents, each pursuing different theory)
3. New modules/features (each teammate owns separate piece)
4. Cross-layer coordination (frontend, backend, tests)

**Key Quote:** "This is so much like real project management - you're literally orchestrating a team of engineers."

### Swarm Orchestration Patterns (Kieran Klaassen gist)

**Six Core Patterns:**
1. **Parallel Specialists**: Multiple agents review simultaneously (security, performance, simplicity)
2. **Sequential Pipeline**: Research -> Plan -> Implement -> Test -> Review with auto-dependencies
3. **Self-Organizing Swarm**: Workers grab tasks from pool; natural load-balancing
4. **Research Then Implement**: Synchronous research findings feed implementation
5. **Plan Approval Workflow**: Require human/leader approval before execution
6. **Coordinated Multi-File Refactoring**: Multiple workers own separate files with shared dependencies

**Built-in Agent Types:**
- Explore: Read-only, Haiku-optimized for fast analysis
- Plan: Architecture and design (read-only)
- general-purpose: Full capabilities for complex tasks

### Running 10+ Instances in Parallel (DEV Community)

**Architecture:** Meta-agent coordinator + specialized worker agents + Redis task queues

**File Locking Strategy:** Redis SET with NX flag and 5-minute TTLs. If lock fails, exponential backoff retry.

**Real-World Results:** Frontend refactoring of 12,000+ lines (class to functional components):
- 2 hours vs. estimated 2 days manual work
- 6 specialized workers
- 100% test coverage maintained
- 0 file conflicts

**Resource Management:**
- Container orchestration (Docker) with CPU/memory limits
- API rate limiting essential for Claude quota management
- Observability dashboard (Vue.js) with real-time agent status, task progress, file lock visualization

Sources:
- [Official Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [30 Tips for Agent Teams](https://getpushtoprod.substack.com/p/30-tips-for-claude-code-agent-teams)
- [Swarm Orchestration Skill](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)
- [Multi-Agent Orchestration Part 3](https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da)

---

## 3. CUSTOM SUBAGENTS

### Definition Format (Official Docs)
Subagents are Markdown files with YAML frontmatter stored in `.claude/agents/` (project) or `~/.claude/agents/` (user).

```markdown
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
permissionMode: default
memory: project
isolation: worktree
maxTurns: 50
skills:
  - api-conventions
  - error-handling-patterns
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
---

You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```

### Key Frontmatter Fields
- `name` (required): Unique identifier
- `description` (required): When Claude should delegate
- `tools`: Allowlist (Read, Glob, Grep, Bash, Edit, Write, Agent, etc.)
- `disallowedTools`: Denylist (removes from inherited set)
- `model`: `sonnet`, `opus`, `haiku`, full model ID, or `inherit`
- `permissionMode`: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`
- `memory`: `user`, `project`, or `local` for persistent cross-session learning
- `isolation`: `worktree` for isolated git worktree per subagent
- `maxTurns`: Maximum agentic turns
- `skills`: Skills to preload into context
- `mcpServers`: Scoped MCP servers (inline definitions or name references)
- `hooks`: Lifecycle hooks scoped to this subagent
- `background`: `true` to always run as background task
- `effort`: `low`, `medium`, `high`, `max`
- `initialPrompt`: Auto-submitted first user turn when running as main agent

### Persistent Memory
When `memory` is enabled, the subagent gets:
- A memory directory (e.g., `.claude/agent-memory/<name>/`)
- First 200 lines of `MEMORY.md` injected into system prompt
- Instructions to curate MEMORY.md if it exceeds 200 lines
- Read, Write, Edit tools automatically enabled

### CLI-Defined Subagents (for automation)
```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

### Running as Main Agent
```bash
claude --agent code-reviewer
```
Or set as default in `.claude/settings.json`:
```json
{ "agent": "code-reviewer" }
```

### Restricting Subagent Spawning
```yaml
tools: Agent(worker, researcher), Read, Bash
```
Only `worker` and `researcher` subagents can be spawned.

Sources:
- [Official Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)

---

## 4. HOOKS SYSTEM

### All Hook Events (Official Docs)

| Event | When | Can Block? |
|-------|------|-----------|
| SessionStart | Session begins/resumes | No |
| UserPromptSubmit | Prompt submitted, before processing | Yes |
| PreToolUse | Before tool call | Yes (exit 2) |
| PermissionRequest | Permission dialog appears | Yes |
| PostToolUse | After tool call succeeds | No |
| PostToolUseFailure | After tool call fails | No |
| Notification | Claude sends notification | No |
| SubagentStart | Subagent spawned | No |
| SubagentStop | Subagent finishes | No |
| Stop | Claude finishes responding | Yes (forces continue) |
| StopFailure | Turn ends due to API error | No |
| TeammateIdle | Agent team teammate about to go idle | Yes |
| TaskCompleted | Task being marked complete | Yes |
| InstructionsLoaded | CLAUDE.md or rules file loaded | No |
| ConfigChange | Config file changes during session | Yes |
| CwdChanged | Working directory changes | No |
| FileChanged | Watched file changes on disk | No |
| WorktreeCreate | Worktree being created | Yes |
| WorktreeRemove | Worktree being removed | No |
| PreCompact | Before context compaction | No |
| PostCompact | After context compaction | No |
| Elicitation | MCP server requests user input | No |
| SessionEnd | Session terminates | No |

### Hook Types
1. **command**: Run shell command (default)
2. **prompt**: Single-turn LLM evaluation (uses Haiku by default)
3. **agent**: Multi-turn verification with tool access (up to 50 turns)
4. **http**: POST event data to HTTP endpoint

### Practical Hook Examples

**Auto-format with Prettier after edits:**
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

**Block edits to protected files (.env, package-lock.json, .git/):**
```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done
exit 0
```

**Re-inject context after compaction:**
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "compact",
      "hooks": [{
        "type": "command",
        "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
      }]
    }]
  }
}
```

**Desktop notifications when Claude needs input:**
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```

**Block rm -rf (Trail of Bits):**
Configured in settings.json, suggests `macos-trash` instead.

**Block push to main (Trail of Bits):**
Requires feature branches.

**Bash command logging:**
```json
{
  "PostToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "jq -r '[\"[\" + (now | todate) + \"] \" + .tool_input.command' >> ~/.claude/bash-commands.log"
    }]
  }]
}
```

**Anti-Rationalization Gate (Trail of Bits Stop hook):**
Uses a prompt-based hook that sends Claude's response to Haiku to detect incomplete work excuses before allowing completion.

**Agent-based hook for test verification:**
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "agent",
        "prompt": "Verify that all unit tests pass. Run the test suite and check the results.",
        "timeout": 120
      }]
    }]
  }
}
```

**Auto-approve ExitPlanMode:**
```json
{
  "hooks": {
    "PermissionRequest": [{
      "matcher": "ExitPlanMode",
      "hooks": [{
        "type": "command",
        "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PermissionRequest\", \"decision\": {\"behavior\": \"allow\"}}}'"
      }]
    }]
  }
}
```

**Environment Variables Available to Hooks:**
- `CLAUDE_PROJECT_DIR` - Current project directory
- `CLAUDE_FILE_PATHS` - Files being modified
- `CLAUDE_TOOL_INPUT` - Tool parameters (JSON)

Sources:
- [Official Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Trail of Bits Claude Code Config](https://github.com/trailofbits/claude-code-config)
- [DataCamp Hooks Tutorial](https://www.datacamp.com/tutorial/claude-code-hooks)
- [Steve Kinney Hook Examples](https://stevekinney.com/courses/ai-development/claude-code-hook-examples)

---

## 5. SKILLS SYSTEM

### Why Skills > MCP (Simon Willison's Argument)

Skills are "maybe a bigger deal than MCP" because:
- MCP is a "whole protocol specification" consuming "tens of thousands of tokens of context"
- Skills take "a few dozen extra tokens" per skill in initial scanning
- Skills "outsource the hard parts to the LLM harness and the associated computer environment"
- Skills leverage what LLMs already know (filesystem navigation, command execution)
- Skills work cross-model: "point Codex CLI or Gemini CLI at skills folders"

### On-Demand Loading Architecture
1. At startup, only metadata (name + description) from all Skills is pre-loaded
2. Claude reads SKILL.md only when the Skill becomes relevant
3. Additional files referenced by SKILL.md are read only as needed
4. Zero tokens consumed by unused skills

### Skill Definition
```markdown
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Search the codebase for relevant files
3. Implement the necessary changes
4. Write and run tests to verify
5. Create a descriptive commit message
6. Push and create a PR
```

Use `disable-model-invocation: true` for workflows with side effects that should only be triggered manually.

### Skills vs. CLAUDE.md vs. Slash Commands vs. Subagents

| Feature | Loaded When | Context Cost | Use For |
|---------|-------------|-------------|---------|
| CLAUDE.md | Every session | Always present | Universal project rules |
| Skills | On-demand | Only when relevant | Domain knowledge, workflows |
| Slash Commands | User invokes | Only when used | Reusable prompt templates |
| Subagents | When delegated | Separate context | Isolated tasks |

Sources:
- [Simon Willison - Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Official Skills Docs](https://code.claude.com/docs/en/skills)
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)

---

## 6. MCP SERVER SETUPS

### Configuration Scopes
- User scope (global): `claude mcp add github -s user`
- Local scope (project): `claude mcp add postgres -s local`
- Project scope (team-shared): `claude mcp add figma -s project`

### Essential MCP Servers
1. **GitHub**: Repository ops, PRs, issues, code search
2. **Playwright**: Browser testing/automation; better than Puppeteer for Claude Code
3. **PostgreSQL/Supabase**: Direct data access, schema exploration
4. **Sentry**: Error monitoring data, production error queries
5. **Figma**: Bridge design and development
6. **Context7**: Current library documentation (no API key needed)
7. **Exa**: Web and code search

### Advanced Configuration
```bash
# Import from Claude Desktop
claude mcp add-from-claude-desktop

# Debug mode
claude --mcp-debug

# Token limit for MCP output
export MAX_MCP_OUTPUT_TOKENS=50000

# Custom JSON config
claude mcp add-json custom-server '{"type":"stdio","command":"npx","args":["-y","@custom/server"]}'
```

### MCP in Subagents (Scoped Servers)
```yaml
---
name: browser-tester
description: Tests features using Playwright
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github  # references already-configured server
---
```
Inline servers connect when subagent starts, disconnect when it finishes. Keeps MCP tools out of main context.

### Tool Search
Leave Tool Search on auto for multi-server setups -- "the feature that made multi-server setups practical."

Sources:
- [Official MCP Docs](https://code.claude.com/docs/en/mcp)
- [Configuring MCP - Scott Spence](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code)
- [Builder.io MCP Guide](https://www.builder.io/blog/claude-code-mcp-servers)

---

## 7. COST OPTIMIZATION

### Key Strategies

**Model Selection:**
- Start every session with Sonnet; switch to Opus only for deep analysis/complex refactoring
- Use `CLAUDE_CODE_SUBAGENT_MODEL` to route subagents to cheaper models
- Strategic model selection can cut costs by 70%

**Context Management:**
- `/clear` between unrelated tasks (permanently deletes history; save context to CLAUDE.md first)
- `/compact` to summarize conversation; can customize: `/compact Focus on API changes`
- Target 60% context utilization, well before ~80% auto-compact threshold
- Compact every 30-45 minutes of active work
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` controls when auto-compaction fires (1-100)

**Extended Thinking:**
- Cap thinking tokens: `MAX_THINKING_TOKENS=10000` (diminishing returns beyond 10k for routine tasks)

**Subagents for Context Efficiency:**
- Delegate exploration to subagents; verbose output stays in subagent context, only summaries return
- Use Explore subagent (Haiku) for read-only analysis
- Use general-purpose subagent only when both exploration and modification needed

**Cost Estimates:**
- Average: $6/developer/day
- 90th percentile: below $12/day
- Without cost-conscious habits: $20-40/day
- Use `/cost` to check API token usage

### Side Questions with /btw
Use `/btw` for quick questions that don't need to stay in context. Answer appears in dismissible overlay, never enters conversation history.

Sources:
- [Official Cost Management](https://code.claude.com/docs/en/costs)
- [Token Optimization 60%](https://medium.com/@jpranav97/stop-wasting-tokens-how-to-optimize-claude-code-context-by-60-bfad6fd477e5)
- [How to Optimize Token Usage](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/)

---

## 8. HEADLESS MODE & CI/CD AUTOMATION

### Basic Usage
```bash
claude -p "Explain what this project does"
claude -p "List all API endpoints" --output-format json
claude -p "Analyze this log file" --output-format stream-json
```

### Fan-Out Pattern for Migrations
```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

### GitHub Actions Integration
- `@claude` mention in any PR/issue triggers analysis
- `anthropics/claude-code-action` official GitHub Action
- 60%+ of CI teams use GitHub Actions integration
- Reduces average code review time by 45% on 50k+ line projects

### Security
- Always restrict `--allowedTools` in CI
- Use GitHub Secrets for API keys
- Consider `--permission-mode auto` for unattended runs

Sources:
- [Official Headless Docs](https://code.claude.com/docs/en/headless)
- [GitHub Actions Docs](https://code.claude.com/docs/en/github-actions)
- [claude-code-action](https://github.com/anthropics/claude-code-action)

---

## 9. GIT WORKTREES FOR PARALLEL WORK

### Built-in Support
```bash
claude --worktree feature-auth   # creates isolated worktree + branch
```

### Behavior
- Each agent gets own worktree and works independently
- On exit with no changes: worktree and branch removed automatically
- On exit with changes: Claude prompts to keep or remove
- 3-5 parallel worktrees is practical upper bound

### In Subagents
```yaml
---
name: feature-worker
description: Works on features in isolation
isolation: worktree
---
```
Worktree automatically cleaned up when subagent finishes without changes.

### For /batch
`/batch` enables safe parallel execution through Git Worktree agent isolation and automatic PR creation.

Sources:
- [Official Common Workflows](https://code.claude.com/docs/en/common-workflows)
- [incident.io Blog](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees)

---

## 10. WORKFLOW & PRODUCTIVITY TIPS

### Planning Workflow (Official 4-Phase)
1. **Explore** (Plan Mode): Read files, answer questions without changes
2. **Plan** (Plan Mode): Create detailed implementation plan; Ctrl+G opens plan in editor
3. **Implement** (Normal Mode): Code against the plan with tests
4. **Commit**: Descriptive message + PR

### The Interview Pattern
```
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.
Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs.
Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```
Then start fresh session to execute spec with clean context.

### Writer/Reviewer Pattern
- Session A: Implement rate limiter
- Session B (fresh context): Review the implementation for edge cases, race conditions
- Session A: Address review feedback

### Keyboard Shortcuts
- `Esc`: Stop Claude mid-action (context preserved)
- `Esc + Esc` / `/rewind`: Open checkpoint menu to restore conversation + code state
- `Shift+Tab`: Toggle Plan Mode vs Normal Mode
- `Ctrl+G`: Open plan in text editor
- `Ctrl+B`: Background a running task
- `Ctrl+O`: Toggle verbose mode (see hook output)
- `Ctrl+T`: Toggle task list (agent teams)
- `Tab`: Filename autocompletion

### Session Management
```bash
claude --continue    # Resume most recent conversation
claude --resume      # Select from recent conversations
```
Use `/rename` to give sessions descriptive names.

### Prompting Techniques (from shanraisshan)
- "Grill me on these changes and don't make a PR until I pass your test"
- "Prove to me this works" with branch diffs
- After mediocre fixes: "Scrap this and implement the elegant solution"
- Paste the issue, say "fix" -- avoid micromanagement
- "Use subagents to investigate how our authentication system handles token refresh"

### Terminal Aliases
```bash
alias c='claude'
alias ch='claude --chrome'
alias claude-yolo="claude --dangerously-skip-permissions"
```

### Avoid Common Failure Patterns
1. **Kitchen sink session**: Multiple unrelated tasks in one session -> `/clear` between tasks
2. **Correction spiral**: >2 corrections -> `/clear` and write better initial prompt
3. **Over-specified CLAUDE.md**: Too long, rules get ignored -> prune ruthlessly
4. **Trust-then-verify gap**: Plausible output without edge cases -> always provide verification
5. **Infinite exploration**: Unbounded investigation fills context -> scope narrowly or use subagents

Sources:
- [Official Best Practices](https://code.claude.com/docs/en/best-practices)
- [45 Claude Code Tips](https://github.com/ykdojo/claude-code-tips)
- [shanraisshan Best Practice](https://github.com/shanraisshan/claude-code-best-practice)

---

## 11. SECURITY & SANDBOXING (Trail of Bits)

### Three-Layer Approach

**Layer 1: Built-in Sandbox (`/sandbox`)**
- OS-level isolation (Seatbelt on macOS, bubblewrap on Linux)
- Write access restricted to current directory
- Read access blocked for: SSH/GPG keys, AWS/Azure/Kube credentials, npm/PyPI tokens, Git credentials, shell configs, wallets

**Layer 2: Permission Deny Rules (settings.json)**
- Blocks: `~/.ssh/**`, `~/.aws/**`, `~/.npmrc`, `~/.git-credentials`
- Prevents shell config edits to block backdoor planting

**Layer 3: Devcontainer/Droplets**
- `trailofbits/claude-code-devcontainer`: Preconfigured with VS Code integration
- `trailofbits/dropkit`: Disposable DigitalOcean instances with Tailscale

**Key Setting:**
```json
{ "enableAllProjectMcpServers": false }
```
Prevents malicious MCP servers in compromised repos.

### Privacy Controls
```json
{
  "env": {
    "DISABLE_TELEMETRY": "1",
    "DISABLE_ERROR_REPORTING": "1",
    "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1"
  }
}
```

Sources:
- [Trail of Bits Config](https://github.com/trailofbits/claude-code-config)

---

## 12. ADVANCED / HIDDEN FEATURES

### Custom Status Line
Displays: model, directory, git branch, context usage (color-coded bar), cost, elapsed time, prompt cache hit rate.
```
[Opus 4.6] claude-code-config | main
[===========         ] 28% | $0.83 | 12m 34s  89% cache
```
Setup: Copy statusline.sh to `~/.claude/statusline.sh`

### Conversation History Search
Conversations stored in `~/.claude/projects/` as .jsonl files. Searchable via grep.

### The "thought" Keyword
Sets effort to high and triggers adaptive reasoning on Opus 4.6.

### /btw Side Questions
Quick questions without adding to context. Answer appears in overlay and is discarded.

### Using Gemini CLI as Claude Code's Minion
Create skills using tmux pattern to fetch content from sites Claude can't access (e.g., Reddit).

### Local Models via LM Studio
```bash
claude-local() {
  ANTHROPIC_BASE_URL=http://localhost:1234 \
  ANTHROPIC_AUTH_TOKEN=lmstudio \
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
  claude --model qwen/qwen3-coder-next "$@"
}
```
Recommended: Qwen3-Coder-Next (80B MoE, 3B active), requires 64GB+ unified memory.

### Slim Down System Prompt
Reduce system prompt size to preserve context space. Tools available in ykdojo/claude-code-tips for backing up, patching, and restoring system prompts.

### Auto Mode
Background safety classifier replaces manual permission prompts. Blocks scope escalation, unknown infrastructure, hostile-content-driven actions.
```bash
claude --permission-mode auto -p "fix all lint errors"
```

### New/Beta Features (from shanraisshan)
- **Channels**: Push events from Telegram/Discord into running sessions
- **Scheduled Tasks**: `/loop` (local, up to 3 days) and `/schedule` (cloud-based)
- **Voice Dictation**: `/voice` with 20-language support
- **Remote Control**: Continue sessions from any device via `/remote-control`
- **Code Review**: Multi-agent PR analysis via GitHub App

### SDK for Scripting
Three primary uses:
1. Massive parallel scripting for refactors
2. Building internal chat tools
3. Rapid agent prototyping

Sources:
- [45 Claude Code Tips](https://github.com/ykdojo/claude-code-tips)
- [Trail of Bits Config](https://github.com/trailofbits/claude-code-config)
- [How I Use Every Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [shanraisshan Best Practice](https://github.com/shanraisshan/claude-code-best-practice)
- [Hidden Tricks Guide](https://dev.to/holasoymalva/the-ultimate-claude-code-guide-every-hidden-trick-hack-and-power-feature-you-need-to-know-2l45)

---

## 13. REAL-WORLD PRODUCTION NUMBERS

- **80%+ of code changes** fully written by Claude Code in production teams (since Aug 2025)
- **40% productivity increase** reported on large projects (DEV Community)
- **$2.5B+ run-rate revenue** for Claude Code by Feb 2026
- **45% reduction** in average code review time on 50k+ line projects
- Claude Code generates **1.75x more logic errors** than human-written code -- every output must be verified
- Weekly active users doubled since January 2026

Sources:
- [Claude Code in Production - DEV Community](https://dev.to/dzianiskarviha/integrating-claude-code-into-production-workflows-lbn)
- [Bloomberg - Productivity Panic of 2026](https://www.bloomberg.com/news/articles/2026-02-26/ai-coding-agents-like-claude-code-are-fueling-a-productivity-panic-in-tech)

---

## 14. KEY REPOSITORIES & RESOURCES

| Resource | Stars/Impact | Focus |
|----------|-------------|-------|
| [ykdojo/claude-code-tips](https://github.com/ykdojo/claude-code-tips) | 45 tips | Beginner to advanced |
| [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | Comprehensive | Command-Agent-Skill orchestration |
| [trailofbits/claude-code-config](https://github.com/trailofbits/claude-code-config) | Security-focused | Sandboxing, hooks, privacy |
| [FlorianBruniaux/claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide) | Documentation | Beginner to power user |
| [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) | System prompts | All internal prompts exposed |
| [anthropics/skills](https://github.com/anthropics/skills) | Official | Public skill repository |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | Curated list | Subagent templates |
| [disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) | Tutorial | Hooks deep dive |

---

## 15. PRESENTATION-WORTHY QUOTES

> "This is so much like real project management - you're literally orchestrating a team of engineers." -- John Kim on Agent Teams

> "Skills are what give your agents Superpowers." -- Anthropic on Skills

> "Claude Code is poorly named. It's not purely a coding tool: it's a tool for general computer automation." -- Simon Willison

> "Domain expertise is the bottleneck, not the tool." -- ranthebuilder.cloud

> "Never send an LLM to do a linter's job." -- HumanLayer Blog

> "CLAUDE.md is the highest leverage point of the harness -- each line compounds impact across all workflows." -- HumanLayer Blog

> "Shoot and forget. Delegate fully and judge tools by final PR quality, not interaction style." -- sshh.io

> "Since August 2025, 80%+ of code changes were fully written by Claude Code." -- DEV Community production report

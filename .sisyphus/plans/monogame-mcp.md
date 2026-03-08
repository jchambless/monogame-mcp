# MonoGame MCP Server

## TL;DR

> **Quick Summary**: Build a TypeScript MCP server that gives AI agents deep MonoGame expertise — bundled API documentation, CLI tool integration (project creation, content pipeline, build/run), code scaffolding, and error diagnosis. TDD throughout with vitest.
> 
> **Deliverables**:
> - npm package (`monogame-mcp`) installable via npx
> - Docker image for isolated execution
> - 7 tools (API lookup, project creation, content pipeline management, content building, code scaffolding, error diagnosis, build/run)
> - 4 resource types (API reference, code examples, content pipeline docs, platform guides)
> - 4 prompt templates (code review, error troubleshooting, architecture planning, feature implementation)
> - Bundled markdown docs for ~25 core MonoGame classes
> - Full TDD test suite with vitest
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 8 → Task 13 → Task 19 → Task 23 → Final

---

## Context

### Original Request
Build an MCP server for MonoGame that exposes documentation to AI agents and supports common MonoGame operations. Documentation is at https://docs.monogame.net/.

### Interview Summary
**Key Discussions**:
- **Technology**: TypeScript/Node.js with `@modelcontextprotocol/server` SDK + Zod v4
- **Transport**: stdio (standard for local CLI tool integration)
- **Documentation**: Bundled markdown files — pre-processed from docs.monogame.net, key classes in depth
- **CLI Integration**: Full — execute dotnet new, mgcb build, dotnet build/run on user's machine
- **Code Scaffolding**: Both snippets (input handling, collision, etc.) and full file generation (Game1.cs, scene managers)
- **Testing**: TDD with vitest, using InMemoryTransport for MCP integration tests
- **Target Audience**: Both beginners and experienced developers
- **Distribution**: npm package + Docker image

**Research Findings**:
- MCP SDK v1.x uses `McpServer` with `registerTool()`, `registerResource()`, `registerPrompt()` methods
- Zod v4 required (`import * as z from 'zod/v4'`), NOT Zod v3
- `StdioServerTransport` from `@modelcontextprotocol/server/server/stdio.js` for stdio transport
- Entry point needs `#!/usr/bin/env node` shebang for npm bin execution
- MUST use `console.error()` only — `console.log()` corrupts stdio JSON-RPC protocol
- Testing with `InMemoryTransport.createLinkedPair()` from `@modelcontextprotocol/core`
- MonoGame docs are in the GitHub repo `monogame/docs.monogame.github.io` with markdown source files
- MGCB files follow an INI-like format with global properties, references, and per-asset blocks
- MonoGame templates: `mgdesktopgl`, `mgwindowsdx`, `mgandroid`, `mgios`, `mgshared`
- Context7 has MonoGame docs at `/monogame/docs.monogame.github.io` (942 code snippets, score 87.2)

### Metis Review
**Identified Gaps** (addressed):
- **Documentation sourcing**: Clone MonoGame docs repo and transform markdown source files at build time
- **Subprocess security**: Use `child_process.spawn` with `shell: false`, validate all inputs, CWD-only default, configurable project root via env var
- **Code scaffolding scope**: Limited to 5-8 concrete templates (Game subclass, components, input handler, etc.)
- **Error diagnosis depth**: Start with 15-20 regex patterns covering common errors, no stack trace parsing in v1
- **SDK version**: Target v1.x stable, pin exact version
- **Path handling**: Normalize paths internally, use `path.posix` for .mgcb files, `path` for OS paths
- **Process safety**: No `exec()`/`execSync()`, no shell interpolation, 60s timeout for builds, 30s for other commands
- **Package size**: Target < 5MB, curate docs to ~25 essential classes
- **Prerequisite checking**: Verify dotnet/mgcb are installed before CLI tools, return helpful errors

---

## Work Objectives

### Core Objective
Build a production-quality MCP server that makes any AI agent a MonoGame expert — with instant API documentation lookup, project scaffolding via dotnet CLI, content pipeline management, code pattern generation, and error diagnosis.

### Concrete Deliverables
- `src/index.ts` — Entry point with McpServer setup and stdio transport
- `src/tools/` — 7 tool implementations (api-lookup, create-project, manage-content, build-content, scaffold-code, diagnose-error, build-run)
- `src/resources/` — 4 resource providers (api-reference, code-examples, content-pipeline, platform-guides)
- `src/prompts/` — 4 prompt templates (code-review, error-troubleshooting, architecture-planning, feature-implementation)
- `src/docs/` — Bundled markdown documentation for ~25 core MonoGame classes
- `src/utils/` — Subprocess execution, MGCB file parser, documentation search, path utilities
- `package.json` — npm package config with bin entry
- `Dockerfile` — Multi-stage build for Docker distribution
- `tsconfig.json` — TypeScript config (ESM, Node16 module resolution)
- Full vitest test suite with InMemoryTransport integration tests

### Definition of Done
- [ ] `npm pack --dry-run` succeeds and shows < 5MB package
- [ ] `npx vitest run` passes all tests (0 failures)
- [ ] `npx tsx src/index.ts` starts server and responds to JSON-RPC initialize request
- [ ] `docker build -t monogame-mcp .` succeeds
- [ ] All 7 tools respond correctly to valid and invalid inputs
- [ ] All 4 resource types return content for valid URIs
- [ ] All 4 prompts return well-structured messages

### Must Have
- TypeScript ESM project with `"type": "module"`
- `@modelcontextprotocol/server` SDK v1.x (pinned)
- Zod v4 for all input validation
- stdio transport via StdioServerTransport
- `#!/usr/bin/env node` shebang on entry point
- `console.error()` for ALL logging (never console.log)
- `child_process.spawn` with `shell: false` for ALL subprocess execution
- Input validation on ALL tool inputs before subprocess execution
- Bundled markdown docs for core MonoGame classes
- TDD with vitest and InMemoryTransport
- npm package with bin entry
- Dockerfile for Docker distribution

### Must NOT Have (Guardrails)
- NO `console.log()` anywhere in server code (corrupts stdio JSON-RPC)
- NO `child_process.exec()` or `child_process.execSync()` (shell injection risk)
- NO shell string interpolation for subprocess arguments
- NO HTTP/SSE transport in v1 (stdio only)
- NO authentication, OAuth, or user management
- NO web UI, dashboard, or admin panel
- NO telemetry, analytics, or usage tracking
- NO automatic docs fetching/scraping at runtime
- NO plugin system or extension mechanism
- NO wrapper classes around MCP SDK (use directly)
- NO "BaseToolHandler" or "AbstractResourceProvider" over-abstraction patterns
- NO more than 7 tools, 4 resource types, and 4 prompts (what's in spec = what exists)
- NO more than 3 levels of directory nesting in `src/`
- NO game logic generation, game design, or architectural opinions beyond docs
- NO C# source code parsing or modification
- NO support for MonoGame versions prior to 3.8.x
- NO comprehensive JSDoc on every function (minimal doc comments on public interfaces only)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (new project, needs setup)
- **Automated tests**: TDD (RED-GREEN-REFACTOR)
- **Framework**: vitest (fast, TypeScript-native, ESM-first)
- **If TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR
- **MCP Integration Tests**: Use `InMemoryTransport.createLinkedPair()` from `@modelcontextprotocol/core`

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Tools**: Use Bash — pipe JSON-RPC messages to server process, assert response fields
- **Resources**: Use Bash — pipe JSON-RPC resource read requests, assert content returned
- **Prompts**: Use Bash — pipe JSON-RPC prompt get requests, assert messages structure
- **CLI tools**: Use Bash — run dotnet/mgcb commands via the tool, assert exit codes and outputs
- **Package**: Use Bash — `npm pack --dry-run`, `docker build .`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — project scaffold + foundation):
├── Task 1: Project scaffold (package.json, tsconfig, vitest config, .gitignore, etc.) [quick]
├── Task 2: Documentation data preparation (curate & structure MonoGame markdown docs) [unspecified-high]
├── Task 3: Type definitions & shared interfaces [quick]

Wave 2 (After Wave 1 — core infrastructure):
├── Task 4: Subprocess execution utility with security (spawn wrapper, timeouts, validation) [deep]
├── Task 5: Documentation search engine (in-memory index over bundled markdown) [deep]
├── Task 6: MGCB file parser (read/write .mgcb content project files) [deep]
├── Task 7: Code scaffolding templates (5-8 MonoGame code templates) [unspecified-high]
├── Task 8: Error diagnosis pattern database (15-20 common MonoGame error patterns) [unspecified-high]

Wave 3 (After Wave 2 — MCP server + tools):
├── Task 9: Core MCP server setup (McpServer, StdioServerTransport, entry point) [quick]
├── Task 10: Tool — API reference lookup (search docs, return class/method info) [deep]
├── Task 11: Tool — Error diagnosis (match error messages to patterns, suggest fixes) [unspecified-high]
├── Task 12: Tool — Code scaffolding (generate snippets and full files from templates) [unspecified-high]

Wave 4 (After Task 9 — CLI tools + resources + prompts):
├── Task 13: Tool — Project creation (dotnet new with MonoGame templates) [deep]
├── Task 14: Tool — Content pipeline management (add/remove/configure assets in .mgcb) [deep]
├── Task 15: Tool — Content building (run mgcb build) [unspecified-high]
├── Task 16: Tool — Build and run project (dotnet build/run) [unspecified-high]
├── Task 17: Resources — API reference + code examples + content pipeline + platform guides [unspecified-high]
├── Task 18: Prompts — Code review + error troubleshooting + architecture + feature impl [unspecified-high]

Wave 5 (After Wave 4 — packaging + distribution):
├── Task 19: npm packaging (package.json bin, files, prepublish scripts) [quick]
├── Task 20: Dockerfile (multi-stage build, dotnet SDK included) [unspecified-high]
├── Task 21: README.md + configuration documentation [writing]
├── Task 22: Integration test suite (full server E2E with InMemoryTransport) [deep]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 3 → Task 5 → Task 9 → Task 10 → Task 19 → Task 22 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2-22 | 1 |
| 2 | — | 5, 10, 17 | 1 |
| 3 | 1 | 4-18 | 1 |
| 4 | 1, 3 | 13, 14, 15, 16 | 2 |
| 5 | 1, 2, 3 | 10, 11, 17 | 2 |
| 6 | 1, 3 | 14, 15 | 2 |
| 7 | 1, 3 | 12 | 2 |
| 8 | 1, 3 | 11 | 2 |
| 9 | 1, 3 | 10-18 | 3 |
| 10 | 5, 9 | 22 | 3 |
| 11 | 8, 9 | 22 | 3 |
| 12 | 7, 9 | 22 | 3 |
| 13 | 4, 9 | 22 | 4 |
| 14 | 4, 6, 9 | 22 | 4 |
| 15 | 4, 6, 9 | 22 | 4 |
| 16 | 4, 9 | 22 | 4 |
| 17 | 5, 9 | 22 | 4 |
| 18 | 9 | 22 | 4 |
| 19 | 1-18 | F1-F4 | 5 |
| 20 | 19 | F1-F4 | 5 |
| 21 | 19 | F1-F4 | 5 |
| 22 | 10-18 | F1-F4 | 5 |

### Agent Dispatch Summary

- **Wave 1**: **3 tasks** — T1 → `quick`, T2 → `unspecified-high`, T3 → `quick`
- **Wave 2**: **5 tasks** — T4 → `deep`, T5 → `deep`, T6 → `deep`, T7 → `unspecified-high`, T8 → `unspecified-high`
- **Wave 3**: **4 tasks** — T9 → `quick`, T10 → `deep`, T11 → `unspecified-high`, T12 → `unspecified-high`
- **Wave 4**: **6 tasks** — T13 → `deep`, T14 → `deep`, T15 → `unspecified-high`, T16 → `unspecified-high`, T17 → `unspecified-high`, T18 → `unspecified-high`
- **Wave 5**: **4 tasks** — T19 → `quick`, T20 → `unspecified-high`, T21 → `writing`, T22 → `deep`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Project Scaffold — package.json, tsconfig, vitest, .gitignore

  **What to do**:
  - Initialize npm project with `npm init -y`
  - Configure `package.json`: `"type": "module"`, `"name": "monogame-mcp"`, `"version": "0.1.0"`, `"bin": { "monogame-mcp": "./build/index.js" }`, `"files": ["build", "docs"]`
  - Install dependencies: `@modelcontextprotocol/server`, `zod` (v4), `@modelcontextprotocol/core` (for testing)
  - Install dev dependencies: `typescript`, `vitest`, `tsx`, `@types/node`
  - Create `tsconfig.json`: `"target": "ES2022"`, `"module": "Node16"`, `"moduleResolution": "Node16"`, `"outDir": "build"`, `"rootDir": "src"`, `"strict": true`, `"esModuleInterop": true`, `"declaration": true`
  - Create `vitest.config.ts` with TypeScript + ESM support
  - Create `.gitignore` (node_modules, build, *.js in src, .env)
  - Create directory structure: `src/tools/`, `src/resources/`, `src/prompts/`, `src/docs/`, `src/utils/`, `tests/`
  - Create minimal `src/index.ts` that imports McpServer and StdioServerTransport (compiles but doesn't register anything yet)
  - Verify: `npx tsc --noEmit` passes, `npx vitest run` passes (0 tests), `npx tsx src/index.ts` exits cleanly

  **Must NOT do**:
  - Do NOT register any tools/resources/prompts yet
  - Do NOT use `"module": "ESNext"` or `"moduleResolution": "bundler"` — must be `"Node16"` for both
  - Do NOT add any `console.log()` statements
  - Do NOT add HTTP dependencies or express

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward project scaffolding with known configuration — no complex logic
  - **Skills**: []
    - No specialized skills needed — standard npm/TypeScript setup
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser automation in scaffold task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 2-22 (everything depends on project existing)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `@modelcontextprotocol/servers` npm packages — Follow their package.json structure for MCP server npm packaging (bin entry, files field, type module)
  - MCP SDK examples at `https://github.com/modelcontextprotocol/typescript-sdk/tree/main/examples` — Reference for tsconfig and project structure

  **API/Type References**:
  - `@modelcontextprotocol/server` package — Main SDK package for server implementation
  - `@modelcontextprotocol/core` package — Contains `InMemoryTransport` for testing
  - `zod` v4 — Schema validation, import as `import * as z from 'zod/v4'`

  **External References**:
  - MCP TypeScript SDK README: https://github.com/modelcontextprotocol/typescript-sdk — Project structure guidance
  - Vitest docs: https://vitest.dev/config/ — vitest.config.ts setup for ESM TypeScript projects

  **WHY Each Reference Matters**:
  - The SDK README shows the exact import paths with `.js` extensions required for ESM (e.g., `@modelcontextprotocol/server/server/stdio.js`)
  - Official MCP servers show the canonical package.json structure with bin entries for npx execution
  - Zod v4 has different import path than v3 — must use `'zod/v4'` not `'zod'`

  **Acceptance Criteria**:

  - [ ] `npx tsc --noEmit` → 0 errors
  - [ ] `npx vitest run` → 0 tests, 0 failures (test runner works)
  - [ ] `package.json` has `"type": "module"`, `"bin"` entry, `"files"` field
  - [ ] `tsconfig.json` has `"module": "Node16"`, `"moduleResolution": "Node16"`
  - [ ] Directories exist: `src/tools/`, `src/resources/`, `src/prompts/`, `src/docs/`, `src/utils/`, `tests/`
  - [ ] `src/index.ts` compiles and imports McpServer + StdioServerTransport

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript compilation succeeds
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npx tsc --noEmit` in project root
      2. Assert exit code is 0
      3. Assert no output on stdout (no errors)
    Expected Result: Exit code 0, no error output
    Failure Indicators: Non-zero exit code, TypeScript errors in output
    Evidence: .sisyphus/evidence/task-1-tsc-compile.txt

  Scenario: Vitest test runner works
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npx vitest run` in project root
      2. Assert exit code is 0
      3. Assert output contains "no test files found" or "0 tests" (no failures)
    Expected Result: Vitest runs successfully with 0 tests
    Failure Indicators: Non-zero exit code, configuration errors
    Evidence: .sisyphus/evidence/task-1-vitest-runner.txt

  Scenario: Entry point is valid ESM TypeScript
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npx tsx src/index.ts` with a 5-second timeout (process should start then be killed)
      2. Assert no import errors or syntax errors in stderr
    Expected Result: Process starts without import/syntax errors
    Failure Indicators: "ERR_MODULE_NOT_FOUND", "SyntaxError", import resolution failures
    Evidence: .sisyphus/evidence/task-1-entry-point.txt
  ```

  **Commit**: YES
  - Message: `chore(scaffold): initialize TypeScript project with build pipeline`
  - Files: `package.json, tsconfig.json, vitest.config.ts, .gitignore, src/index.ts, src/tools/, src/resources/, src/prompts/, src/docs/, src/utils/, tests/`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. Documentation Data Preparation — Curate MonoGame Markdown Docs

  **What to do**:
  - Create bundled markdown documentation files in `src/docs/api/` for ~25 core MonoGame classes
  - Source documentation from the MonoGame docs repo (`github.com/monogame/docs.monogame.github.io`) and Context7 (`/monogame/docs.monogame.github.io`)
  - Each class doc file should contain: class summary, namespace, inheritance, constructors, properties (name, type, description), methods (name, signature, description, parameters, return type), code examples, related classes
  - **Core classes to document** (organize by namespace):
    - `Microsoft.Xna.Framework`: Game, GameTime, Vector2, Vector3, Vector4, Matrix, Color, Rectangle, Point, MathHelper, BoundingBox, BoundingSphere
    - `Microsoft.Xna.Framework.Graphics`: SpriteBatch, Texture2D, GraphicsDevice, GraphicsDeviceManager, Effect, BasicEffect, SpriteFont, RenderTarget2D, BlendState, SamplerState, SpriteSortMode
    - `Microsoft.Xna.Framework.Content`: ContentManager
    - `Microsoft.Xna.Framework.Input`: Keyboard, KeyboardState, Mouse, MouseState, GamePad, GamePadState, Keys, Buttons, TouchPanel
    - `Microsoft.Xna.Framework.Audio`: SoundEffect, SoundEffectInstance
    - `Microsoft.Xna.Framework.Media`: Song, MediaPlayer
  - Create `src/docs/examples/` with code example markdown files:
    - `input-handling.md` — Keyboard, mouse, gamepad patterns (state tracking for "just pressed")
    - `sprite-rendering.md` — SpriteBatch patterns (basic draw, rotated, scaled, animated, sprite sheets)
    - `collision-detection.md` — Rectangle intersection, bounding box, circle collision
    - `audio-playback.md` — Sound effects and background music
    - `content-loading.md` — ContentManager patterns, Texture2D.FromStream vs Content.Load
    - `camera-system.md` — 2D camera with transform matrix
    - `game-state-management.md` — Scene/screen manager pattern
  - Create `src/docs/content-pipeline/` with:
    - `overview.md` — Content pipeline explained (source assets → MGCB → .xnb)
    - `mgcb-format.md` — .mgcb file format reference (global properties, references, content blocks)
    - `importers-processors.md` — Built-in importers/processors and their parameters
    - `troubleshooting.md` — Common content pipeline errors and fixes
  - Create `src/docs/platforms/` with:
    - `desktopgl.md` — Cross-platform desktop setup (Linux/macOS/Windows)
    - `windowsdx.md` — Windows DirectX setup
    - `android.md` — Android setup and deployment
    - `ios.md` — iOS setup and deployment
    - `overview.md` — Platform comparison and template selection guide
  - Create `src/docs/index.ts` that exports a manifest of all doc files with metadata (path, title, namespace, category, keywords)

  **Must NOT do**:
  - Do NOT include ALL MonoGame API classes — only the ~25 key classes listed above
  - Do NOT copy docs verbatim without attribution — include source links
  - Do NOT create docs larger than 5KB per class file (concise, not exhaustive)
  - Do NOT include tutorial-style content in API docs (that's what examples are for)
  - Do NOT include deprecated XNA APIs that MonoGame has removed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires research, content curation, and structured writing — significant effort but not algorithmically complex
  - **Skills**: []
    - No specialized skills needed — research and markdown writing
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — can use webfetch/Context7 for docs

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 5, 10, 17
  - **Blocked By**: None (can start immediately, though Task 1 creates dir structure)

  **References**:

  **Pattern References**:
  - MonoGame docs repo: `https://github.com/monogame/docs.monogame.github.io` — Source markdown files for documentation content
  - MonoGame API reference: `https://docs.monogame.net/api/` — Online API reference to verify completeness

  **API/Type References**:
  - Context7 library `/monogame/docs.monogame.github.io` — 942 code snippets with high quality score (87.2), use as primary data source for code examples
  - Context7 library `/websites/monogame_net` — 1831 snippets, supplementary source

  **External References**:
  - MonoGame API namespaces overview: `https://docs.monogame.net/api/index.html` — Lists all namespaces and entry points
  - MonoGame Getting Started: `https://docs.monogame.net/articles/getting_started/index.html` — Platform setup guides
  - MonoGame Building 2D Games tutorial: `https://docs.monogame.net/articles/tutorials/building_2d_games/index.html` — Source for code examples

  **WHY Each Reference Matters**:
  - The docs repo has raw markdown that can be transformed rather than written from scratch
  - Context7 provides pre-extracted code snippets with quality scoring — use the best ones
  - API namespace overview confirms which classes to prioritize
  - Getting Started confirms platform-specific setup details for platform guides

  **Acceptance Criteria**:

  - [ ] `src/docs/api/` contains markdown files for all ~25 listed classes
  - [ ] `src/docs/examples/` contains 7 code example files
  - [ ] `src/docs/content-pipeline/` contains 4 content pipeline docs
  - [ ] `src/docs/platforms/` contains 5 platform docs
  - [ ] `src/docs/index.ts` exports a manifest with title, namespace, category, keywords per doc
  - [ ] Each API doc contains: summary, namespace, properties list, methods list, at least 1 code example
  - [ ] No single doc file exceeds 5KB
  - [ ] `npx tsc --noEmit` passes (index.ts compiles)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All required documentation files exist
    Tool: Bash
    Preconditions: Task 2 complete
    Steps:
      1. Count files in src/docs/api/ — assert >= 25 files
      2. Count files in src/docs/examples/ — assert >= 7 files
      3. Count files in src/docs/content-pipeline/ — assert >= 4 files
      4. Count files in src/docs/platforms/ — assert >= 5 files
      5. Verify src/docs/index.ts exists
    Expected Result: All directories populated with expected file counts
    Failure Indicators: Missing files or directories
    Evidence: .sisyphus/evidence/task-2-docs-file-count.txt

  Scenario: SpriteBatch API doc has required sections
    Tool: Bash
    Preconditions: Task 2 complete
    Steps:
      1. Read src/docs/api/spritebatch.md
      2. Assert it contains "SpriteBatch" in title
      3. Assert it contains "Microsoft.Xna.Framework.Graphics" namespace
      4. Assert it contains "Begin" method documentation
      5. Assert it contains "Draw" method documentation
      6. Assert it contains at least one code example (```csharp block)
    Expected Result: SpriteBatch doc has all required sections
    Failure Indicators: Missing sections, no code examples
    Evidence: .sisyphus/evidence/task-2-spritebatch-doc.txt

  Scenario: No doc file exceeds 5KB
    Tool: Bash
    Preconditions: Task 2 complete
    Steps:
      1. Find all .md files in src/docs/ recursively
      2. Check file size of each — assert all are < 5120 bytes
    Expected Result: All doc files under 5KB
    Failure Indicators: Any file exceeding 5120 bytes
    Evidence: .sisyphus/evidence/task-2-docs-size-check.txt

  Scenario: Docs manifest exports correct structure
    Tool: Bash
    Preconditions: npm install completed, Task 1 complete
    Steps:
      1. Run `npx tsx -e "import { docs } from './src/docs/index.js'; console.error(JSON.stringify(Object.keys(docs).length))"`
      2. Assert the manifest contains entries for all doc files
      3. Assert each entry has: path, title, category, keywords
    Expected Result: Manifest exports structured data for all docs
    Failure Indicators: Import error, missing entries, missing metadata fields
    Evidence: .sisyphus/evidence/task-2-docs-manifest.txt
  ```

  **Commit**: YES
  - Message: `feat(docs): add curated MonoGame documentation markdown files`
  - Files: `src/docs/**/*.md, src/docs/index.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 3. Type Definitions & Shared Interfaces

  **What to do**:
  - Create `src/types.ts` with shared TypeScript types and interfaces used across the project:
    - `MonoGameNamespace` — enum/union of MonoGame namespace names
    - `DocEntry` — interface for a documentation entry (path, title, namespace, category, keywords, content)
    - `DocSearchResult` — interface for search results (entry, relevance score, matched section)
    - `ToolResult` — helper type for MCP tool return values (content array)
    - `SubprocessResult` — interface for subprocess execution results (exitCode, stdout, stderr, timedOut)
    - `SubprocessOptions` — interface for subprocess options (cwd, timeout, env, args)
    - `MgcbEntry` — interface for a content entry in an .mgcb file (path, importer, processor, processorParams, buildAction)
    - `MgcbProject` — interface for a parsed .mgcb file (outputDir, intermediateDir, platform, references, entries)
    - `ErrorPattern` — interface for error diagnosis patterns (regex, errorType, description, cause, solution, docLinks)
    - `ScaffoldTemplate` — interface for code scaffolding templates (name, description, category, template string, parameters)
    - `MonoGamePlatform` — enum/union of supported platforms (DesktopGL, WindowsDX, Android, iOS)
    - `MonoGameTemplate` — enum/union of dotnet template short names (mgdesktopgl, mgwindowsdx, mgandroid, mgios, mgshared)
  - Write unit tests in `tests/types.test.ts` verifying type correctness (compile-time checks, runtime validation helpers if any)

  **Must NOT do**:
  - Do NOT create abstract base classes or inheritance hierarchies
  - Do NOT create "utility types" beyond what's concretely needed
  - Do NOT add runtime validation here (that's Zod's job in tool handlers)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript type definitions — small file, clear requirements
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4-18
  - **Blocked By**: Task 1 (needs tsconfig to compile)

  **References**:

  **Pattern References**:
  - MCP SDK types: `@modelcontextprotocol/server` — See `CallToolResult` type for tool return values

  **API/Type References**:
  - MGCB file format: Global properties (`/outputDir:`, `/intermediateDir:`, `/platform:`, `/profile:`), references (`#References`), content blocks (`#begin`, `/importer:`, `/processor:`, `/processorParam:`, `/build:`)
  - MonoGame templates: `mgdesktopgl`, `mgwindowsdx`, `mgandroid`, `mgios`, `mgshared`
  - MonoGame namespaces: `Microsoft.Xna.Framework`, `.Audio`, `.Content`, `.Graphics`, `.Input`, `.Media`

  **WHY Each Reference Matters**:
  - The MCP SDK's `CallToolResult` type shows the exact content array structure tools must return — our `ToolResult` helper should align
  - The MGCB format reference defines exactly what fields `MgcbEntry` and `MgcbProject` need
  - MonoGame template names must match exactly what `dotnet new` accepts

  **Acceptance Criteria**:

  - [ ] `src/types.ts` exists with all listed interfaces
  - [ ] `npx tsc --noEmit` passes (types compile)
  - [ ] `tests/types.test.ts` exists and passes
  - [ ] Types are importable from `src/types.ts` without circular dependencies

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Types compile correctly
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code is 0
    Expected Result: All types compile without errors
    Failure Indicators: TypeScript compilation errors
    Evidence: .sisyphus/evidence/task-3-types-compile.txt

  Scenario: Types are importable
    Tool: Bash
    Preconditions: npm install completed
    Steps:
      1. Run `npx tsx -e "import { MonoGamePlatform, MgcbProject, ErrorPattern } from './src/types.js'; console.error('OK')"`
      2. Assert stderr contains "OK"
    Expected Result: Types import successfully
    Failure Indicators: Import errors, module resolution failures
    Evidence: .sisyphus/evidence/task-3-types-import.txt
  ```

  **Commit**: YES
  - Message: `feat(types): add shared type definitions and interfaces`
  - Files: `src/types.ts, tests/types.test.ts`
  - Pre-commit: `npx tsc --noEmit && npx vitest run`

- [ ] 4. Subprocess Execution Utility with Security

  **What to do**:
  - Create `src/utils/subprocess.ts` with a secure subprocess execution wrapper
  - TDD: Write `tests/utils/subprocess.test.ts` FIRST with test cases, then implement
  - Core function: `executeCommand(command: string, args: string[], options?: SubprocessOptions): Promise<SubprocessResult>`
  - **Security requirements**:
    - Use `child_process.spawn` with `shell: false` — NEVER `exec()` or `execSync()`
    - Validate `command` against an allowlist of permitted commands: `dotnet`, `mgcb`, `dotnet-mgcb`
    - Sanitize all `args` — reject args containing shell metacharacters (`;`, `|`, `&`, `$`, `` ` ``, `\n`)
    - Default timeout: 30 seconds (configurable, max 120s for builds)
    - Capture stdout and stderr (max 1MB each, truncate beyond)
    - Return structured `SubprocessResult` with exitCode, stdout, stderr, timedOut
  - **Working directory handling**:
    - Default to `process.cwd()`
    - Accept optional `cwd` parameter
    - Validate that `cwd` exists and is a directory before spawning
  - **Prerequisite checking**:
    - Export `checkPrerequisite(command: string): Promise<{available: boolean, version?: string, message: string}>`
    - Check if `dotnet` is installed: `dotnet --version`
    - Check if MonoGame templates installed: `dotnet new list --tag MonoGame`
    - Check if MGCB is installed: `dotnet tool list -g` (look for `dotnet-mgcb`)
  - Test cases:
    - Valid command execution (e.g., `echo hello` or `node --version`)
    - Command not in allowlist → rejection
    - Args with shell metacharacters → rejection
    - Command timeout → timedOut: true
    - Non-zero exit code → captured in result
    - CWD validation → error for non-existent directory

  **Must NOT do**:
  - Do NOT use `child_process.exec()` or `child_process.execSync()`
  - Do NOT use `shell: true` in spawn options
  - Do NOT interpolate user input into command strings
  - Do NOT allow arbitrary commands beyond the allowlist

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Security-critical code with edge cases, subprocess management, and robust error handling
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: Tasks 13, 14, 15, 16
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - Node.js `child_process.spawn` docs: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options — Use `spawn` with `shell: false` for security

  **API/Type References**:
  - `src/types.ts:SubprocessResult` — Return type for executeCommand
  - `src/types.ts:SubprocessOptions` — Options type for executeCommand

  **External References**:
  - OWASP Command Injection Prevention: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html — Security best practices for subprocess execution

  **WHY Each Reference Matters**:
  - Node.js spawn docs confirm the exact API for `shell: false` mode and signal handling
  - The types from Task 3 define the exact interfaces this utility must implement
  - OWASP guidance ensures we follow security best practices for command execution

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/utils/subprocess.test.ts` has ≥ 6 test cases
  - [ ] `npx vitest run tests/utils/subprocess.test.ts` → all pass
  - [ ] No `exec()` or `execSync()` in codebase (grep verification)
  - [ ] Command allowlist enforced
  - [ ] Shell metacharacter rejection works

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Valid command executes successfully
    Tool: Bash
    Preconditions: npm install completed, Task 4 complete
    Steps:
      1. Run `npx vitest run tests/utils/subprocess.test.ts --reporter=verbose`
      2. Assert test "valid command execution" passes
      3. Assert output shows "node --version" or similar safe command completed
    Expected Result: All subprocess tests pass
    Failure Indicators: Test failures, timeout errors
    Evidence: .sisyphus/evidence/task-4-subprocess-tests.txt

  Scenario: No exec/execSync in codebase
    Tool: Bash
    Preconditions: Task 4 complete
    Steps:
      1. Search codebase for `exec(` and `execSync(` in .ts files under src/
      2. Assert 0 matches found
    Expected Result: Zero instances of exec/execSync
    Failure Indicators: Any matches found
    Evidence: .sisyphus/evidence/task-4-no-exec-check.txt

  Scenario: Shell metacharacters rejected
    Tool: Bash
    Preconditions: Task 4 complete
    Steps:
      1. Run `npx vitest run tests/utils/subprocess.test.ts -t "metacharacter"` 
      2. Assert test passes that verifies args with ";", "|", "&" are rejected
    Expected Result: Metacharacter arguments cause rejection errors
    Failure Indicators: Test failure, metacharacters allowed through
    Evidence: .sisyphus/evidence/task-4-metachar-rejection.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add secure subprocess execution utility`
  - Files: `src/utils/subprocess.ts, tests/utils/subprocess.test.ts`
  - Pre-commit: `npx vitest run tests/utils/subprocess.test.ts`

- [ ] 5. Documentation Search Engine — In-Memory Index

  **What to do**:
  - Create `src/utils/doc-search.ts` with an in-memory search engine over bundled markdown docs
  - TDD: Write `tests/utils/doc-search.test.ts` FIRST, then implement
  - Core class/functions:
    - `DocSearchEngine` class with:
      - `constructor(docs: DocEntry[])` — Initialize with doc entries from manifest
      - `search(query: string, options?: { category?: string, namespace?: string, limit?: number }): DocSearchResult[]`
      - `getByClassName(className: string): DocEntry | undefined` — Exact class lookup
      - `getByNamespace(namespace: string): DocEntry[]` — All docs in a namespace
      - `getByCategory(category: string): DocEntry[]` — All docs in a category (api, examples, content-pipeline, platforms)
  - Search algorithm:
    - Tokenize query into words
    - Score matches against: title (weight 3x), keywords (weight 2x), content (weight 1x)
    - Case-insensitive matching
    - Return sorted by relevance score, limited to top N results (default 5)
  - Load documentation from bundled markdown files at initialization
  - Read file contents lazily (load on first access, cache afterward)
  - Test cases:
    - Search "SpriteBatch" → returns SpriteBatch doc
    - Search "draw sprite" → returns SpriteBatch and sprite-rendering example docs
    - Search by namespace → returns only that namespace's docs
    - Search with no results → returns empty array
    - Exact class lookup for "Texture2D" → returns Texture2D doc
    - getByCategory("examples") → returns all example docs

  **Must NOT do**:
  - Do NOT add external search libraries (no lunr.js, no elasticsearch)
  - Do NOT load all file contents eagerly at startup (lazy load)
  - Do NOT add fuzzy matching in v1 (exact token matching is sufficient)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Search algorithm with scoring, lazy loading, caching — requires careful design
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7, 8)
  - **Blocks**: Tasks 10, 11, 17
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `src/docs/index.ts` (from Task 2) — Document manifest with metadata for each doc file

  **API/Type References**:
  - `src/types.ts:DocEntry` — Interface for documentation entries (path, title, namespace, category, keywords, content)
  - `src/types.ts:DocSearchResult` — Interface for search results (entry, relevance, matched section)

  **External References**:
  - Node.js `fs/promises` API — For lazy file reading of markdown docs

  **WHY Each Reference Matters**:
  - The docs manifest from Task 2 defines what gets indexed — search engine wraps this data
  - DocEntry/DocSearchResult types from Task 3 define exact interfaces to implement
  - fs/promises for async file reading since docs are on-disk

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/utils/doc-search.test.ts` has ≥ 6 test cases
  - [ ] `npx vitest run tests/utils/doc-search.test.ts` → all pass
  - [ ] Search for "SpriteBatch" returns relevant results
  - [ ] Class lookup by name works (case-insensitive)
  - [ ] Category and namespace filtering work

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Search returns relevant results
    Tool: Bash
    Preconditions: Tasks 2, 5 complete
    Steps:
      1. Run `npx vitest run tests/utils/doc-search.test.ts --reporter=verbose`
      2. Assert all search tests pass
      3. Verify test for "SpriteBatch" query returns SpriteBatch doc as top result
    Expected Result: All search tests pass with correct relevance ordering
    Failure Indicators: Wrong ordering, missing results, test failures
    Evidence: .sisyphus/evidence/task-5-doc-search-tests.txt

  Scenario: Empty query returns empty results
    Tool: Bash
    Preconditions: Task 5 complete
    Steps:
      1. Run `npx vitest run tests/utils/doc-search.test.ts -t "empty"` or similar
      2. Assert test verifying empty/no-match queries return []
    Expected Result: Empty results for non-matching queries
    Failure Indicators: Errors thrown instead of empty array
    Evidence: .sisyphus/evidence/task-5-empty-search.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add documentation search engine with in-memory index`
  - Files: `src/utils/doc-search.ts, tests/utils/doc-search.test.ts`
  - Pre-commit: `npx vitest run tests/utils/doc-search.test.ts`

- [ ] 6. MGCB File Parser — Read/Write .mgcb Content Project Files

  **What to do**:
  - Create `src/utils/mgcb-parser.ts` with parser for MonoGame Content Builder (.mgcb) files
  - TDD: Write `tests/utils/mgcb-parser.test.ts` FIRST, then implement
  - Core functions:
    - `parseMgcb(content: string): MgcbProject` — Parse .mgcb file content into structured object
    - `serializeMgcb(project: MgcbProject): string` — Serialize back to .mgcb format
    - `addContentEntry(project: MgcbProject, entry: MgcbEntry): MgcbProject` — Add asset to project
    - `removeContentEntry(project: MgcbProject, assetPath: string): MgcbProject` — Remove asset
    - `getImporterForExtension(ext: string): string` — Suggest importer based on file extension (.png → TextureImporter, .wav → WavImporter, .spritefont → FontDescriptionImporter, .fx → EffectImporter, .fbx → FbxImporter)
    - `getProcessorForImporter(importer: string): string` — Suggest processor for importer
  - .mgcb format to parse:
    ```
    #----------------------------- Global Properties ----------------------------#

    /outputDir:bin/$(Platform)
    /intermediateDir:obj/$(Platform)
    /platform:DesktopGL
    /config:
    /profile:Reach
    /compress:False

    #-------------------------------- References --------------------------------#


    #---------------------------------- Content ---------------------------------#

    #begin Sprites/player.png
    /importer:TextureImporter
    /processor:TextureProcessor
    /processorParam:ColorKeyEnabled=True
    /build:Sprites/player.png
    ```
  - Test cases:
    - Parse valid .mgcb file → correct MgcbProject structure
    - Parse empty .mgcb file → valid empty project
    - Parse .mgcb with multiple content entries → all entries captured
    - Parse .mgcb with comments → comments preserved
    - Serialize MgcbProject → valid .mgcb format (round-trip: parse → serialize → parse produces same result)
    - Add entry → appears in project
    - Remove entry → removed from project
    - getImporterForExtension(".png") → "TextureImporter"
    - getImporterForExtension(".wav") → "WavImporter"
    - Unknown extension → returns undefined or null

  **Must NOT do**:
  - Do NOT handle `$(Platform)` variable substitution (leave variables as-is in parsed output)
  - Do NOT handle external reference DLLs beyond storing the reference path
  - Do NOT validate that referenced files exist on disk

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: File format parsing with edge cases, round-trip serialization, format-specific logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7, 8)
  - **Blocks**: Tasks 14, 15
  - **Blocked By**: Tasks 1, 3

  **References**:

  **API/Type References**:
  - `src/types.ts:MgcbEntry` — Interface for content entries (path, importer, processor, processorParams, buildAction)
  - `src/types.ts:MgcbProject` — Interface for parsed .mgcb project (outputDir, intermediateDir, platform, references, entries)

  **External References**:
  - MGCB CLI docs: https://docs.monogame.net/articles/getting_to_know/howto/content/index.html — Content pipeline documentation
  - MGCB file format: The format shown above in "What to do" is the canonical structure from real MonoGame projects

  **WHY Each Reference Matters**:
  - Types from Task 3 define the exact data structures the parser must produce
  - Official MGCB docs confirm the format specification and edge cases
  - Real .mgcb files from MonoGame samples validate the parser against production formats

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/utils/mgcb-parser.test.ts` has ≥ 8 test cases
  - [ ] `npx vitest run tests/utils/mgcb-parser.test.ts` → all pass
  - [ ] Round-trip test: parse → serialize → parse produces same result
  - [ ] Extension-to-importer mapping covers .png, .wav, .mp3, .spritefont, .fx, .fbx

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Parse valid .mgcb file
    Tool: Bash
    Preconditions: Task 6 complete
    Steps:
      1. Run `npx vitest run tests/utils/mgcb-parser.test.ts --reporter=verbose`
      2. Assert all parser tests pass
      3. Verify round-trip test (parse → serialize → parse) passes
    Expected Result: All parser tests pass including round-trip
    Failure Indicators: Parse errors, serialization mismatch, test failures
    Evidence: .sisyphus/evidence/task-6-mgcb-parser-tests.txt

  Scenario: Extension mapping is correct
    Tool: Bash
    Preconditions: Task 6 complete
    Steps:
      1. Run tests for getImporterForExtension
      2. Assert .png → TextureImporter, .wav → WavImporter, .spritefont → FontDescriptionImporter
    Expected Result: Correct importer for each extension
    Failure Indicators: Wrong importer returned
    Evidence: .sisyphus/evidence/task-6-extension-mapping.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add MGCB file parser for content pipeline management`
  - Files: `src/utils/mgcb-parser.ts, tests/utils/mgcb-parser.test.ts`
  - Pre-commit: `npx vitest run tests/utils/mgcb-parser.test.ts`

- [ ] 7. Code Scaffolding Templates

  **What to do**:
  - Create `src/utils/scaffolding.ts` with MonoGame code templates
  - TDD: Write `tests/utils/scaffolding.test.ts` FIRST, then implement
  - Core function: `generateCode(templateName: string, params: Record<string, string>): { filename: string, content: string }`
  - **Templates to create** (5-8 concrete templates):
    1. `game-class` — Complete Game1.cs with constructor, Initialize, LoadContent, Update, Draw. Params: className, namespace
    2. `drawable-component` — DrawableGameComponent subclass with Initialize, LoadContent, Update, Draw. Params: className, namespace
    3. `game-component` — GameComponent subclass with Initialize, Update. Params: className, namespace
    4. `input-handler` — Static input handling class with current/previous state tracking for keyboard, mouse, gamepad. Params: namespace
    5. `sprite-animation` — Sprite sheet animation class with frame management, timing, play/pause/reset. Params: className, namespace
    6. `scene-manager` — Scene/screen manager with push/pop/switch scene pattern. Params: namespace
    7. `collision-helper` — Static collision detection helpers (AABB, circle, point-in-rect). Params: namespace
    8. `audio-manager` — Audio management class wrapping SoundEffect and Song playback. Params: namespace
  - Each template should be valid, compilable C# code following MonoGame conventions
  - Template parameters should be substituted using simple string replacement (`{{className}}`, `{{namespace}}`)
  - Also export: `listTemplates(): ScaffoldTemplate[]` — list all available templates with descriptions

  **Must NOT do**:
  - Do NOT use a full template engine (no Handlebars, no EJS) — simple string replacement
  - Do NOT generate multi-file projects (each template = one file)
  - Do NOT include game logic beyond structural patterns

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires MonoGame knowledge for correct C# code patterns, but implementation is template strings
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 8)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1, 3

  **References**:

  **API/Type References**:
  - `src/types.ts:ScaffoldTemplate` — Interface for template metadata (name, description, category, template, parameters)

  **External References**:
  - Context7 `/monogame/docs.monogame.github.io` — Code snippets for Game class lifecycle, SpriteBatch, input handling, audio
  - MonoGame Game class example: The Context7 research returned complete Game1.cs lifecycle code — use as template basis
  - MonoGame input handling: Context7 showed keyboard state tracking pattern with previous/current state comparison

  **WHY Each Reference Matters**:
  - ScaffoldTemplate type defines what metadata each template must carry
  - Context7 snippets provide verified, working MonoGame code patterns to base templates on
  - Using actual MonoGame patterns (not invented ones) ensures generated code follows framework conventions

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] All 8 templates generate valid C# code
  - [ ] `tests/utils/scaffolding.test.ts` has ≥ 8 test cases (one per template)
  - [ ] `npx vitest run tests/utils/scaffolding.test.ts` → all pass
  - [ ] Parameter substitution works (className, namespace appear in output)
  - [ ] `listTemplates()` returns all 8 templates with metadata

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All templates generate valid code
    Tool: Bash
    Preconditions: Task 7 complete
    Steps:
      1. Run `npx vitest run tests/utils/scaffolding.test.ts --reporter=verbose`
      2. Assert all template generation tests pass
      3. Verify "game-class" template contains "protected override void Update"
      4. Verify "input-handler" template contains "Keyboard.GetState()"
    Expected Result: All 8 templates generate syntactically valid C# code
    Failure Indicators: Missing MonoGame patterns, test failures
    Evidence: .sisyphus/evidence/task-7-scaffolding-tests.txt

  Scenario: Parameter substitution works
    Tool: Bash
    Preconditions: Task 7 complete
    Steps:
      1. Run test that generates "game-class" with className="MyGame", namespace="MyProject"
      2. Assert output contains "class MyGame" and "namespace MyProject"
    Expected Result: Parameters correctly substituted in output
    Failure Indicators: Template placeholders remain in output
    Evidence: .sisyphus/evidence/task-7-param-substitution.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add MonoGame code scaffolding templates`
  - Files: `src/utils/scaffolding.ts, tests/utils/scaffolding.test.ts`
  - Pre-commit: `npx vitest run tests/utils/scaffolding.test.ts`

- [ ] 8. Error Diagnosis Pattern Database

  **What to do**:
  - Create `src/utils/error-diagnosis.ts` with MonoGame error pattern matching
  - TDD: Write `tests/utils/error-diagnosis.test.ts` FIRST, then implement
  - Core function: `diagnoseError(errorMessage: string): ErrorDiagnosis | null`
    - Match error message against regex patterns
    - Return structured diagnosis: pattern matched, likely cause, solution steps, relevant doc links
    - Return null if no pattern matches
  - Also export: `listErrorPatterns(): ErrorPattern[]` — list all known patterns
  - **15-20 error patterns to include**:
    1. `Content file not found` — Wrong content path or missing Content.RootDirectory
    2. `Begin must be called before Draw` / `End must be called before Begin` — SpriteBatch lifecycle error
    3. `The GraphicsDevice must not be null` — GraphicsDevice used before Initialize
    4. `No suitable graphics card found` — Missing GPU or driver issue
    5. `Could not load .* asset` — Content pipeline build failure
    6. `Effect compilation failed` — Shader compilation error
    7. `Texture2D.FromStream` errors — Image format not supported
    8. `Index was outside the bounds of the array` — Common in sprite sheet math
    9. `Cannot access a disposed object` — Using disposed texture/device
    10. `The content importer .* could not be found` — Missing importer in MGCB
    11. `The content processor .* could not be found` — Missing processor in MGCB
    12. `Error loading pipeline assembly` — Missing content pipeline reference
    13. `GameWindow.Handle is not available` — Platform-specific window handle issue
    14. `SoundEffect.Play failed` — Audio device unavailable
    15. `MediaPlayer.Play failed` — Song format not supported
    16. `Object reference not set to an instance` — NullReferenceException in game loop
    17. `dotnet new: Could not find template` — MonoGame templates not installed
    18. `MGCB: Error` — Generic MGCB build error patterns
    19. `StackOverflowException in Update/Draw` — Recursive game loop calls
    20. `OutOfMemoryException loading textures` — Texture too large or too many loaded

  **Must NOT do**:
  - Do NOT parse stack traces in v1
  - Do NOT use ML/AI for error matching — simple regex patterns only
  - Do NOT add more than 25 patterns (start focused)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires MonoGame domain knowledge to write accurate diagnoses, but implementation is regex matching
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 1, 3

  **References**:

  **API/Type References**:
  - `src/types.ts:ErrorPattern` — Interface for error patterns (regex, errorType, description, cause, solution, docLinks)

  **External References**:
  - MonoGame Community Forum: https://community.monogame.net — Source of common error reports
  - MonoGame content pipeline troubleshooting: `src/docs/content-pipeline/troubleshooting.md` (from Task 2) — Related docs to link

  **WHY Each Reference Matters**:
  - ErrorPattern type defines the exact structure each pattern must have
  - Community forum confirms which errors developers actually encounter most
  - Content pipeline troubleshooting docs should be cross-referenced in diagnosis results

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/utils/error-diagnosis.test.ts` has ≥ 10 test cases
  - [ ] `npx vitest run tests/utils/error-diagnosis.test.ts` → all pass
  - [ ] At least 15 error patterns defined
  - [ ] Each diagnosis includes: cause, solution steps, and at least one doc link
  - [ ] Unknown errors return null (not an exception)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Known errors are diagnosed correctly
    Tool: Bash
    Preconditions: Task 8 complete
    Steps:
      1. Run `npx vitest run tests/utils/error-diagnosis.test.ts --reporter=verbose`
      2. Assert test for "Content file not found" pattern matches
      3. Assert test for "Begin must be called before Draw" pattern matches
      4. Assert all diagnosis results include cause, solution, and docLinks
    Expected Result: All known error patterns correctly diagnosed
    Failure Indicators: Patterns not matching, missing diagnosis fields
    Evidence: .sisyphus/evidence/task-8-error-diagnosis-tests.txt

  Scenario: Unknown errors return null
    Tool: Bash
    Preconditions: Task 8 complete
    Steps:
      1. Run test with error message "some random error that doesn't match any pattern"
      2. Assert result is null (not an exception)
    Expected Result: null returned for unrecognized errors
    Failure Indicators: Exception thrown, wrong pattern matched
    Evidence: .sisyphus/evidence/task-8-unknown-error.txt
  ```

  **Commit**: YES
  - Message: `feat(utils): add MonoGame error diagnosis pattern database`
  - Files: `src/utils/error-diagnosis.ts, tests/utils/error-diagnosis.test.ts`

- [ ] 9. Core MCP Server Setup — McpServer, StdioServerTransport, Entry Point

  **What to do**:
  - Create the main MCP server in `src/index.ts` (update the minimal stub from Task 1)
  - TDD: Write `tests/server.test.ts` FIRST with integration tests using InMemoryTransport, then implement
  - Server setup:
    - Instantiate `McpServer` with name `"monogame-mcp"`, version from `package.json`
    - Configure `StdioServerTransport` from `@modelcontextprotocol/server/server/stdio.js`
    - Register all tools (imported from `src/tools/`) — defer to stubs/placeholders initially
    - Register all resources (imported from `src/resources/`)
    - Register all prompts (imported from `src/prompts/`)
    - Call `server.connect(transport)` to start listening
    - Add `#!/usr/bin/env node` shebang at top
    - ALL logging via `console.error()` — NEVER `console.log()`
  - Create `src/server.ts` as a testable server factory:
    - Export `createServer(): McpServer` — constructs and configures server WITHOUT connecting transport
    - This allows tests to use InMemoryTransport while production uses StdioServerTransport
    - `src/index.ts` calls `createServer()` then connects StdioServerTransport
  - Integration test pattern:
    ```typescript
    import { InMemoryTransport } from '@modelcontextprotocol/core';
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    await server.connect(serverTransport);
    // Send JSON-RPC messages via clientTransport
    ```
  - Test cases:
    - Server initializes without errors
    - Server responds to `initialize` with capabilities listing tools/resources/prompts
    - Server responds to `tools/list` with all 7 tools
    - Server responds to `resources/list` with all resource URIs
    - Server responds to `prompts/list` with all 4 prompts

  **Must NOT do**:
  - Do NOT create wrapper/base classes for tools/resources/prompts
  - Do NOT add HTTP/SSE transport
  - Do NOT add `console.log()` — only `console.error()` for logging
  - Do NOT implement tool handlers yet — just register with stubs that return "not yet implemented"

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward SDK wiring — connecting pre-built components, not complex logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: NO (must complete before Wave 3 tools)
  - **Parallel Group**: Wave 3 (starts wave, then Tasks 10-12 run in parallel after)
  - **Blocks**: Tasks 10-18
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - MCP SDK examples: `https://github.com/modelcontextprotocol/typescript-sdk/tree/main/examples` — Reference server setup pattern
  - Existing `src/index.ts` stub (from Task 1) — Extend this file with full server setup

  **API/Type References**:
  - `McpServer` from `@modelcontextprotocol/server` — Main server class
  - `StdioServerTransport` from `@modelcontextprotocol/server/server/stdio.js` — stdio transport
  - `InMemoryTransport` from `@modelcontextprotocol/core` — Testing transport
  - `server.registerTool(name, schema, handler)` — Tool registration API
  - `server.registerResource(name, uri, meta, handler)` — Resource registration API
  - `server.registerPrompt(name, schema, handler)` — Prompt registration API

  **External References**:
  - MCP TypeScript SDK README: https://github.com/modelcontextprotocol/typescript-sdk — Server setup examples
  - MCP spec: https://modelcontextprotocol.io/specification — Protocol details for initialize handshake

  **WHY Each Reference Matters**:
  - SDK examples show the canonical server setup pattern — follow exactly, don't invent abstractions
  - InMemoryTransport is the only way to test MCP servers without spawning processes
  - MCP spec confirms what the `initialize` response must contain (capabilities object)

  **Acceptance Criteria**:

  - [ ] TDD: Integration tests written first, then server implementation
  - [ ] `src/server.ts` exports `createServer()` factory function
  - [ ] `src/index.ts` has `#!/usr/bin/env node` shebang
  - [ ] `tests/server.test.ts` has ≥ 5 test cases using InMemoryTransport
  - [ ] `npx vitest run tests/server.test.ts` → all pass
  - [ ] No `console.log()` anywhere in server code
  - [ ] Server responds to `initialize` with capabilities

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Server starts and responds to initialize
    Tool: Bash
    Preconditions: Task 9 complete, npm install done
    Steps:
      1. Run `npx vitest run tests/server.test.ts --reporter=verbose`
      2. Assert test for "initialize" response passes
      3. Assert capabilities include tools, resources, prompts sections
    Expected Result: Server initializes and reports all registered capabilities
    Failure Indicators: Connection errors, missing capabilities, test failures
    Evidence: .sisyphus/evidence/task-9-server-init.txt

  Scenario: No console.log in server code
    Tool: Bash
    Preconditions: Task 9 complete
    Steps:
      1. Search src/ for "console.log" in all .ts files
      2. Assert 0 matches found
    Expected Result: Zero console.log statements in source
    Failure Indicators: Any console.log found
    Evidence: .sisyphus/evidence/task-9-no-console-log.txt

  Scenario: Entry point has shebang
    Tool: Bash
    Preconditions: Task 9 complete
    Steps:
      1. Read first line of src/index.ts
      2. Assert it contains "#!/usr/bin/env node"
    Expected Result: Shebang present
    Failure Indicators: Missing shebang or wrong format
    Evidence: .sisyphus/evidence/task-9-shebang.txt
  ```

  **Commit**: YES
  - Message: `feat(server): add core MCP server setup with stdio transport`
  - Files: `src/index.ts, src/server.ts, tests/server.test.ts`
  - Pre-commit: `npx vitest run tests/server.test.ts`

- [ ] 10. Tool — API Reference Lookup

  **What to do**:
  - Create `src/tools/api-lookup.ts` with the API reference lookup tool
  - TDD: Write `tests/tools/api-lookup.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_api_lookup`
    - Description: "Search MonoGame API documentation for classes, methods, and properties"
    - Input schema (Zod v4):
      - `query` (string, required) — Search term (class name, method name, concept)
      - `namespace` (string, optional) — Filter by namespace (e.g., "Microsoft.Xna.Framework.Graphics")
      - `category` (enum, optional) — Filter by doc category: "api", "examples", "content-pipeline", "platforms"
      - `limit` (number, optional, default 5, max 10) — Number of results
  - Handler implementation:
    - Use `DocSearchEngine` from Task 5 to search bundled docs
    - If `query` matches a class name exactly, return the full class doc
    - If `query` is a general search, return ranked results with snippets
    - Format results as markdown text content for the AI agent
    - Each result should include: title, namespace, summary, and relevant code example
  - Test cases:
    - Search "SpriteBatch" → returns SpriteBatch API doc
    - Search "draw" → returns multiple results (SpriteBatch.Draw, sprite rendering example)
    - Search with namespace filter → only returns docs from that namespace
    - Search with category filter → only returns docs from that category
    - Search with no matches → returns helpful "no results" message (not empty)
    - Invalid/empty query → returns validation error

  **Must NOT do**:
  - Do NOT fetch docs from the internet at runtime
  - Do NOT parse C# source code
  - Do NOT return raw markdown — format for readability

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integrates search engine with MCP tool registration, requires careful result formatting
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12 — after Task 9)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 5, 9

  **References**:

  **Pattern References**:
  - `src/utils/doc-search.ts` (from Task 5) — DocSearchEngine class, search/getByClassName/getByNamespace methods
  - MCP SDK tool registration pattern: `server.registerTool(name, { schema, handler })`

  **API/Type References**:
  - `src/types.ts:DocSearchResult` — Search result type to format into tool response
  - `src/types.ts:DocEntry` — Document entry type
  - Zod v4: `import * as z from 'zod/v4'` — for input schema definition
  - MCP `CallToolResult` — Tool return value (content array with type "text")

  **External References**:
  - MCP SDK registerTool: https://github.com/modelcontextprotocol/typescript-sdk — Tool handler signature and return format

  **WHY Each Reference Matters**:
  - DocSearchEngine is the core data access layer — this tool is a thin MCP wrapper around it
  - The Zod v4 import path is critical — wrong path causes runtime errors
  - CallToolResult defines the exact content array format tools must return

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/tools/api-lookup.test.ts` has ≥ 6 test cases
  - [ ] `npx vitest run tests/tools/api-lookup.test.ts` → all pass
  - [ ] Tool registered as `monogame_api_lookup`
  - [ ] Search returns formatted markdown results
  - [ ] Namespace and category filtering work

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: API lookup returns relevant results
    Tool: Bash
    Preconditions: Tasks 2, 5, 9, 10 complete
    Steps:
      1. Run `npx vitest run tests/tools/api-lookup.test.ts --reporter=verbose`
      2. Assert test for "SpriteBatch" query returns result containing "SpriteBatch"
      3. Assert result content is formatted markdown (contains "##" headers)
    Expected Result: All API lookup tests pass with formatted results
    Failure Indicators: No results, wrong formatting, test failures
    Evidence: .sisyphus/evidence/task-10-api-lookup-tests.txt

  Scenario: No results returns helpful message
    Tool: Bash
    Preconditions: Task 10 complete
    Steps:
      1. Run test with query "xyznonexistent"
      2. Assert response contains helpful "no results found" message (not empty content)
    Expected Result: Friendly "no results" message returned
    Failure Indicators: Empty response, error thrown
    Evidence: .sisyphus/evidence/task-10-no-results.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add API reference lookup tool`
  - Files: `src/tools/api-lookup.ts, tests/tools/api-lookup.test.ts`
  - Pre-commit: `npx vitest run tests/tools/api-lookup.test.ts`

- [ ] 11. Tool — Error Diagnosis

  **What to do**:
  - Create `src/tools/diagnose-error.ts` with the error diagnosis tool
  - TDD: Write `tests/tools/diagnose-error.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_diagnose_error`
    - Description: "Diagnose MonoGame error messages and suggest fixes"
    - Input schema (Zod v4):
      - `errorMessage` (string, required) — The error message or exception text
      - `context` (string, optional) — Additional context (what the user was doing when error occurred)
  - Handler implementation:
    - Use `diagnoseError()` from Task 8 to match against known patterns
    - If match found: return structured diagnosis with cause, solution steps, relevant doc links, and code examples
    - If no match: return general troubleshooting advice + suggest checking MonoGame community forums
    - Format output as readable markdown with sections: **Error Identified**, **Likely Cause**, **Solution**, **Related Documentation**
  - Test cases:
    - Known error "Content file not found" → returns content pipeline diagnosis
    - Known error with "Begin must be called" → returns SpriteBatch lifecycle diagnosis
    - Unknown error → returns general troubleshooting advice (not empty or error)
    - Empty error message → returns validation error
    - Error with context provided → context appears in output

  **Must NOT do**:
  - Do NOT parse stack traces
  - Do NOT suggest installing third-party tools not related to MonoGame
  - Do NOT hallucinate error patterns not in the database

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Wraps existing error-diagnosis utility, requires good formatting of diagnosis output
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12 — after Task 9)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 8, 9

  **References**:

  **Pattern References**:
  - `src/utils/error-diagnosis.ts` (from Task 8) — `diagnoseError()` function and `listErrorPatterns()`
  - `src/tools/api-lookup.ts` (from Task 10) — Follow same tool registration pattern for consistency

  **API/Type References**:
  - `src/types.ts:ErrorPattern` — Error pattern interface with regex, cause, solution, docLinks
  - Zod v4: `import * as z from 'zod/v4'` — for input schema
  - MCP `CallToolResult` — Content array return format

  **WHY Each Reference Matters**:
  - The error-diagnosis utility does the heavy lifting — this tool just wraps it with MCP registration and formatting
  - Follow the api-lookup tool pattern for consistent registration and response formatting
  - ErrorPattern type shows what fields are available for formatting the diagnosis

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/tools/diagnose-error.test.ts` has ≥ 5 test cases
  - [ ] `npx vitest run tests/tools/diagnose-error.test.ts` → all pass
  - [ ] Tool registered as `monogame_diagnose_error`
  - [ ] Known errors return structured diagnosis with cause + solution
  - [ ] Unknown errors return general troubleshooting (not empty)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Known error diagnosed correctly
    Tool: Bash
    Preconditions: Tasks 8, 9, 11 complete
    Steps:
      1. Run `npx vitest run tests/tools/diagnose-error.test.ts --reporter=verbose`
      2. Assert test for "Content file not found" returns diagnosis with "Content.RootDirectory" in solution
      3. Assert diagnosis includes docLinks array
    Expected Result: Known errors produce accurate, actionable diagnoses
    Failure Indicators: Wrong diagnosis, missing solution, test failures
    Evidence: .sisyphus/evidence/task-11-error-diagnosis-tests.txt

  Scenario: Unknown error gives general advice
    Tool: Bash
    Preconditions: Task 11 complete
    Steps:
      1. Run test with unrecognized error message
      2. Assert response contains general troubleshooting suggestions
      3. Assert response mentions MonoGame community forums
    Expected Result: Helpful fallback response for unrecognized errors
    Failure Indicators: Empty response, exception thrown
    Evidence: .sisyphus/evidence/task-11-unknown-error.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add error diagnosis tool`
  - Files: `src/tools/diagnose-error.ts, tests/tools/diagnose-error.test.ts`
  - Pre-commit: `npx vitest run tests/tools/diagnose-error.test.ts`

- [ ] 12. Tool — Code Scaffolding

  **What to do**:
  - Create `src/tools/scaffold-code.ts` with the code scaffolding tool
  - TDD: Write `tests/tools/scaffold-code.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_scaffold_code`
    - Description: "Generate MonoGame C# code from templates — game classes, components, input handlers, and more"
    - Input schema (Zod v4):
      - `template` (string, required) — Template name (game-class, drawable-component, game-component, input-handler, sprite-animation, scene-manager, collision-helper, audio-manager)
      - `className` (string, optional, default varies by template) — Class name for generated code
      - `namespace` (string, optional, default "MyGame") — C# namespace
      - `listTemplates` (boolean, optional) — If true, ignore other params and return list of available templates
  - Handler implementation:
    - Use `generateCode()` and `listTemplates()` from Task 7
    - If `listTemplates` is true: return formatted list of all templates with descriptions
    - Otherwise: generate code from template, return as text content
    - Validate template name exists before generation — return helpful error if not
  - Test cases:
    - Generate "game-class" → returns valid C# with correct className and namespace
    - Generate "input-handler" → returns C# with Keyboard.GetState() pattern
    - List templates → returns all 8 templates with descriptions
    - Invalid template name → returns error with list of valid names
    - Default className/namespace → uses sensible defaults

  **Must NOT do**:
  - Do NOT generate multi-file outputs (one template = one file)
  - Do NOT validate C# syntax (just generate from templates)
  - Do NOT add templates beyond the 8 defined in Task 7

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Wraps scaffolding utility, needs input validation and clear formatting
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11 — after Task 9)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 7, 9

  **References**:

  **Pattern References**:
  - `src/utils/scaffolding.ts` (from Task 7) — `generateCode()` and `listTemplates()` functions
  - `src/tools/api-lookup.ts` (from Task 10) — Follow same tool registration pattern

  **API/Type References**:
  - `src/types.ts:ScaffoldTemplate` — Template metadata interface
  - Zod v4: `import * as z from 'zod/v4'` — for input schema
  - MCP `CallToolResult` — Content array return format

  **WHY Each Reference Matters**:
  - Scaffolding utility from Task 7 does the template generation — this tool wraps it with MCP
  - Follow api-lookup pattern for consistent tool structure across the server
  - ScaffoldTemplate type shows what metadata to include when listing templates

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/tools/scaffold-code.test.ts` has ≥ 5 test cases
  - [ ] `npx vitest run tests/tools/scaffold-code.test.ts` → all pass
  - [ ] Tool registered as `monogame_scaffold_code`
  - [ ] All 8 templates accessible via the tool
  - [ ] Invalid template name returns helpful error with valid names

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Code scaffolding generates valid template
    Tool: Bash
    Preconditions: Tasks 7, 9, 12 complete
    Steps:
      1. Run `npx vitest run tests/tools/scaffold-code.test.ts --reporter=verbose`
      2. Assert test for "game-class" template returns C# code containing "class" and "Game"
      3. Assert generated code contains the requested className and namespace
    Expected Result: Templates generate valid C# code with correct substitutions
    Failure Indicators: Template placeholders remaining, wrong class names, test failures
    Evidence: .sisyphus/evidence/task-12-scaffold-tests.txt

  Scenario: Invalid template returns helpful error
    Tool: Bash
    Preconditions: Task 12 complete
    Steps:
      1. Run test with template name "nonexistent-template"
      2. Assert response includes error message listing valid template names
    Expected Result: Clear error with available template names
    Failure Indicators: Generic error, exception thrown, empty response
    Evidence: .sisyphus/evidence/task-12-invalid-template.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add code scaffolding tool`
  - Files: `src/tools/scaffold-code.ts, tests/tools/scaffold-code.test.ts`
  - Pre-commit: `npx vitest run tests/tools/scaffold-code.test.ts`

- [ ] 13. Tool — Project Creation (dotnet new)

  **What to do**:
  - Create `src/tools/create-project.ts` with the project creation tool
  - TDD: Write `tests/tools/create-project.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_create_project`
    - Description: "Create a new MonoGame project using dotnet CLI templates"
    - Input schema (Zod v4):
      - `projectName` (string, required) — Name of the project (used as directory name and namespace)
      - `template` (enum, required) — MonoGame template: "desktopgl", "windowsdx", "android", "ios", "shared"
      - `outputDirectory` (string, optional) — Parent directory for the project (defaults to CWD)
  - Handler implementation:
    - Check prerequisites first: verify `dotnet` is installed using `checkPrerequisite()` from Task 4
    - Check MonoGame templates installed: `dotnet new list --tag MonoGame`
    - If templates not installed, return instructions: `dotnet new install MonoGame.Templates.CSharp`
    - Map template names: "desktopgl" → `mgdesktopgl`, "windowsdx" → `mgwindowsdx`, "android" → `mgandroid`, "ios" → `mgios`, "shared" → `mgshared`
    - Execute: `dotnet new {template} -n {projectName}` using `executeCommand()` from Task 4
    - Validate projectName: alphanumeric + underscores only, max 100 chars
    - Return success message with project path and next steps (how to build/run)
  - Test cases (use mocked subprocess — do NOT actually run dotnet in tests):
    - Valid project creation → returns success with project path
    - Missing dotnet → returns helpful "install dotnet" message
    - Missing MonoGame templates → returns "dotnet new install" instructions
    - Invalid project name (spaces, special chars) → returns validation error
    - Valid template mapping (desktopgl → mgdesktopgl)

  **Must NOT do**:
  - Do NOT actually run `dotnet new` in unit tests (mock `executeCommand`)
  - Do NOT modify generated project files after creation
  - Do NOT install dotnet or MonoGame templates automatically (only instruct)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: CLI integration with prerequisite checking, error handling, and subprocess mocking in tests
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14-18)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 4, 9

  **References**:

  **Pattern References**:
  - `src/utils/subprocess.ts` (from Task 4) — `executeCommand()` and `checkPrerequisite()` functions
  - `src/tools/api-lookup.ts` (from Task 10) — Follow same tool registration pattern

  **API/Type References**:
  - `src/types.ts:MonoGameTemplate` — Enum of template short names (mgdesktopgl, etc.)
  - `src/types.ts:MonoGamePlatform` — Enum of platform names
  - `src/types.ts:SubprocessResult` — Return type from executeCommand
  - Zod v4: `import * as z from 'zod/v4'`

  **External References**:
  - MonoGame CLI templates: `dotnet new list --tag MonoGame` shows available templates
  - dotnet CLI docs: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-new — Command syntax

  **WHY Each Reference Matters**:
  - Subprocess utility handles the secure command execution — this tool just calls it with the right args
  - MonoGameTemplate enum ensures we only accept valid template names
  - dotnet CLI docs confirm exact command syntax for project creation

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation (subprocess mocked)
  - [ ] `tests/tools/create-project.test.ts` has ≥ 5 test cases
  - [ ] `npx vitest run tests/tools/create-project.test.ts` → all pass
  - [ ] Tool registered as `monogame_create_project`
  - [ ] Prerequisite checking works (dotnet, templates)
  - [ ] Project name validation rejects invalid names

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Project creation tool handles valid input
    Tool: Bash
    Preconditions: Tasks 4, 9, 13 complete
    Steps:
      1. Run `npx vitest run tests/tools/create-project.test.ts --reporter=verbose`
      2. Assert test for valid project creation passes (with mocked subprocess)
      3. Assert response includes project path and next steps
    Expected Result: All project creation tests pass
    Failure Indicators: Mock not working, wrong command args, test failures
    Evidence: .sisyphus/evidence/task-13-create-project-tests.txt

  Scenario: Invalid project name rejected
    Tool: Bash
    Preconditions: Task 13 complete
    Steps:
      1. Run test with projectName "my project!" (spaces and special chars)
      2. Assert response is a validation error mentioning allowed characters
    Expected Result: Validation error for invalid project name
    Failure Indicators: Name accepted without validation
    Evidence: .sisyphus/evidence/task-13-invalid-name.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add project creation tool with dotnet CLI integration`
  - Files: `src/tools/create-project.ts, tests/tools/create-project.test.ts`
  - Pre-commit: `npx vitest run tests/tools/create-project.test.ts`

- [ ] 14. Tool — Content Pipeline Management (add/remove/configure assets in .mgcb)

  **What to do**:
  - Create `src/tools/manage-content.ts` with the content pipeline management tool
  - TDD: Write `tests/tools/manage-content.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_manage_content`
    - Description: "Add, remove, or configure assets in a MonoGame .mgcb content project file"
    - Input schema (Zod v4):
      - `action` (enum, required) — "add", "remove", "list", "info"
      - `mgcbPath` (string, required) — Path to the .mgcb file
      - `assetPath` (string, optional) — Path to the asset file (required for add/remove)
      - `importer` (string, optional) — Override importer (auto-detected from extension if not provided)
      - `processor` (string, optional) — Override processor (auto-detected if not provided)
      - `processorParams` (record of string-to-string, optional) — Processor parameters
  - Handler implementation:
    - Read the .mgcb file from disk using `fs/promises`
    - Parse with `parseMgcb()` from Task 6
    - For "add": use `addContentEntry()` + `getImporterForExtension()` for auto-detection, write back to disk
    - For "remove": use `removeContentEntry()`, write back to disk
    - For "list": return all content entries with their importers/processors
    - For "info": return global project properties (platform, outputDir, etc.)
    - Validate .mgcb path exists before operations
    - Return formatted summary of changes made
  - Test cases (use mock filesystem or temp files):
    - Add .png asset → entry added with TextureImporter/TextureProcessor
    - Add .wav asset → entry added with WavImporter
    - Add with custom importer override → uses specified importer
    - Remove existing asset → entry removed
    - Remove non-existent asset → helpful error
    - List entries → returns formatted list
    - Info → returns global properties
    - Invalid .mgcb path → file not found error

  **Must NOT do**:
  - Do NOT validate that the asset file exists on disk (just modify the .mgcb)
  - Do NOT run MGCB build after modifying (that's Task 15)
  - Do NOT modify files other than the specified .mgcb file

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: File I/O with MGCB parsing, multiple action paths, requires careful error handling
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 15-18)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 4, 6, 9

  **References**:

  **Pattern References**:
  - `src/utils/mgcb-parser.ts` (from Task 6) — `parseMgcb()`, `serializeMgcb()`, `addContentEntry()`, `removeContentEntry()`, `getImporterForExtension()`
  - `src/tools/api-lookup.ts` (from Task 10) — Follow same tool registration pattern

  **API/Type References**:
  - `src/types.ts:MgcbProject` — Parsed .mgcb file structure
  - `src/types.ts:MgcbEntry` — Content entry structure (path, importer, processor, processorParams)
  - Zod v4: `import * as z from 'zod/v4'`

  **External References**:
  - MGCB file format: See Task 6's "What to do" for canonical format — this tool reads/writes that format

  **WHY Each Reference Matters**:
  - MGCB parser does all heavy lifting — this tool orchestrates file I/O + parser calls
  - MgcbProject/MgcbEntry types define exact data structures flowing through the tool
  - The format reference ensures we understand what "add" and "remove" actually modify in the file

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/tools/manage-content.test.ts` has ≥ 8 test cases
  - [ ] `npx vitest run tests/tools/manage-content.test.ts` → all pass
  - [ ] Tool registered as `monogame_manage_content`
  - [ ] Add/remove/list/info actions all work correctly
  - [ ] Auto-detection of importers from file extension works

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Add asset to .mgcb file
    Tool: Bash
    Preconditions: Tasks 6, 9, 14 complete
    Steps:
      1. Run `npx vitest run tests/tools/manage-content.test.ts --reporter=verbose`
      2. Assert test for adding .png asset passes
      3. Assert the serialized .mgcb contains the new entry with TextureImporter
    Expected Result: Asset added with correct importer auto-detection
    Failure Indicators: Wrong importer, serialization errors, test failures
    Evidence: .sisyphus/evidence/task-14-manage-content-tests.txt

  Scenario: Remove non-existent asset returns error
    Tool: Bash
    Preconditions: Task 14 complete
    Steps:
      1. Run test that tries to remove "Sprites/nonexistent.png" from .mgcb
      2. Assert response indicates asset not found (not a crash)
    Expected Result: Helpful error message, not an exception
    Failure Indicators: Unhandled exception, silent success
    Evidence: .sisyphus/evidence/task-14-remove-nonexistent.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add content pipeline management tool`
  - Files: `src/tools/manage-content.ts, tests/tools/manage-content.test.ts`
  - Pre-commit: `npx vitest run tests/tools/manage-content.test.ts`

- [ ] 15. Tool — Content Building (mgcb build)

  **What to do**:
  - Create `src/tools/build-content.ts` with the content building tool
  - TDD: Write `tests/tools/build-content.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_build_content`
    - Description: "Build MonoGame content assets using the MGCB CLI"
    - Input schema (Zod v4):
      - `mgcbPath` (string, required) — Path to the .mgcb file to build
      - `platform` (enum, optional) — Override platform: "DesktopGL", "WindowsDX", "Android", "iOS" (uses .mgcb default if not specified)
      - `rebuild` (boolean, optional, default false) — Force rebuild all content
      - `clean` (boolean, optional, default false) — Clean build outputs before building
  - Handler implementation:
    - Check prerequisite: MGCB CLI installed (`checkPrerequisite("dotnet-mgcb")`)
    - If not installed, return instructions: `dotnet tool install -g dotnet-mgcb`
    - Build command: `mgcb {mgcbPath}` with optional `/platform:{platform}` `/rebuild` `/clean`
    - Alternative: `dotnet mgcb {mgcbPath}` if installed as local tool
    - Use `executeCommand()` with 120-second timeout (builds can be slow)
    - Parse output: count successful/failed builds from stdout
    - Return structured result: build status, files processed count, any errors
  - Test cases (mock subprocess):
    - Successful build → returns success with file count
    - Missing MGCB → returns install instructions
    - Build with errors → returns error details from stderr
    - Rebuild flag → args include "/rebuild"
    - Clean flag → args include "/clean"
    - Platform override → args include "/platform:{value}"

  **Must NOT do**:
  - Do NOT install MGCB automatically (instruct the user)
  - Do NOT modify the .mgcb file before building (that's Task 14)
  - Do NOT set timeout below 60 seconds (builds can be slow)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CLI wrapper with subprocess integration, moderate complexity
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14, 16-18)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 4, 6, 9

  **References**:

  **Pattern References**:
  - `src/utils/subprocess.ts` (from Task 4) — `executeCommand()` and `checkPrerequisite()`
  - `src/tools/create-project.ts` (from Task 13) — Follow same CLI tool pattern (prerequisite check → execute → format result)

  **API/Type References**:
  - `src/types.ts:SubprocessResult` — Return type from executeCommand
  - MGCB CLI args: `mgcb <file.mgcb> [/platform:<platform>] [/rebuild] [/clean]`
  - Zod v4: `import * as z from 'zod/v4'`

  **External References**:
  - MGCB CLI docs: https://docs.monogame.net/articles/getting_to_know/howto/content/index.html — MGCB command line usage
  - `src/docs/content-pipeline/overview.md` (from Task 2) — Content pipeline flow description

  **WHY Each Reference Matters**:
  - Subprocess utility handles execution safety — this tool composes the right command args
  - Follow create-project tool pattern for consistent CLI tool structure
  - MGCB CLI docs confirm exact command arguments and output format

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first (subprocess mocked), then implementation
  - [ ] `tests/tools/build-content.test.ts` has ≥ 6 test cases
  - [ ] `npx vitest run tests/tools/build-content.test.ts` → all pass
  - [ ] Tool registered as `monogame_build_content`
  - [ ] 120-second timeout configured for builds
  - [ ] Prerequisite check for MGCB works

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Content build tool handles valid input
    Tool: Bash
    Preconditions: Tasks 4, 9, 15 complete
    Steps:
      1. Run `npx vitest run tests/tools/build-content.test.ts --reporter=verbose`
      2. Assert test for successful build passes (mocked subprocess returns exit code 0)
      3. Assert build result includes file count and status
    Expected Result: All content build tests pass
    Failure Indicators: Wrong command args, missing timeout, test failures
    Evidence: .sisyphus/evidence/task-15-build-content-tests.txt

  Scenario: Missing MGCB returns install instructions
    Tool: Bash
    Preconditions: Task 15 complete
    Steps:
      1. Run test where checkPrerequisite returns unavailable
      2. Assert response contains "dotnet tool install -g dotnet-mgcb"
    Expected Result: Clear installation instructions
    Failure Indicators: Generic error, no install guidance
    Evidence: .sisyphus/evidence/task-15-missing-mgcb.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add content building tool with MGCB CLI integration`
  - Files: `src/tools/build-content.ts, tests/tools/build-content.test.ts`
  - Pre-commit: `npx vitest run tests/tools/build-content.test.ts`

- [ ] 16. Tool — Build and Run Project (dotnet build/run)

  **What to do**:
  - Create `src/tools/build-run.ts` with the build and run tool
  - TDD: Write `tests/tools/build-run.test.ts` FIRST, then implement
  - Tool registration:
    - Name: `monogame_build_run`
    - Description: "Build or run a MonoGame project using dotnet CLI"
    - Input schema (Zod v4):
      - `action` (enum, required) — "build" or "run"
      - `projectPath` (string, required) — Path to the .csproj file or project directory
      - `configuration` (enum, optional, default "Debug") — "Debug" or "Release"
      - `restore` (boolean, optional, default true) — Run dotnet restore before build
  - Handler implementation:
    - Check prerequisite: `dotnet` installed
    - For "build": `dotnet build {projectPath} -c {configuration}` (with optional `--no-restore`)
    - For "run": `dotnet run --project {projectPath} -c {configuration}` (with optional `--no-restore`)
    - Use `executeCommand()` with 120-second timeout for builds
    - Parse output: look for "Build succeeded" / error count / warning count
    - Return structured result: build status, errors, warnings, output path
    - If build fails: include error details and suggest running error diagnosis tool
  - Test cases (mock subprocess):
    - Successful build → returns success with "Build succeeded"
    - Build with errors → returns error count and details
    - Run action → correct command args (`dotnet run --project`)
    - Missing dotnet → install instructions
    - Release configuration → args include `-c Release`
    - No restore → args include `--no-restore`

  **Must NOT do**:
  - Do NOT keep the game running indefinitely for "run" — return the output
  - Do NOT parse MSBuild XML output (text parsing of stdout is sufficient)
  - Do NOT modify .csproj files

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CLI wrapper similar to Tasks 13 and 15, moderate complexity
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13-15, 17-18)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 4, 9

  **References**:

  **Pattern References**:
  - `src/utils/subprocess.ts` (from Task 4) — `executeCommand()` and `checkPrerequisite()`
  - `src/tools/create-project.ts` (from Task 13) — Follow same CLI tool pattern
  - `src/tools/build-content.ts` (from Task 15) — Follow same build tool pattern

  **API/Type References**:
  - `src/types.ts:SubprocessResult` — Return type from executeCommand
  - dotnet CLI: `dotnet build <project> -c <config>`, `dotnet run --project <project> -c <config>`
  - Zod v4: `import * as z from 'zod/v4'`

  **External References**:
  - dotnet build docs: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-build — Command syntax
  - dotnet run docs: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-run — Command syntax

  **WHY Each Reference Matters**:
  - Follow established CLI tool patterns for consistency
  - dotnet CLI docs confirm exact argument syntax and expected output format
  - SubprocessResult is the standard return type for all CLI operations

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first (subprocess mocked), then implementation
  - [ ] `tests/tools/build-run.test.ts` has ≥ 6 test cases
  - [ ] `npx vitest run tests/tools/build-run.test.ts` → all pass
  - [ ] Tool registered as `monogame_build_run`
  - [ ] Both "build" and "run" actions work
  - [ ] Build failures suggest using error diagnosis tool

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Build tool handles successful build
    Tool: Bash
    Preconditions: Tasks 4, 9, 16 complete
    Steps:
      1. Run `npx vitest run tests/tools/build-run.test.ts --reporter=verbose`
      2. Assert test for successful build passes (mocked subprocess)
      3. Assert response includes "Build succeeded" and output path
    Expected Result: All build/run tests pass
    Failure Indicators: Wrong command args, test failures
    Evidence: .sisyphus/evidence/task-16-build-run-tests.txt

  Scenario: Failed build suggests error diagnosis
    Tool: Bash
    Preconditions: Task 16 complete
    Steps:
      1. Run test where build fails (mock returns non-zero exit code)
      2. Assert response mentions using monogame_diagnose_error tool
    Expected Result: Failed build output includes error diagnosis suggestion
    Failure Indicators: No suggestion, generic error only
    Evidence: .sisyphus/evidence/task-16-build-failure.txt
  ```

  **Commit**: YES
  - Message: `feat(tools): add build and run tool with dotnet CLI integration`
  - Files: `src/tools/build-run.ts, tests/tools/build-run.test.ts`
  - Pre-commit: `npx vitest run tests/tools/build-run.test.ts`

- [ ] 17. Resources — API Reference, Code Examples, Content Pipeline, Platform Guides

  **What to do**:
  - Create `src/resources/index.ts` that registers all 4 resource types
  - TDD: Write `tests/resources/resources.test.ts` FIRST, then implement
  - **Resource 1: API Reference** (`monogame://api/{className}`)
    - Uses `ResourceTemplate` with `className` parameter
    - Handler: Look up class doc from `DocSearchEngine.getByClassName()`, return markdown content
    - Example URI: `monogame://api/SpriteBatch` → returns SpriteBatch API doc
  - **Resource 2: Code Examples** (`monogame://examples/{topic}`)
    - Uses `ResourceTemplate` with `topic` parameter
    - Handler: Look up example doc from examples category, return markdown
    - Example URI: `monogame://examples/input-handling` → returns input handling patterns
  - **Resource 3: Content Pipeline** (`monogame://content-pipeline/{topic}`)
    - Uses `ResourceTemplate` with `topic` parameter
    - Handler: Look up content pipeline doc, return markdown
    - Example URI: `monogame://content-pipeline/overview` → returns pipeline overview
  - **Resource 4: Platform Guides** (`monogame://platforms/{platform}`)
    - Uses `ResourceTemplate` with `platform` parameter
    - Handler: Look up platform guide doc, return markdown
    - Example URI: `monogame://platforms/desktopgl` → returns DesktopGL guide
  - Also register static resource list entries so `resources/list` shows all available docs
  - Test cases:
    - Each resource template resolves valid URIs
    - API resource for "SpriteBatch" returns SpriteBatch doc content
    - Example resource for "input-handling" returns input handling doc
    - Invalid class name → returns "not found" (not error)
    - Resources list returns all available resource URIs

  **Must NOT do**:
  - Do NOT add resources beyond the 4 types specified
  - Do NOT create wrapper classes for resources (use SDK registration directly)
  - Do NOT serve HTML — only markdown text content

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple resource registrations with URI templates, requires understanding MCP resource patterns
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13-16, 18)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 5, 9

  **References**:

  **Pattern References**:
  - `src/utils/doc-search.ts` (from Task 5) — DocSearchEngine for looking up docs by class/category
  - MCP SDK resource registration: `server.registerResource(name, template, meta, handler)`
  - `ResourceTemplate` from `@modelcontextprotocol/server` — URI template support

  **API/Type References**:
  - `src/types.ts:DocEntry` — Doc entry with path, title, content, category, namespace
  - `src/docs/index.ts` (from Task 2) — Doc manifest listing all available docs
  - `ResourceTemplate('monogame://api/{className}')` — URI template syntax
  - MCP resource handler signature: `async (uri: URL) => { contents: [{ uri, mimeType, text }] }`

  **External References**:
  - MCP SDK ResourceTemplate: https://github.com/modelcontextprotocol/typescript-sdk — Resource template examples

  **WHY Each Reference Matters**:
  - DocSearchEngine provides data access — resources are thin MCP wrappers returning doc content
  - ResourceTemplate defines how URI parameters are extracted from resource URIs
  - Doc manifest from Task 2 determines what URIs to register in the resource list

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/resources/resources.test.ts` has ≥ 8 test cases (2 per resource type)
  - [ ] `npx vitest run tests/resources/resources.test.ts` → all pass
  - [ ] 4 resource types registered with URI templates
  - [ ] `resources/list` returns all available resource URIs
  - [ ] Each resource returns markdown content for valid URIs

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: API resource returns class documentation
    Tool: Bash
    Preconditions: Tasks 2, 5, 9, 17 complete
    Steps:
      1. Run `npx vitest run tests/resources/resources.test.ts --reporter=verbose`
      2. Assert test for monogame://api/SpriteBatch returns content containing "SpriteBatch"
      3. Assert content is markdown text (contains "##" or "**")
    Expected Result: API resources serve correct documentation
    Failure Indicators: Empty content, wrong doc returned, test failures
    Evidence: .sisyphus/evidence/task-17-resources-tests.txt

  Scenario: Invalid resource URI returns not found
    Tool: Bash
    Preconditions: Task 17 complete
    Steps:
      1. Run test with URI monogame://api/NonexistentClass
      2. Assert response indicates resource not found (graceful, not crash)
    Expected Result: Graceful "not found" response
    Failure Indicators: Unhandled exception, server crash
    Evidence: .sisyphus/evidence/task-17-not-found.txt
  ```

  **Commit**: YES
  - Message: `feat(resources): add documentation resources with URI templates`
  - Files: `src/resources/index.ts, tests/resources/resources.test.ts`
  - Pre-commit: `npx vitest run tests/resources/resources.test.ts`

- [ ] 18. Prompts — Code Review, Error Troubleshooting, Architecture Planning, Feature Implementation

  **What to do**:
  - Create `src/prompts/index.ts` that registers all 4 prompt templates
  - TDD: Write `tests/prompts/prompts.test.ts` FIRST, then implement
  - **Prompt 1: Code Review** (`monogame_code_review`)
    - Description: "Review MonoGame game code for best practices and common issues"
    - Arguments: `code` (string, required — the C# code to review), `focus` (string, optional — specific area to focus on: "performance", "patterns", "content-pipeline", "rendering")
    - Returns: System message with MonoGame best practices checklist + user message with the code
  - **Prompt 2: Error Troubleshooting** (`monogame_troubleshoot`)
    - Description: "Troubleshoot a MonoGame error or issue"
    - Arguments: `error` (string, required — error message or description), `code` (string, optional — relevant code snippet), `platform` (string, optional — target platform)
    - Returns: System message with MonoGame troubleshooting methodology + user message with error details
  - **Prompt 3: Architecture Planning** (`monogame_architecture`)
    - Description: "Plan game architecture for a MonoGame project"
    - Arguments: `gameType` (string, required — genre/type: "2d-platformer", "top-down", "puzzle", etc.), `features` (string, optional — key features needed), `scale` (string, optional — "small", "medium", "large")
    - Returns: System message with MonoGame architecture patterns + user message with project requirements
  - **Prompt 4: Feature Implementation** (`monogame_implement_feature`)
    - Description: "Get step-by-step guidance to implement a MonoGame feature"
    - Arguments: `feature` (string, required — what to implement), `existingCode` (string, optional — current relevant code), `platform` (string, optional — target platform)
    - Returns: System message with MonoGame implementation patterns + user message with feature description
  - Each prompt should include relevant MonoGame-specific knowledge in the system message:
    - Game loop lifecycle (Initialize → LoadContent → Update → Draw)
    - Content pipeline awareness
    - Platform-specific considerations
    - Common pitfalls and anti-patterns
  - Test cases:
    - Each prompt returns messages array with system + user messages
    - Code review prompt includes best practices checklist in system message
    - Error troubleshooting prompt includes diagnostic steps in system message
    - Architecture prompt includes component/scene patterns in system message
    - Feature prompt includes step-by-step methodology in system message
    - All prompts handle optional parameters gracefully

  **Must NOT do**:
  - Do NOT add prompts beyond the 4 specified
  - Do NOT include game design advice (stick to technical MonoGame implementation)
  - Do NOT create wrapper classes for prompts (use SDK registration directly)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires MonoGame domain knowledge for crafting effective prompt templates
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13-17)
  - **Blocks**: Task 22
  - **Blocked By**: Task 9

  **References**:

  **Pattern References**:
  - MCP SDK prompt registration: `server.registerPrompt(name, { schema, handler })`
  - MCP prompt handler returns: `{ messages: [{ role: "user"|"assistant", content: { type: "text", text: "..." } }] }`

  **API/Type References**:
  - Zod v4: `import * as z from 'zod/v4'` — for argument schemas
  - MCP prompt handler return type: `{ messages: PromptMessage[] }`

  **External References**:
  - MCP SDK prompt examples: https://github.com/modelcontextprotocol/typescript-sdk — Prompt registration patterns
  - MonoGame best practices: Context7 `/monogame/docs.monogame.github.io` — Game loop, content pipeline, rendering patterns

  **WHY Each Reference Matters**:
  - SDK examples show exact prompt registration and message return format
  - MonoGame best practices from Context7 provide accurate content for system messages
  - Prompt message format must match MCP spec exactly (role + content structure)

  **Acceptance Criteria**:

  - [ ] TDD: Tests written first, then implementation
  - [ ] `tests/prompts/prompts.test.ts` has ≥ 8 test cases (2 per prompt)
  - [ ] `npx vitest run tests/prompts/prompts.test.ts` → all pass
  - [ ] 4 prompts registered with correct names
  - [ ] Each prompt returns messages with system + user roles
  - [ ] System messages contain MonoGame-specific knowledge

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Prompts return correctly structured messages
    Tool: Bash
    Preconditions: Tasks 9, 18 complete
    Steps:
      1. Run `npx vitest run tests/prompts/prompts.test.ts --reporter=verbose`
      2. Assert all prompt tests pass
      3. Assert code review prompt response has "role: 'user'" and "role: 'assistant'" messages
      4. Assert system messages contain MonoGame-specific terms ("SpriteBatch", "Content", "Game loop")
    Expected Result: All 4 prompts return correctly structured messages with MonoGame knowledge
    Failure Indicators: Wrong message structure, missing MonoGame content, test failures
    Evidence: .sisyphus/evidence/task-18-prompts-tests.txt

  Scenario: Prompts handle missing optional arguments
    Tool: Bash
    Preconditions: Task 18 complete
    Steps:
      1. Run test for code review prompt with only required "code" argument (no "focus")
      2. Assert response is still valid with full system message
    Expected Result: Optional arguments don't break prompt generation
    Failure Indicators: Error when optional args missing
    Evidence: .sisyphus/evidence/task-18-optional-args.txt
  ```

  **Commit**: YES
  - Message: `feat(prompts): add MonoGame prompt templates for code review, troubleshooting, architecture, and features`
  - Files: `src/prompts/index.ts, tests/prompts/prompts.test.ts`
  - Pre-commit: `npx vitest run tests/prompts/prompts.test.ts`

- [ ] 19. npm Packaging — package.json bin, files, prepublish scripts

  **What to do**:
  - Update `package.json` with production-ready packaging configuration
  - TDD: Write `tests/packaging.test.ts` FIRST, then implement
  - Package configuration:
    - `"name": "monogame-mcp"`, `"version": "0.1.0"`
    - `"bin": { "monogame-mcp": "./build/index.js" }` — enables `npx monogame-mcp`
    - `"files": ["build", "src/docs"]` — only ship compiled JS + bundled docs
    - `"main": "./build/index.js"`, `"types": "./build/index.d.ts"`
    - `"scripts"`: `"build": "tsc"`, `"prepublishOnly": "npm run build && npm test"`, `"test": "vitest run"`
    - `"engines": { "node": ">=18" }` — minimum Node.js version
    - `"keywords": ["monogame", "mcp", "game-development", "xna", "ai"]`
    - `"description": "MCP server for MonoGame game framework — AI-powered documentation, project management, and code generation"`
    - `"license": "MIT"`
    - `"repository"` field pointing to the GitHub repo
  - Build steps:
    - Run `npm run build` to compile TypeScript → `build/` directory
    - Verify `build/index.js` has shebang preserved
    - Verify `build/index.js` is executable (add in prepublish if needed)
  - Create `.npmignore` if needed to exclude test files, .sisyphus, etc.
  - Test cases:
    - `npm pack --dry-run` → lists expected files, < 5MB total
    - `build/index.js` exists after `npm run build`
    - `build/index.js` starts with `#!/usr/bin/env node`
    - Package includes `build/` and `src/docs/` directories
    - Package excludes `tests/`, `node_modules/`, `.sisyphus/`

  **Must NOT do**:
  - Do NOT include test files in the package
  - Do NOT include source .ts files in the package (only compiled .js)
  - Do NOT exceed 5MB package size
  - Do NOT set up npm publishing (just prepare the package)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration-focused task — package.json edits and file verification
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs all source tasks complete first)
  - **Parallel Group**: Wave 5 (sequential start, then 19-22 in parallel)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 1-18

  **References**:

  **Pattern References**:
  - `package.json` (existing from Task 1) — Update with production fields
  - MCP server packages on npm: `@modelcontextprotocol/server-*` — Follow their packaging conventions

  **API/Type References**:
  - npm package.json spec: `bin`, `files`, `main`, `types`, `engines`, `scripts`

  **External References**:
  - npm docs on package.json: https://docs.npmjs.com/cli/v10/configuring-npm/package-json — Field reference
  - npm pack docs: https://docs.npmjs.com/cli/v10/commands/npm-pack — Verify package contents

  **WHY Each Reference Matters**:
  - MCP server packages show the canonical npm packaging pattern for MCP servers
  - npm docs confirm which fields are needed for bin entry (npx execution), files inclusion, and engine requirements

  **Acceptance Criteria**:

  - [ ] `npm run build` → compiles successfully to `build/`
  - [ ] `npm pack --dry-run` → shows < 5MB, includes build/ and src/docs/
  - [ ] `npm pack --dry-run` → excludes tests/, .sisyphus/, node_modules/
  - [ ] `build/index.js` has `#!/usr/bin/env node` shebang
  - [ ] `package.json` has correct bin, files, main, types fields

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Package size is under 5MB
    Tool: Bash
    Preconditions: Tasks 1-18 complete, npm run build done
    Steps:
      1. Run `npm run build`
      2. Run `npm pack --dry-run 2>&1`
      3. Assert total size < 5MB (5242880 bytes)
      4. Assert output lists build/ and src/docs/ files
      5. Assert output does NOT list tests/ or .sisyphus/
    Expected Result: Package is < 5MB and contains only production files
    Failure Indicators: Package > 5MB, test files included, missing build files
    Evidence: .sisyphus/evidence/task-19-package-size.txt

  Scenario: Built entry point has shebang
    Tool: Bash
    Preconditions: npm run build complete
    Steps:
      1. Read first line of build/index.js
      2. Assert it starts with "#!/usr/bin/env node"
    Expected Result: Shebang preserved in compiled output
    Failure Indicators: Missing shebang (TypeScript compiler strips it)
    Evidence: .sisyphus/evidence/task-19-shebang-preserved.txt
  ```

  **Commit**: YES
  - Message: `chore(package): configure npm packaging with bin entry and size constraints`
  - Files: `package.json, .npmignore (if created)`
  - Pre-commit: `npm run build && npm pack --dry-run`

- [ ] 20. Dockerfile — Multi-Stage Build for Docker Distribution

  **What to do**:
  - Create `Dockerfile` for building and running the MCP server in Docker
  - Create `.dockerignore` to exclude unnecessary files
  - TDD: Write `tests/docker.test.ts` with pre-build verification tests, then create Dockerfile
  - Dockerfile design (multi-stage):
    ```dockerfile
    # Stage 1: Build
    FROM node:20-slim AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY tsconfig.json ./
    COPY src/ ./src/
    RUN npm run build

    # Stage 2: Production
    FROM node:20-slim
    # Install .NET SDK for dotnet CLI tools
    RUN apt-get update && apt-get install -y wget && \
        wget https://dot.net/v1/dotnet-install.sh && \
        chmod +x dotnet-install.sh && \
        ./dotnet-install.sh --channel 8.0 && \
        rm dotnet-install.sh && \
        apt-get remove -y wget && apt-get autoremove -y
    ENV PATH="${PATH}:/root/.dotnet"
    WORKDIR /app
    COPY --from=builder /app/build ./build
    COPY --from=builder /app/src/docs ./src/docs
    COPY --from=builder /app/node_modules ./node_modules
    COPY package.json ./
    ENTRYPOINT ["node", "build/index.js"]
    ```
  - `.dockerignore`:
    ```
    node_modules
    build
    tests
    .sisyphus
    .git
    *.md
    !src/docs/**/*.md
    ```
  - The Docker image should:
    - Include Node.js 20 runtime
    - Include .NET SDK 8.0 (for dotnet CLI tools)
    - Include compiled server code and bundled docs
    - Run the MCP server via stdio
    - NOT include TypeScript source, test files, or dev dependencies

  **Must NOT do**:
  - Do NOT install MonoGame templates in the Docker image (user does this)
  - Do NOT use Alpine (dotnet SDK needs glibc)
  - Do NOT include dev dependencies in production stage
  - Do NOT expose any ports (stdio transport, not HTTP)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-stage Docker build with .NET SDK installation, requires careful layer optimization
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 19, 21, 22)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Task 19

  **References**:

  **Pattern References**:
  - Multi-stage Docker build patterns — Builder stage compiles, production stage runs
  - `package.json` (from Task 19) — Scripts and dependencies

  **External References**:
  - .NET Docker install: https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual — dotnet-install.sh usage
  - Node.js Docker images: https://hub.docker.com/_/node — Official images
  - Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/ — Best practices

  **WHY Each Reference Matters**:
  - .NET install script is needed to add dotnet CLI to the Docker image for tool execution
  - Node.js 20-slim provides minimal runtime without extras
  - Multi-stage build keeps image small by excluding build tools and source code

  **Acceptance Criteria**:

  - [ ] `Dockerfile` exists with multi-stage build
  - [ ] `.dockerignore` excludes tests, .sisyphus, .git
  - [ ] `docker build -t monogame-mcp .` succeeds
  - [ ] Production image includes node, dotnet, build/, src/docs/
  - [ ] Production image does NOT include tests/, src/*.ts, node dev deps

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Docker image builds successfully
    Tool: Bash
    Preconditions: Tasks 1-19 complete, Docker available
    Steps:
      1. Run `docker build -t monogame-mcp .`
      2. Assert exit code is 0
      3. Assert image exists: `docker images monogame-mcp --format "{{.Repository}}:{{.Tag}}"`
    Expected Result: Docker image builds without errors
    Failure Indicators: Build errors, missing files, dependency issues
    Evidence: .sisyphus/evidence/task-20-docker-build.txt

  Scenario: Docker image runs MCP server
    Tool: Bash
    Preconditions: Docker image built
    Steps:
      1. Run `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"clientInfo":{"name":"test","version":"0.1"},"protocolVersion":"2024-11-05"}}' | docker run -i monogame-mcp`
      2. Assert output contains "result" with server capabilities
    Expected Result: Container runs MCP server and responds to initialize
    Failure Indicators: Container crash, no response, import errors
    Evidence: .sisyphus/evidence/task-20-docker-run.txt
  ```

  **Commit**: YES
  - Message: `chore(docker): add Dockerfile for container distribution`
  - Files: `Dockerfile, .dockerignore`
  - Pre-commit: `docker build -t monogame-mcp .`

- [ ] 21. README.md — Setup, Usage, and Configuration Documentation

  **What to do**:
  - Create `README.md` with comprehensive usage documentation
  - No TDD needed (documentation task)
  - README structure:
    - **Title + badges** — package name, version, license
    - **Quick Start** — 3-step setup: install, configure client, run
    - **Prerequisites** — Node.js 18+, .NET SDK 8.0, MonoGame templates (with install commands)
    - **Installation** — `npx monogame-mcp` or `npm install -g monogame-mcp` or Docker
    - **Configuration** — How to add to Claude Desktop, VS Code, Cursor, other MCP clients
      - Claude Desktop: `claude_desktop_config.json` with `"monogame-mcp": { "command": "npx", "args": ["monogame-mcp"] }`
      - Docker variant: `"command": "docker", "args": ["run", "-i", "monogame-mcp"]`
    - **Available Tools** — Table listing all 7 tools with names, descriptions, and example usage
    - **Available Resources** — Table listing all 4 resource URI templates with examples
    - **Available Prompts** — Table listing all 4 prompts with argument descriptions
    - **Examples** — 3-4 real-world usage scenarios:
      1. Creating a new project and setting up content
      2. Looking up SpriteBatch API and generating code
      3. Diagnosing a content pipeline error
      4. Building and running a project
    - **Development** — How to build from source, run tests, contribute
    - **License** — MIT

  **Must NOT do**:
  - Do NOT include tutorial content (just reference/usage docs)
  - Do NOT exceed 500 lines
  - Do NOT include screenshots (text-only)
  - Do NOT add badges for services not yet configured (no CI badge without CI)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Technical writing task — clear, structured documentation
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 19, 20, 22)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Task 19

  **References**:

  **Pattern References**:
  - MCP server READMEs: `https://github.com/modelcontextprotocol/servers` — Follow README structure of official MCP servers
  - `package.json` (from Task 19) — Package name, version, bin entry

  **API/Type References**:
  - All tool names, resource URIs, and prompt names from Tasks 10-18
  - Claude Desktop config format: `claude_desktop_config.json` structure

  **External References**:
  - MCP client configuration: https://modelcontextprotocol.io/quickstart — Client setup examples
  - Official MCP server READMEs — Format and structure reference

  **WHY Each Reference Matters**:
  - Official MCP server READMEs show the expected documentation format for MCP servers
  - Tool/resource/prompt names must exactly match what's registered in the server
  - Client configuration format must be accurate for users to set up correctly

  **Acceptance Criteria**:

  - [ ] `README.md` exists at project root
  - [ ] Includes quick start section with ≤ 3 steps
  - [ ] Lists all 7 tools with descriptions
  - [ ] Lists all 4 resources with URI templates
  - [ ] Lists all 4 prompts with arguments
  - [ ] Includes Claude Desktop configuration example
  - [ ] Under 500 lines

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: README contains all tools, resources, and prompts
    Tool: Bash
    Preconditions: Task 21 complete
    Steps:
      1. Read README.md
      2. Assert it contains all 7 tool names: monogame_api_lookup, monogame_create_project, monogame_manage_content, monogame_build_content, monogame_scaffold_code, monogame_diagnose_error, monogame_build_run
      3. Assert it contains all 4 resource URI schemes: monogame://api/, monogame://examples/, monogame://content-pipeline/, monogame://platforms/
      4. Assert it contains all 4 prompt names: monogame_code_review, monogame_troubleshoot, monogame_architecture, monogame_implement_feature
    Expected Result: README documents all MCP primitives
    Failure Indicators: Missing tools/resources/prompts
    Evidence: .sisyphus/evidence/task-21-readme-completeness.txt

  Scenario: README is under 500 lines
    Tool: Bash
    Preconditions: Task 21 complete
    Steps:
      1. Count lines in README.md
      2. Assert line count < 500
    Expected Result: README is concise (< 500 lines)
    Failure Indicators: Exceeds 500 lines
    Evidence: .sisyphus/evidence/task-21-readme-length.txt
  ```

  **Commit**: YES
  - Message: `docs: add README with setup, usage, and configuration guide`
  - Files: `README.md`
  - Pre-commit: none

- [ ] 22. Integration Test Suite — Full Server E2E with InMemoryTransport

  **What to do**:
  - Create `tests/integration/server-e2e.test.ts` with comprehensive end-to-end tests
  - This is a verification task — tests exercise the complete server through MCP protocol
  - Test setup:
    - Create server with `createServer()` from `src/server.ts`
    - Connect with `InMemoryTransport.createLinkedPair()` from `@modelcontextprotocol/core`
    - Send JSON-RPC messages through the client transport
    - Assert responses match expected behavior
  - **Integration test cases** (exercise all 7 tools + 4 resources + 4 prompts):
    - **Server lifecycle**: Initialize → capabilities include all tools/resources/prompts → shutdown cleanly
    - **Tool: monogame_api_lookup**: Search "SpriteBatch" → returns content with "SpriteBatch"
    - **Tool: monogame_diagnose_error**: Send "Content file not found" → returns diagnosis
    - **Tool: monogame_scaffold_code**: Request "game-class" template → returns C# code
    - **Tool: monogame_scaffold_code**: Request with `listTemplates: true` → returns 8 templates
    - **Tool: monogame_create_project**: Test with mocked subprocess → returns success message
    - **Tool: monogame_manage_content**: Test list action with a sample .mgcb file
    - **Tool: monogame_build_content**: Test with mocked subprocess → returns build result
    - **Tool: monogame_build_run**: Test with mocked subprocess → returns build output
    - **Resource: monogame://api/SpriteBatch**: Returns SpriteBatch documentation
    - **Resource: monogame://examples/input-handling**: Returns input handling patterns
    - **Resource: monogame://content-pipeline/overview**: Returns content pipeline overview
    - **Resource: monogame://platforms/desktopgl**: Returns DesktopGL guide
    - **Prompt: monogame_code_review**: Returns messages with system + user roles
    - **Prompt: monogame_troubleshoot**: Returns messages with troubleshooting methodology
    - **Prompt: monogame_architecture**: Returns messages with architecture patterns
    - **Prompt: monogame_implement_feature**: Returns messages with implementation guidance
    - **Error handling**: Invalid tool name → error response, invalid arguments → validation error
    - **Cross-feature**: Diagnose error → result mentions doc links that are valid resource URIs

  **Must NOT do**:
  - Do NOT spawn actual server processes (use InMemoryTransport)
  - Do NOT run actual dotnet/mgcb commands (mock subprocess for CLI tools)
  - Do NOT test individual utility functions (those have unit tests in Tasks 4-8)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex integration testing across all MCP primitives, requires careful transport and mock setup
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 19, 20, 21)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 10-18

  **References**:

  **Pattern References**:
  - `tests/server.test.ts` (from Task 9) — InMemoryTransport setup pattern
  - `src/server.ts` (from Task 9) — `createServer()` factory function

  **API/Type References**:
  - `InMemoryTransport.createLinkedPair()` from `@modelcontextprotocol/core` — Test transport
  - MCP JSON-RPC methods: `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, `prompts/get`
  - All tool input schemas from Tasks 10-16

  **External References**:
  - MCP protocol spec: https://modelcontextprotocol.io/specification — JSON-RPC method names and expected responses
  - MCP SDK test examples: https://github.com/modelcontextprotocol/typescript-sdk — Integration test patterns

  **WHY Each Reference Matters**:
  - Task 9's test setup shows the proven InMemoryTransport pattern — reuse it
  - Protocol spec confirms exact method names and response structures for each MCP operation
  - All tool schemas must be used with correct parameters for integration tests

  **Acceptance Criteria**:

  - [ ] `tests/integration/server-e2e.test.ts` exists
  - [ ] Covers all 7 tools, 4 resources, 4 prompts (≥ 20 test cases)
  - [ ] `npx vitest run tests/integration/server-e2e.test.ts` → all pass
  - [ ] No actual subprocess execution (all CLI tools mocked)
  - [ ] Error handling tested (invalid tool name, invalid args)
  - [ ] `npx vitest run` → ALL project tests pass (full suite)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full integration test suite passes
    Tool: Bash
    Preconditions: All Tasks 1-21 complete
    Steps:
      1. Run `npx vitest run tests/integration/server-e2e.test.ts --reporter=verbose`
      2. Assert all tests pass (≥ 20 tests, 0 failures)
      3. Assert output shows tests for tools, resources, and prompts
    Expected Result: Complete E2E test suite passes
    Failure Indicators: Any test failures, missing test coverage
    Evidence: .sisyphus/evidence/task-22-integration-tests.txt

  Scenario: Full project test suite passes
    Tool: Bash
    Preconditions: Task 22 complete
    Steps:
      1. Run `npx vitest run` (all tests)
      2. Assert 0 failures across all test files
      3. Assert total test count ≥ 60 (unit + integration)
    Expected Result: ALL project tests pass with high test count
    Failure Indicators: Any failures, low test count
    Evidence: .sisyphus/evidence/task-22-full-suite.txt

  Scenario: TypeScript compiles without errors
    Tool: Bash
    Preconditions: Task 22 complete
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code is 0 and no errors in output
    Expected Result: Clean compilation
    Failure Indicators: Type errors, import resolution failures
    Evidence: .sisyphus/evidence/task-22-tsc-clean.txt
  ```

  **Commit**: YES
  - Message: `test(integration): add full server E2E integration test suite`
  - Files: `tests/integration/server-e2e.test.ts`
  - Pre-commit: `npx vitest run` (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npx vitest run`. Review all files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod code, commented-out code, unused imports. Check for `exec()`/`execSync()` usage. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (API lookup result referenced in error diagnosis, etc.). Test edge cases: missing dotnet, invalid inputs, empty project. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect any unauthorized tools/resources/prompts beyond the 7/4/4 spec. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Scope [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 1**: `chore(scaffold): initialize TypeScript project with build pipeline` — package.json, tsconfig.json, vitest.config.ts, .gitignore
- **Task 2**: `feat(docs): add curated MonoGame documentation markdown files` — src/docs/*.md
- **Task 3**: `feat(types): add shared type definitions and interfaces` — src/types.ts
- **Tasks 4-8**: `feat(utils): add {utility name}` — src/utils/*.ts + tests
- **Task 9**: `feat(server): add core MCP server setup with stdio transport` — src/index.ts
- **Tasks 10-12**: `feat(tools): add {tool-name} tool` — src/tools/*.ts + tests
- **Tasks 13-16**: `feat(tools): add {tool-name} tool` — src/tools/*.ts + tests
- **Task 17**: `feat(resources): add documentation resources` — src/resources/*.ts + tests
- **Task 18**: `feat(prompts): add prompt templates` — src/prompts/*.ts + tests
- **Task 19**: `chore(package): configure npm packaging and bin entry` — package.json updates
- **Task 20**: `chore(docker): add Dockerfile for container distribution` — Dockerfile, .dockerignore
- **Task 21**: `docs: add README with setup, usage, and configuration guide` — README.md
- **Task 22**: `test(integration): add full server E2E integration tests` — tests/integration/*.test.ts

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit          # Expected: no errors
npx vitest run            # Expected: all tests pass
npm pack --dry-run        # Expected: < 5MB, includes build/ and docs/
docker build -t monogame-mcp .  # Expected: successful build
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"clientInfo":{"name":"test","version":"0.1"},"protocolVersion":"2024-11-05"}}' | node build/index.js  # Expected: JSON-RPC response with server capabilities
```

### Final Checklist
- [ ] All 7 tools registered and responding
- [ ] All 4 resource types serving content
- [ ] All 4 prompts returning structured messages
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All vitest tests pass
- [ ] npm package < 5MB
- [ ] Docker image builds and runs
- [ ] No `console.log()` in codebase
- [ ] No `exec()`/`execSync()` in codebase
- [ ] All subprocess calls use `spawn` with `shell: false`

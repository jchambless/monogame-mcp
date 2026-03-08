# MonoGame MCP Server

[![npm version](https://img.shields.io/badge/npm-0.1.0-blue.svg)](https://www.npmjs.com/package/monogame-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for the MonoGame framework. It provides AI-powered documentation lookup, project management, code scaffolding, and diagnostic tools for MonoGame development.

## Quick Start

1. Install prerequisites (.NET SDK 8.0 and MonoGame templates).
2. Configure your MCP client (like Claude Desktop) to use `npx monogame-mcp`.
3. Restart your client and start building MonoGame projects.

## Prerequisites

- **Node.js**: version 18 or higher.
- **.NET SDK 8.0**: Required for building and running projects. Verify with `dotnet --version`.
- **MonoGame Templates**: Install with `dotnet new install MonoGame.Templates.CSharp`.
- **MGCB Tool**: Install for content builds with `dotnet tool install -g dotnet-mgcb`.

## Installation

### Using npx (Recommended)
You can run the server directly without local installation:
```bash
npx monogame-mcp
```

### Global Installation
```bash
npm install -g monogame-mcp
```

### Docker
```bash
docker run -i monogame-mcp
```

## Configuration

### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "monogame-mcp": {
      "command": "npx",
      "args": ["-y", "monogame-mcp"]
    }
  }
}
```

If using Docker:
```json
{
  "mcpServers": {
    "monogame-mcp": {
      "command": "docker",
      "args": ["run", "-i", "monogame-mcp"]
    }
  }
}
```

## Available Tools

| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `monogame_api_lookup` | Search MonoGame API documentation for classes, methods, and properties | `{ "query": "SpriteBatch" }` |
| `monogame_create_project` | Create a new MonoGame project using dotnet templates | `{ "projectName": "MyGame", "template": "desktopgl" }` |
| `monogame_manage_content` | Add, remove, or configure assets in a .mgcb content project | `{ "action": "add", "mgcbPath": "Content.mgcb", "assetPath": "player.png" }` |
| `monogame_build_content` | Build MonoGame content using MGCB CLI | `{ "mgcbPath": "Content/Content.mgcb" }` |
| `monogame_scaffold_code` | Generate MonoGame C# code from predefined templates | `{ "template": "game-class", "className": "MainGame" }` |
| `monogame_diagnose_error` | Diagnose MonoGame error messages and suggest fixes | `{ "errorMessage": "Could not find ContentTypeReader" }` |
| `monogame_build_run` | Build or run MonoGame projects using dotnet CLI | `{ "action": "run", "projectPath": "MyGame.csproj" }` |

## Available Resources

| URI Template | Description | Example URI |
|--------------|-------------|-------------|
| `monogame://api/{className}` | API reference documentation for MonoGame classes | `monogame://api/Texture2D` |
| `monogame://examples/{topic}` | Code examples and tutorials for development | `monogame://examples/sprite-animation` |
| `monogame://content-pipeline/{topic}` | Documentation for the Content Pipeline | `monogame://content-pipeline/overview` |
| `monogame://platforms/{platform}` | Platform-specific guides | `monogame://platforms/android` |

## Available Prompts

| Prompt Name | Arguments | Description |
|-------------|-----------|-------------|
| `monogame_code_review` | `code` (required), `focus` | Review C# code for MonoGame best practices |
| `monogame_troubleshoot` | `error` (required), `code`, `platform` | Troubleshoot errors and exceptions |
| `monogame_architecture` | `gameType` (required), `features`, `scale` | Plan game architecture and organization |
| `monogame_implement_feature` | `feature` (required), `existingCode`, `platform` | Step-by-step feature implementation guidance |

## Examples

### 1. Creating a New Project
Tell the AI: "Create a new MonoGame DesktopGL project named SpaceExplorer, add a background.png texture to content, and build it."
The AI will use `monogame_create_project`, then `monogame_manage_content`, and finally `monogame_build_content`.

### 2. Learning the API
Ask: "How do I use SpriteBatch to draw a scaled texture?"
The AI will use `monogame_api_lookup` or read `monogame://api/SpriteBatch` to provide exact parameters and code.

### 3. Fixing Errors
If you get an error: "ContentLoadException: The content file was not found."
Provide the error to the AI. It will use `monogame_diagnose_error` to identify that you likely missed adding the asset to your `.mgcb` file or have a path mismatch.

### 4. Scaffolding and Running
Ask: "Generate a scene manager class for my game and then try to run the project."
The AI will use `monogame_scaffold_code` with the `scene-manager` template, then `monogame_build_run` with the `run` action.

## Development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Link for local testing: `npm link`

## License

MIT

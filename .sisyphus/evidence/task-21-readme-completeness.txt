--- TOOLS ---
| `monogame_api_lookup` | Search MonoGame API documentation for classes, methods, and properties | `{ "query": "SpriteBatch" }` |
The AI will use `monogame_api_lookup` or read `monogame://api/SpriteBatch` to provide exact parameters and code.
| `monogame_create_project` | Create a new MonoGame project using dotnet templates | `{ "projectName": "MyGame", "template": "desktopgl" }` |
The AI will use `monogame_create_project`, then `monogame_manage_content`, and finally `monogame_build_content`.
| `monogame_manage_content` | Add, remove, or configure assets in a .mgcb content project | `{ "action": "add", "mgcbPath": "Content.mgcb", "assetPath": "player.png" }` |
The AI will use `monogame_create_project`, then `monogame_manage_content`, and finally `monogame_build_content`.
| `monogame_build_content` | Build MonoGame content using MGCB CLI | `{ "mgcbPath": "Content/Content.mgcb" }` |
The AI will use `monogame_create_project`, then `monogame_manage_content`, and finally `monogame_build_content`.
| `monogame_scaffold_code` | Generate MonoGame C# code from predefined templates | `{ "template": "game-class", "className": "MainGame" }` |
The AI will use `monogame_scaffold_code` with the `scene-manager` template, then `monogame_build_run` with the `run` action.
| `monogame_diagnose_error` | Diagnose MonoGame error messages and suggest fixes | `{ "errorMessage": "Could not find ContentTypeReader" }` |
Provide the error to the AI. It will use `monogame_diagnose_error` to identify that you likely missed adding the asset to your `.mgcb` file or have a path mismatch.
| `monogame_build_run` | Build or run MonoGame projects using dotnet CLI | `{ "action": "run", "projectPath": "MyGame.csproj" }` |
The AI will use `monogame_scaffold_code` with the `scene-manager` template, then `monogame_build_run` with the `run` action.
--- RESOURCES ---
| `monogame://api/{className}` | API reference documentation for MonoGame classes | `monogame://api/Texture2D` |
The AI will use `monogame_api_lookup` or read `monogame://api/SpriteBatch` to provide exact parameters and code.
| `monogame://examples/{topic}` | Code examples and tutorials for development | `monogame://examples/sprite-animation` |
| `monogame://content-pipeline/{topic}` | Documentation for the Content Pipeline | `monogame://content-pipeline/overview` |
| `monogame://platforms/{platform}` | Platform-specific guides | `monogame://platforms/android` |
--- PROMPTS ---
| `monogame_code_review` | `code` (required), `focus` | Review C# code for MonoGame best practices |
| `monogame_troubleshoot` | `error` (required), `code`, `platform` | Troubleshoot errors and exceptions |
| `monogame_architecture` | `gameType` (required), `features`, `scale` | Plan game architecture and organization |
| `monogame_implement_feature` | `feature` (required), `existingCode`, `platform` | Step-by-step feature implementation guidance |

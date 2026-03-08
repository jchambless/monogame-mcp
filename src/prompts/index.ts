import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  type Prompt,
  type GetPromptResult
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Registers all MonoGame prompt templates with the MCP server.
 * 
 * Prompts registered:
 * 1. monogame_code_review — Review C# game code for best practices
 * 2. monogame_troubleshoot — Troubleshoot MonoGame errors
 * 3. monogame_architecture — Plan game architecture
 * 4. monogame_implement_feature — Step-by-step feature guidance
 * 
 * Each prompt returns messages array with system message (MonoGame knowledge) + user message (formatted input).
 * 
 * @param server - Configured MCP Server instance
 */
export function registerPrompts(server: Server): void {
  // Define all available prompts
  const prompts: Prompt[] = [
    {
      name: 'monogame_code_review',
      description: 'Review C# game code for MonoGame best practices and common issues',
      arguments: [
        {
          name: 'code',
          description: 'The C# MonoGame code to review',
          required: true
        },
        {
          name: 'focus',
          description: 'Optional focus area: performance, patterns, content-pipeline, or rendering',
          required: false
        }
      ]
    },
    {
      name: 'monogame_troubleshoot',
      description: 'Troubleshoot MonoGame error messages and exceptions',
      arguments: [
        {
          name: 'error',
          description: 'The error message or exception to troubleshoot',
          required: true
        },
        {
          name: 'code',
          description: 'Optional code context where error occurs',
          required: false
        },
        {
          name: 'platform',
          description: 'Optional platform: DesktopGL, WindowsDX, Android, iOS',
          required: false
        }
      ]
    },
    {
      name: 'monogame_architecture',
      description: 'Plan game architecture and component organization for MonoGame projects',
      arguments: [
        {
          name: 'gameType',
          description: 'Type of game: 2d-platformer, top-down, puzzle, etc.',
          required: true
        },
        {
          name: 'features',
          description: 'Optional list of game features',
          required: false
        },
        {
          name: 'scale',
          description: 'Optional project scale: small, medium, or large',
          required: false
        }
      ]
    },
    {
      name: 'monogame_implement_feature',
      description: 'Step-by-step guidance for implementing MonoGame game features',
      arguments: [
        {
          name: 'feature',
          description: 'The feature to implement (e.g., sprite animation, collision detection)',
          required: true
        },
        {
          name: 'existingCode',
          description: 'Optional existing code context',
          required: false
        },
        {
          name: 'platform',
          description: 'Optional target platform',
          required: false
        }
      ]
    }
  ];

  // Handle prompts/list request
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts };
  });

  // Handle prompts/get request
  server.setRequestHandler(GetPromptRequestSchema, async (request): Promise<GetPromptResult> => {
    const { name, arguments: args = {} } = request.params;

    switch (name) {
      case 'monogame_code_review': {
        const code = args.code as string;
        const focus = args.focus as string | undefined;

        const systemMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `# MonoGame Code Review Guidelines

You are reviewing MonoGame C# game code for best practices and common issues.

**Check for:**
- **SpriteBatch lifecycle**: Begin() must be called before any Draw() calls, End() after all draws
- **Content loading patterns**: Use Content.Load<T>() in LoadContent(), verify Content.RootDirectory is set
- **Game loop separation**: Update logic in Update(), rendering in Draw() — never mix them
- **Resource disposal**: Dispose textures, sound effects, and other resources properly (IDisposable pattern)
- **Initialize vs LoadContent**: Initialize for non-content setup, LoadContent for assets
- **GraphicsDevice timing**: Never access GraphicsDevice before Initialize() completes
${focus ? `\n**Primary Focus**: ${focus}` : ''}

**Common Pitfalls:**
- Not calling SpriteBatch.Begin() before Draw()
- Loading content in constructor (should be in LoadContent)
- Calling Draw operations in Update()
- Forgetting to dispose resources
- Incorrect Content.RootDirectory path`
          }
        };

        const userMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Code to Review

Please review this MonoGame C# code${focus ? ` with focus on ${focus}` : ''}:

\`\`\`csharp
${code}
\`\`\``
          }
        };

        return {
          messages: [systemMessage, userMessage]
        };
      }

      case 'monogame_troubleshoot': {
        const error = args.error as string;
        const code = args.code as string | undefined;
        const platform = args.platform as string | undefined;

        const systemMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `# MonoGame Error Troubleshooting Guide

You are troubleshooting a MonoGame error. Use this systematic diagnostic approach:

**1. Check Content Pipeline**
- Verify Content.RootDirectory is set (default: "Content")
- Confirm asset paths match MGCB file entries (case-sensitive on some platforms)
- Check asset is built in MGCB tool and .xnb files exist in output directory

**2. Verify Graphics Lifecycle**
- SpriteBatch: Must call Begin() before Draw(), End() after all draws
- GraphicsDevice: Only access after Initialize() completes
- Disposed objects: Check if texture/sound was disposed before use

**3. Platform-Specific Issues**
${platform ? `- **Platform**: ${platform} — check platform-specific texture formats, window handle availability, and API compatibility` : '- Different texture format support between DesktopGL/WindowsDX\n- Android/iOS require platform-specific content formats'}

**4. Common Error Patterns**
- "Could not find ContentTypeReader": Missing asset reference or wrong content processor
- "Begin must be called before Draw": SpriteBatch lifecycle violation
- NullReferenceException: Graphics device not initialized or content not loaded
- FileNotFoundException: Wrong Content.RootDirectory or asset path

**5. Debugging Steps**
- Check stack trace for exact line and method
- Verify LoadContent() completed successfully
- Confirm Update/Draw separation (no rendering in Update)
- Test with minimal reproducible example`
          }
        };

        const userMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Error to Troubleshoot

Help me troubleshoot this MonoGame error${platform ? ` on ${platform}` : ''}:

**Error:** ${error}
${code ? `\n**Code Context:**\n\`\`\`csharp\n${code}\n\`\`\`` : ''}`
          }
        };

        return {
          messages: [systemMessage, userMessage]
        };
      }

      case 'monogame_architecture': {
        const gameType = args.gameType as string;
        const features = args.features as string | undefined;
        const scale = args.scale as string | undefined;

        const systemMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `# MonoGame Architecture Planning Guide

You are planning MonoGame game architecture. Apply these architectural patterns:

**1. Game Class Structure**
- Extend \`Game\` base class for main game loop
- Override: Initialize(), LoadContent(), Update(GameTime), Draw(GameTime)
- Use GraphicsDeviceManager for display configuration

**2. GameComponent System**
- \`GameComponent\`: Logic-only components (update but no draw)
- \`DrawableGameComponent\`: Components with Update() and Draw()
- Components added to Game.Components collection, auto-updated by framework
- Good for: Input handling, audio management, game state logic

**3. Scene/State Management Patterns**
- **Simple**: Enum-based state machine with switch statements in Update/Draw
- **Moderate**: Stack-based scene manager (push/pop scenes)
- **Complex**: Entity-Component-System (ECS) for large-scale games

**4. Content Management**
- Single ContentManager for global assets OR
- Per-scene ContentManager for level-specific assets
- Dispose content when scene changes to free memory

**5. Entity Organization**
${scale === 'large' ? '- Full ECS pattern with component composition\n- Spatial partitioning (quadtree/grid) for collision' : '- Simple class hierarchy (Player, Enemy, Projectile)\n- List-based collections with Update/Draw loops'}

**6. Platform Considerations**
- DesktopGL: Cross-platform, OpenGL-based
- WindowsDX: Windows-only, DirectX-based
- Mobile (Android/iOS): Touch input, performance optimization, smaller textures

**Common Patterns:**
- Singleton managers (InputManager, AudioManager)
- Factory pattern for entity creation
- Object pooling for frequently created/destroyed objects
- Component-based design over deep inheritance hierarchies`
          }
        };

        const userMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Architecture Planning Request

Help me design the architecture for a **${gameType}** MonoGame game${scale ? ` (${scale} scale)` : ''}.
${features ? `\n**Features:** ${features}` : ''}

Please suggest:
1. Overall class structure and component organization
2. Scene/state management approach
3. Content loading strategy
4. Recommended design patterns for this game type`
          }
        };

        return {
          messages: [systemMessage, userMessage]
        };
      }

      case 'monogame_implement_feature': {
        const feature = args.feature as string;
        const existingCode = args.existingCode as string | undefined;
        const platform = args.platform as string | undefined;

        const systemMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `# MonoGame Feature Implementation Guide

You are implementing a MonoGame feature. Follow the game loop lifecycle and best practices:

**Game Loop Lifecycle (execution order):**
1. **Constructor**: Create game instance, set up GraphicsDeviceManager
2. **Initialize()**: Non-content initialization (variables, game state, components)
3. **LoadContent()**: Load assets via Content.Load<T>() — called once after Initialize
4. **Update(GameTime)**: Game logic, input, physics — called at fixed rate (default 60 FPS)
5. **Draw(GameTime)**: Rendering only — called as fast as possible (vsync may limit)

**Content Pipeline Usage:**
- Assets must be added to Content.mgcb (MonoGame Content Builder)
- Build assets to .xnb format before loading
- Use Content.Load<Texture2D>("assetName") — no file extension
- Content.RootDirectory defaults to "Content"

**SpriteBatch Pattern:**
\`\`\`csharp
// In Draw() method:
spriteBatch.Begin(/* optional: sorting, blending, sampling */);
spriteBatch.Draw(texture, position, /* optional params */);
spriteBatch.End();
\`\`\`

**Platform Considerations:**
${platform ? `- **Platform**: ${platform}\n  - Texture formats: Use PNG for best compatibility\n  - Input: ${platform.includes('Android') || platform.includes('iOS') ? 'TouchPanel for mobile input' : 'Keyboard, Mouse, GamePad available'}` : '- DesktopGL: Cross-platform, keyboard/mouse/gamepad input\n- WindowsDX: Windows-only, DirectX rendering\n- Mobile: Touch input, performance-critical (texture sizes, draw calls)'}

**Common Implementation Patterns:**
- **Animation**: Track elapsed time, frame index, frame duration
- **Collision**: Rectangle.Intersects() for AABB, Vector2.Distance() for circles
- **Input**: Store previous/current state to detect "just pressed" vs "held"
- **Particle Systems**: Object pooling for performance
- **Camera**: Transform Matrix applied to SpriteBatch.Begin()

**Critical Rules:**
- NEVER call Draw operations in Update()
- NEVER load content in constructor (use LoadContent)
- ALWAYS dispose IDisposable resources
- ALWAYS call SpriteBatch.Begin() before Draw() and End() after`
          }
        };

        const userMessage = {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `## Feature Implementation Request

Help me implement **${feature}** in MonoGame${platform ? ` for ${platform}` : ''}.
${existingCode ? `\n**Existing Code:**\n\`\`\`csharp\n${existingCode}\n\`\`\`\n` : ''}
Please provide:
1. Step-by-step implementation approach
2. Code structure following MonoGame lifecycle (Initialize, LoadContent, Update, Draw)
3. Required content assets (if any)
4. Common pitfalls to avoid`
          }
        };

        return {
          messages: [systemMessage, userMessage]
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
}

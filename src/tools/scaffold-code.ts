/**
 * MonoGame Code Scaffolding Tool (Task 12)
 * 
 * MCP tool that generates MonoGame C# code from predefined templates.
 * Supports 8 templates: game-class, drawable-component, game-component,
 * input-handler, sprite-animation, scene-manager, collision-helper, audio-manager.
 * 
 * @module tools/scaffold-code
 */

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { generateCode, listTemplates } from '../utils/scaffolding.js';
import type { ScaffoldTemplate } from '../types.js';

/**
 * Input schema for monogame_scaffold_code tool
 */
const inputSchema = z.object({
  template: z.string({ message: 'Template name is required' }),
  className: z.string().optional(),
  namespace: z.string().default('MyGame'),
  listTemplates: z.boolean().optional()
});

type ScaffoldCodeInput = z.infer<typeof inputSchema>;

/**
 * Default class names for each template
 */
const DEFAULT_CLASS_NAMES: Record<string, string> = {
  'game-class': 'Game1',
  'drawable-component': 'MyDrawableComponent',
  'game-component': 'MyGameComponent',
  'input-handler': 'InputHandler',
  'sprite-animation': 'SpriteAnimation',
  'scene-manager': 'SceneManager',
  'collision-helper': 'CollisionHelper',
  'audio-manager': 'AudioManager'
};

/**
 * Format template list as markdown for display
 * @param templates Array of scaffold templates
 * @returns Formatted markdown string
 */
function formatTemplateList(templates: ScaffoldTemplate[]): string {
  // Group templates by category
  const categorized = new Map<string, ScaffoldTemplate[]>();
  
  for (const template of templates) {
    if (!categorized.has(template.category)) {
      categorized.set(template.category, []);
    }
    categorized.get(template.category)!.push(template);
  }

  // Build markdown output
  let markdown = '# Available MonoGame Code Templates\n\n';
  markdown += 'Generate C# code using these predefined templates.\n\n';

  // Output each category
  for (const [category, categoryTemplates] of categorized) {
    markdown += `## ${category} Templates\n\n`;
    
    for (const template of categoryTemplates) {
      markdown += `### ${template.name}\n`;
      markdown += `${template.description}\n\n`;
      markdown += `**Parameters:** ${template.parameters.join(', ')}\n\n`;
    }
  }

  // Add usage instructions
  markdown += '## Usage\n\n';
  markdown += 'To generate code, call this tool with:\n';
  markdown += '- `template`: Template name (required)\n';
  markdown += '- `className`: Custom class name (optional, defaults vary by template)\n';
  markdown += '- `namespace`: C# namespace (optional, default: "MyGame")\n\n';
  markdown += 'Example: `{ template: "game-class", className: "MyGame", namespace: "MyNamespace" }`\n';

  return markdown;
}

/**
 * Format error message with list of valid templates
 * @param error Error object
 * @param templates Array of valid templates
 * @returns Formatted error message
 */
function formatTemplateError(error: unknown, templates: ScaffoldTemplate[]): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  let message = '# Error: Invalid Template\n\n';
  message += `${errorMessage}\n\n`;
  message += '## Available Templates\n\n';
  
  for (const template of templates) {
    message += `- **${template.name}** (${template.category}): ${template.description}\n`;
  }
  
  message += '\nUse `listTemplates: true` to see detailed template information.\n';
  
  return message;
}

/**
 * Handle monogame_scaffold_code tool invocation
 * @param args Tool arguments (template, className, namespace, listTemplates)
 * @returns Tool result with generated code or template list
 */
export async function handleScaffoldCode(args: unknown): Promise<CallToolResult> {
  try {
    // Parse and validate input
    const input = inputSchema.parse(args) as ScaffoldCodeInput;
    
    // If listTemplates mode, return template list
    if (input.listTemplates) {
      const templates = listTemplates();
      const markdown = formatTemplateList(templates);
      
      return {
        content: [{
          type: 'text',
          text: markdown
        }]
      };
    }
    
    // Determine className (use provided, default, or empty string fallback)
    const className = input.className && input.className.trim() !== '' 
      ? input.className 
      : DEFAULT_CLASS_NAMES[input.template] || 'MyClass';
    
    // Generate code using scaffolding utility
    try {
      const result = generateCode(input.template, {
        className: className,
        namespace: input.namespace
      });
      
      // Format output with filename comment
      const output = `// ${result.filename}\n\n${result.content}`;
      
      return {
        content: [{
          type: 'text',
          text: output
        }]
      };
    } catch (error) {
      // Template not found or generation error
      const templates = listTemplates();
      const errorMessage = formatTemplateError(error, templates);
      
      return {
        content: [{
          type: 'text',
          text: errorMessage
        }]
      };
    }
  } catch (error) {
    // Zod validation error or unexpected error
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `- ${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      
      return {
        content: [{
          type: 'text',
          text: `# Input Validation Error\n\n${issues}\n\nRequired: template (string)\nOptional: className (string), namespace (string), listTemplates (boolean)`
        }]
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `# Unexpected Error\n\n${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

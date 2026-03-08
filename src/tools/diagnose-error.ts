/**
 * MonoGame Error Diagnosis Tool
 * 
 * MCP tool that diagnoses MonoGame error messages and suggests fixes.
 * Uses the error diagnosis utility to match against known error patterns.
 */

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { diagnoseError, type ErrorDiagnosis } from '../utils/error-diagnosis.js';

/**
 * Input schema for the diagnose error tool.
 */
const inputSchema = z.object({
  errorMessage: z.string().min(1, 'Error message cannot be empty'),
  context: z.string().optional(),
});

/**
 * Format a known error diagnosis as markdown.
 */
function formatDiagnosis(diagnosis: ErrorDiagnosis, context?: string): string {
  const sections: string[] = ['# MonoGame Error Diagnosis\n'];

  // Add context section if provided
  if (context) {
    sections.push('## Context');
    sections.push(context);
    sections.push('');
  }

  // Error identification
  sections.push('## Error Identified');
  sections.push(`**Type**: ${diagnosis.errorType}`);
  sections.push(`**Pattern**: ${diagnosis.pattern}`);
  sections.push('');

  // Likely cause
  sections.push('## Likely Cause');
  sections.push(diagnosis.cause);
  sections.push('');

  // Solution steps
  sections.push('## Solution');
  diagnosis.solution.forEach((step, index) => {
    sections.push(`${index + 1}. ${step}`);
  });
  sections.push('');

  // Documentation links
  sections.push('## Related Documentation');
  diagnosis.docLinks.forEach((link) => {
    const linkText = link.startsWith('file://') 
      ? link.replace('file://', '')
      : link;
    sections.push(`- [${linkText}](${link})`);
  });

  return sections.join('\n');
}

/**
 * Format general troubleshooting advice for unknown errors.
 */
function formatGeneralAdvice(errorMessage: string, context?: string): string {
  const sections: string[] = ['# MonoGame Error Troubleshooting\n'];

  // Add context section if provided
  if (context) {
    sections.push('## Context');
    sections.push(context);
    sections.push('');
  }

  // Error message
  sections.push('## Error Message');
  sections.push(errorMessage);
  sections.push('');

  // General troubleshooting steps
  sections.push('## General Troubleshooting Steps');
  sections.push('1. Check Content.RootDirectory is set correctly');
  sections.push('2. Verify MGCB content pipeline build succeeded');
  sections.push('3. Ensure all required assets are added to Content.mgcb');
  sections.push('4. Check for null references or disposed objects');
  sections.push('5. Review MonoGame console output for additional errors');
  sections.push('');

  // Additional resources
  sections.push('## Additional Resources');
  sections.push('- MonoGame Community Forums: https://community.monogame.net');
  sections.push('- MonoGame Documentation: https://docs.monogame.net');
  sections.push('- Content Pipeline Guide: file://src/docs/content-pipeline/overview.md');
  sections.push('');
  sections.push('*Note: This error pattern is not recognized. If this is a recurring issue, please share it on the MonoGame forums.*');

  return sections.join('\n');
}

/**
 * Handle the diagnose error tool request.
 * 
 * @param args - Tool arguments containing errorMessage and optional context
 * @returns Tool result with formatted diagnosis or general troubleshooting advice
 */
export async function handleDiagnoseError(args: unknown): Promise<CallToolResult> {
  // Validate input
  const input = inputSchema.parse(args);

  // Attempt to diagnose the error
  const diagnosis = diagnoseError(input.errorMessage);

  if (diagnosis) {
    // Known error: return structured diagnosis
    const markdown = formatDiagnosis(diagnosis, input.context);
    return {
      content: [
        {
          type: 'text',
          text: markdown,
        },
      ],
    };
  } else {
    // Unknown error: return general troubleshooting advice
    const markdown = formatGeneralAdvice(input.errorMessage, input.context);
    return {
      content: [
        {
          type: 'text',
          text: markdown,
        },
      ],
    };
  }
}

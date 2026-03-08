/**
 * Tests for Code Scaffolding Tool (Task 12)
 * 
 * TDD Approach: Tests written first, then implementation to make them pass.
 * Tests verify template generation, parameter substitution, template listing,
 * and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleScaffoldCode } from '../../src/tools/scaffold-code.js';

describe('Code Scaffolding Tool', () => {
  describe('Template Generation', () => {
    it('should generate game-class with default parameters', async () => {
      const result = await handleScaffoldCode({
        template: 'game-class'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;
      
      // Verify filename comment
      expect(text).toContain('// Game1.cs');
      
      // Verify namespace and class structure
      expect(text).toContain('namespace MyGame');
      expect(text).toContain('public class Game1 : Game');
      
      // Verify MonoGame lifecycle methods
      expect(text).toContain('protected override void Initialize()');
      expect(text).toContain('protected override void LoadContent()');
      expect(text).toContain('protected override void Update(GameTime gameTime)');
      expect(text).toContain('protected override void Draw(GameTime gameTime)');
      
      // Verify GraphicsDeviceManager and SpriteBatch
      expect(text).toContain('GraphicsDeviceManager _graphics');
      expect(text).toContain('SpriteBatch _spriteBatch');
    });

    it('should generate game-class with custom className and namespace', async () => {
      const result = await handleScaffoldCode({
        template: 'game-class',
        className: 'MyCustomGame',
        namespace: 'CustomNamespace.Games'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify custom filename
      expect(text).toContain('// MyCustomGame.cs');
      
      // Verify parameter substitution
      expect(text).toContain('namespace CustomNamespace.Games');
      expect(text).toContain('public class MyCustomGame : Game');
      expect(text).toContain('public MyCustomGame()');
      
      // Ensure no placeholder remnants
      expect(text).not.toContain('{{className}}');
      expect(text).not.toContain('{{namespace}}');
    });

    it('should generate input-handler with keyboard state tracking', async () => {
      const result = await handleScaffoldCode({
        template: 'input-handler',
        className: 'PlayerInput',
        namespace: 'MyGame.Input'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify filename and structure
      expect(text).toContain('// PlayerInput.cs');
      expect(text).toContain('namespace MyGame.Input');
      expect(text).toContain('public static class PlayerInput');
      
      // Verify input state tracking
      expect(text).toContain('KeyboardState _currentKeyState');
      expect(text).toContain('KeyboardState _previousKeyState');
      expect(text).toContain('Keyboard.GetState()');
      expect(text).toContain('IsKeyPressed');
      expect(text).toContain('IsKeyDown');
      
      // Verify mouse and gamepad support
      expect(text).toContain('MouseState');
      expect(text).toContain('GamePadState');
    });

    it('should generate drawable-component with SpriteBatch', async () => {
      const result = await handleScaffoldCode({
        template: 'drawable-component',
        className: 'SpriteRenderer'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify DrawableGameComponent inheritance
      expect(text).toContain('public class SpriteRenderer : DrawableGameComponent');
      expect(text).toContain('SpriteBatch _spriteBatch');
      
      // Verify lifecycle methods
      expect(text).toContain('public override void Initialize()');
      expect(text).toContain('protected override void LoadContent()');
      expect(text).toContain('public override void Update(GameTime gameTime)');
      expect(text).toContain('public override void Draw(GameTime gameTime)');
      
      // Verify SpriteBatch usage
      expect(text).toContain('_spriteBatch.Begin()');
      expect(text).toContain('_spriteBatch.End()');
    });

    it('should generate collision-helper with AABB and circle methods', async () => {
      const result = await handleScaffoldCode({
        template: 'collision-helper',
        className: 'PhysicsHelper',
        namespace: 'MyGame.Physics'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify static helper class
      expect(text).toContain('public static class PhysicsHelper');
      expect(text).toContain('namespace MyGame.Physics');
      
      // Verify collision detection methods
      expect(text).toContain('CheckRectangleCollision');
      expect(text).toContain('CheckCircleCollision');
      expect(text).toContain('PointInRectangle');
      expect(text).toContain('PointInCircle');
      expect(text).toContain('GetIntersectionDepth');
      
      // Verify Rectangle and Vector2 usage
      expect(text).toContain('Rectangle rectA');
      expect(text).toContain('Vector2 centerA');
    });

    it('should generate sprite-animation with frame management', async () => {
      const result = await handleScaffoldCode({
        template: 'sprite-animation'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify animation class structure
      expect(text).toContain('public class SpriteAnimation');
      expect(text).toContain('Texture2D _spriteSheet');
      expect(text).toContain('int _currentFrame');
      expect(text).toContain('float _timePerFrame');
      
      // Verify frame animation logic
      expect(text).toContain('void Update(GameTime gameTime)');
      expect(text).toContain('void Draw(SpriteBatch spriteBatch');
      expect(text).toContain('Rectangle sourceRectangle');
      expect(text).toContain('void Reset()');
    });

    it('should generate scene-manager with state management', async () => {
      const result = await handleScaffoldCode({
        template: 'scene-manager'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify GameState base class
      expect(text).toContain('public abstract class GameState');
      expect(text).toContain('protected Game Game');
      expect(text).toContain('protected SpriteBatch SpriteBatch');
      
      // Verify SceneManager with stack-based states
      expect(text).toContain('public class SceneManager');
      expect(text).toContain('Stack<GameState>');
      expect(text).toContain('void PushState(GameState state)');
      expect(text).toContain('void PopState()');
      expect(text).toContain('void ChangeState(GameState newState)');
    });

    it('should generate audio-manager with sound and music support', async () => {
      const result = await handleScaffoldCode({
        template: 'audio-manager'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify audio manager class
      expect(text).toContain('public class AudioManager');
      expect(text).toContain('Dictionary<string, SoundEffect>');
      expect(text).toContain('Dictionary<string, Song>');
      
      // Verify audio methods
      expect(text).toContain('PlaySoundEffect');
      expect(text).toContain('PlaySong');
      expect(text).toContain('PauseMusic');
      expect(text).toContain('SetMasterVolume');
      expect(text).toContain('SetSfxVolume');
      expect(text).toContain('SetMusicVolume');
    });
  });

  describe('List Templates Mode', () => {
    it('should return markdown list of all 8 templates when listTemplates is true', async () => {
      const result = await handleScaffoldCode({
        template: 'any',  // Should be ignored when listTemplates=true
        listTemplates: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;
      
      // Verify markdown structure
      expect(text).toContain('# Available MonoGame Code Templates');
      
      // Verify all 8 templates are listed
      expect(text).toContain('game-class');
      expect(text).toContain('drawable-component');
      expect(text).toContain('game-component');
      expect(text).toContain('input-handler');
      expect(text).toContain('sprite-animation');
      expect(text).toContain('scene-manager');
      expect(text).toContain('collision-helper');
      expect(text).toContain('audio-manager');
      
      // Verify categories are included
      expect(text).toContain('Core');
      expect(text).toContain('Components');
      expect(text).toContain('Input');
      expect(text).toContain('Graphics');
      expect(text).toContain('State Management');
      expect(text).toContain('Physics');
      expect(text).toContain('Audio');
      
      // Verify parameters are listed
      expect(text).toContain('className');
      expect(text).toContain('namespace');
    });

    it('should include template descriptions in list', async () => {
      const result = await handleScaffoldCode({
        template: 'game-class',  // Required parameter, but ignored in listTemplates mode
        listTemplates: true
      });

      const text = result.content[0].text;
      
      // Verify key template descriptions
      expect(text).toContain('Game1.cs with constructor');
      expect(text).toContain('DrawableGameComponent subclass');
      expect(text).toContain('Static input handling');
      expect(text).toContain('Sprite sheet animation');
      expect(text).toContain('collision detection');
      expect(text).toContain('Audio management');
    });
  });

  describe('Error Handling', () => {
    it('should return error for invalid template name', async () => {
      const result = await handleScaffoldCode({
        template: 'nonexistent-template'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify error message
      expect(text).toContain('Error');
      expect(text).toContain('nonexistent-template');
      expect(text).toContain('not found');
      
      // Verify list of valid templates is included
      expect(text).toContain('game-class');
      expect(text).toContain('drawable-component');
      expect(text).toContain('input-handler');
      
      // Verify helpful suggestion
      expect(text).toMatch(/listTemplates|available templates/i);
    });

    it('should return error for missing required template parameter', async () => {
      const result = await handleScaffoldCode({
        // Missing 'template' parameter
        className: 'MyClass'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Verify Zod validation error
      expect(text).toMatch(/required|invalid|error/i);
    });

    it('should handle empty className gracefully with defaults', async () => {
      const result = await handleScaffoldCode({
        template: 'game-class',
        className: '',  // Empty string should use default
        namespace: 'TestNamespace'
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      
      // Should use default className
      expect(text).toContain('namespace TestNamespace');
      // Filename should be present (even if .cs)
      expect(text).toMatch(/\/\/ \w+\.cs/);
    });
  });

  describe('Parameter Substitution', () => {
    it('should substitute all placeholder occurrences in template', async () => {
      const result = await handleScaffoldCode({
        template: 'game-class',
        className: 'TestGame',
        namespace: 'Test.Namespace'
      });

      const text = result.content[0].text;
      
      // Verify NO placeholders remain
      expect(text).not.toContain('{{className}}');
      expect(text).not.toContain('{{namespace}}');
      
      // Verify all occurrences are replaced (game-class has multiple className refs)
      const classNameCount = (text.match(/TestGame/g) || []).length;
      expect(classNameCount).toBeGreaterThan(1); // Constructor and class declaration at minimum
    });

    it('should use default namespace when not provided', async () => {
      const result = await handleScaffoldCode({
        template: 'game-component',
        className: 'TestComponent'
      });

      const text = result.content[0].text;
      
      // Should use default namespace 'MyGame'
      expect(text).toContain('namespace MyGame');
      expect(text).toContain('public class TestComponent : GameComponent');
    });
  });

  describe('Output Format', () => {
    it('should include filename comment at start of generated code', async () => {
      const result = await handleScaffoldCode({
        template: 'input-handler',
        className: 'GameInput'
      });

      const text = result.content[0].text;
      
      // Verify filename comment is at the start
      expect(text).toMatch(/^\/\/ GameInput\.cs/);
    });

    it('should preserve C# code formatting and indentation', async () => {
      const result = await handleScaffoldCode({
        template: 'drawable-component'
      });

      const text = result.content[0].text;
      
      // Verify proper C# structure with indentation
      expect(text).toContain('namespace');
      expect(text).toContain('{');
      expect(text).toContain('    public class');
      expect(text).toContain('        private');
      expect(text).toContain('    }');
      expect(text).toContain('}');
    });
  });
});

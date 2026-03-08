import { describe, it, expect } from 'vitest';
import { generateCode, listTemplates } from '../../src/utils/scaffolding.js';

describe('scaffolding', () => {
  describe('generateCode', () => {
    it('should generate game-class template with correct structure', () => {
      const result = generateCode('game-class', {
        className: 'MyGame',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('MyGame.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class MyGame : Game');
      expect(result.content).toContain('protected override void Initialize()');
      expect(result.content).toContain('protected override void LoadContent()');
      expect(result.content).toContain('protected override void Update(GameTime gameTime)');
      expect(result.content).toContain('protected override void Draw(GameTime gameTime)');
      expect(result.content).toContain('using Microsoft.Xna.Framework;');
      expect(result.content).toContain('using Microsoft.Xna.Framework.Graphics;');
    });

    it('should generate drawable-component template', () => {
      const result = generateCode('drawable-component', {
        className: 'MyDrawable',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('MyDrawable.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class MyDrawable : DrawableGameComponent');
      expect(result.content).toContain('public override void Draw(GameTime gameTime)');
      expect(result.content).toContain('using Microsoft.Xna.Framework;');
    });

    it('should generate game-component template', () => {
      const result = generateCode('game-component', {
        className: 'MyComponent',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('MyComponent.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class MyComponent : GameComponent');
      expect(result.content).toContain('public override void Update(GameTime gameTime)');
      expect(result.content).toContain('using Microsoft.Xna.Framework;');
    });

    it('should generate input-handler template with state tracking', () => {
      const result = generateCode('input-handler', {
        className: 'InputHandler',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('InputHandler.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public static class InputHandler');
      expect(result.content).toContain('Keyboard.GetState()');
      expect(result.content).toContain('KeyboardState');
      expect(result.content).toContain('private static KeyboardState _previousKeyState');
      expect(result.content).toContain('IsKeyDown');
    });

    it('should generate sprite-animation template with frame management', () => {
      const result = generateCode('sprite-animation', {
        className: 'AnimatedSprite',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('AnimatedSprite.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class AnimatedSprite');
      expect(result.content).toContain('private int _currentFrame');
      expect(result.content).toContain('private int _totalFrames');
      expect(result.content).toContain('private float _timePerFrame');
      expect(result.content).toContain('public void Update(GameTime gameTime)');
      expect(result.content).toContain('Rectangle sourceRectangle');
    });

    it('should generate scene-manager template with push/pop pattern', () => {
      const result = generateCode('scene-manager', {
        className: 'SceneManager',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('SceneManager.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class SceneManager');
      expect(result.content).toContain('public void PushState');
      expect(result.content).toContain('public void PopState');
      expect(result.content).toContain('public void ChangeState');
      expect(result.content).toContain('Stack<GameState>');
    });

    it('should generate collision-helper template with AABB and circle detection', () => {
      const result = generateCode('collision-helper', {
        className: 'CollisionHelper',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('CollisionHelper.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public static class CollisionHelper');
      expect(result.content).toContain('rectA.Intersects(rectB)');
      expect(result.content).toContain('Vector2.Distance');
      expect(result.content).toContain('public static bool CheckRectangleCollision');
      expect(result.content).toContain('public static bool CheckCircleCollision');
    });

    it('should generate audio-manager template with SoundEffect and Song', () => {
      const result = generateCode('audio-manager', {
        className: 'AudioManager',
        namespace: 'MyProject'
      });

      expect(result.filename).toBe('AudioManager.cs');
      expect(result.content).toContain('namespace MyProject');
      expect(result.content).toContain('public class AudioManager');
      expect(result.content).toContain('SoundEffect');
      expect(result.content).toContain('MediaPlayer');
      expect(result.content).toContain('using Microsoft.Xna.Framework.Audio;');
      expect(result.content).toContain('using Microsoft.Xna.Framework.Media;');
    });

    it('should substitute all template parameters correctly', () => {
      const result = generateCode('game-class', {
        className: 'TestGame',
        namespace: 'TestNamespace'
      });

      expect(result.content).toContain('namespace TestNamespace');
      expect(result.content).toContain('public class TestGame : Game');
      expect(result.content).not.toContain('{{className}}');
      expect(result.content).not.toContain('{{namespace}}');
    });

    it('should throw error for unknown template', () => {
      expect(() => {
        generateCode('unknown-template', { className: 'Test', namespace: 'Test' });
      }).toThrow('Template not found');
    });
  });

  describe('listTemplates', () => {
    it('should return all 8 templates', () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(8);
    });

    it('should include template metadata', () => {
      const templates = listTemplates();
      const gameClassTemplate = templates.find(t => t.name === 'game-class');

      expect(gameClassTemplate).toBeDefined();
      expect(gameClassTemplate?.name).toBe('game-class');
      expect(gameClassTemplate?.description).toBeTruthy();
      expect(gameClassTemplate?.category).toBeTruthy();
      expect(gameClassTemplate?.parameters).toContain('className');
      expect(gameClassTemplate?.parameters).toContain('namespace');
    });

    it('should include all required templates', () => {
      const templates = listTemplates();
      const names = templates.map(t => t.name);

      expect(names).toContain('game-class');
      expect(names).toContain('drawable-component');
      expect(names).toContain('game-component');
      expect(names).toContain('input-handler');
      expect(names).toContain('sprite-animation');
      expect(names).toContain('scene-manager');
      expect(names).toContain('collision-helper');
      expect(names).toContain('audio-manager');
    });
  });
});

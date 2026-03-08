# Rectangle

**Namespace:** Microsoft.Xna.Framework

## Summary

`Rectangle` represents a 2D rectangle defined by position (X, Y) and size (Width, Height). Essential for sprite bounds, collision detection, and source regions.

## Inheritance

`ValueType` → `Rectangle`

## Constructors

### Rectangle(int x, int y, int width, int height)

Creates a rectangle with specified position and size.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| X | int | X coordinate of top-left corner |
| Y | int | Y coordinate of top-left corner |
| Width | int | Rectangle width |
| Height | int | Rectangle height |
| Left | int | Left edge X coordinate |
| Right | int | Right edge X coordinate |
| Top | int | Top edge Y coordinate |
| Bottom | int | Bottom edge Y coordinate |
| Location | Point | Top-left corner position |
| Center | Point | Center point |

## Methods

### Intersects(Rectangle value)

Returns true if this rectangle intersects with another.

### Contains(Point value)

Returns true if the point is inside the rectangle.

### Contains(Rectangle value)

Returns true if the rectangle fully contains another rectangle.

## Code Example

```csharp
// Create bounding rectangles for collision
Rectangle playerBounds = new Rectangle(
    (int)_playerPosition.X - 32,
    (int)_playerPosition.Y - 32,
    64,
    64
);

Rectangle enemyBounds = new Rectangle(
    (int)_enemyPosition.X - 32,
    (int)_enemyPosition.Y - 32,
    64,
    64
);

// Check collision
if (playerBounds.Intersects(enemyBounds))
{
    OnPlayerEnemyCollision();
}

// Check point collision (mouse click)
MouseState mouse = Mouse.GetState();
Point mousePoint = new Point(mouse.X, mouse.Y);
if (playerBounds.Contains(mousePoint))
{
    OnPlayerClicked();
}
```

## Related Classes

- [Point](point.md)
- [Vector2](vector2.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Rectangle.html

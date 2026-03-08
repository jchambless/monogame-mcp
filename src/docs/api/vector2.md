# Vector2

**Namespace:** Microsoft.Xna.Framework

## Summary

`Vector2` represents a two-dimensional vector with X and Y components. Used extensively for 2D positions, directions, velocities, and mathematical operations.

## Inheritance

`ValueType` → `Vector2`

## Constructors

### Vector2(float x, float y)

Creates a vector with specified X and Y components.

### Vector2(float value)

Creates a vector with both components set to the same value.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| X | float | The X component |
| Y | float | The Y component |
| Zero | Vector2 | Returns Vector2(0, 0) |
| One | Vector2 | Returns Vector2(1, 1) |
| UnitX | Vector2 | Returns Vector2(1, 0) |
| UnitY | Vector2 | Returns Vector2(0, 1) |

## Methods

### Length()

Returns the length (magnitude) of the vector.

### LengthSquared()

Returns the squared length (avoids expensive square root calculation).

### Normalize()

Returns a unit vector with the same direction.

**Static Methods:**
- `Distance(Vector2 value1, Vector2 value2)` - Distance between two vectors
- `Dot(Vector2 value1, Vector2 value2)` - Dot product
- `Lerp(Vector2 value1, Vector2 value2, float amount)` - Linear interpolation
- `Transform(Vector2 position, Matrix matrix)` - Transform vector by matrix

## Operators

- `+` Addition
- `-` Subtraction
- `*` Multiplication (scalar or component-wise)
- `/` Division
- `==` Equality
- `!=` Inequality

## Code Examples

```csharp
// Basic usage
Vector2 position = new Vector2(100, 200);
Vector2 velocity = new Vector2(5, -3);

// Update position
position += velocity * deltaTime;

// Normalize direction
Vector2 direction = new Vector2(targetX - playerX, targetY - playerY);
direction.Normalize();

// Distance calculation
float distance = Vector2.Distance(player.Position, enemy.Position);

// Lerp for smooth movement
Vector2 smoothPos = Vector2.Lerp(currentPos, targetPos, 0.1f);
```

## Related Classes

- [Vector3](vector3.md)
- [Vector4](vector4.md)
- [Matrix](matrix.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Vector2.html

# Vector3

**Namespace:** Microsoft.Xna.Framework

## Summary

`Vector3` represents a three-dimensional vector with X, Y, and Z components. Essential for 3D positions, directions, rotations, and transformations.

## Inheritance

`ValueType` → `Vector3`

## Constructors

### Vector3(float x, float y, float z)

Creates a vector with specified X, Y, and Z components.

### Vector3(float value)

Creates a vector with all components set to the same value.

### Vector3(Vector2 value, float z)

Creates a Vector3 from a Vector2 and a Z value.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| X | float | The X component |
| Y | float | The Y component |
| Z | float | The Z component |
| Zero | Vector3 | Returns Vector3(0, 0, 0) |
| One | Vector3 | Returns Vector3(1, 1, 1) |
| UnitX | Vector3 | Returns Vector3(1, 0, 0) |
| UnitY | Vector3 | Returns Vector3(0, 1, 0) |
| UnitZ | Vector3 | Returns Vector3(0, 0, 1) |
| Up | Vector3 | Returns Vector3(0, 1, 0) |
| Down | Vector3 | Returns Vector3(0, -1, 0) |
| Forward | Vector3 | Returns Vector3(0, 0, -1) |
| Backward | Vector3 | Returns Vector3(0, 0, 1) |
| Left | Vector3 | Returns Vector3(-1, 0, 0) |
| Right | Vector3 | Returns Vector3(1, 0, 0) |

## Methods

### Cross(Vector3 vector1, Vector3 vector2)

Calculates the cross product of two vectors.

### Transform(Vector3 position, Matrix matrix)

Transforms a Vector3 by a matrix.

## Code Example

```csharp
static Vector3 RotatePointOnYAxis(Vector3 point, float angle)
{
    Matrix rotationMatrix = Matrix.CreateRotationY(angle);
    Vector3 rotatedPoint = Vector3.Transform(point, rotationMatrix);
    return rotatedPoint;
}
```

## Related Classes

- [Vector2](vector2.md)
- [Vector4](vector4.md)
- [Matrix](matrix.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Vector3.html

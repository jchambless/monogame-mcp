# Matrix

**Namespace:** Microsoft.Xna.Framework

## Summary

`Matrix` represents a 4x4 floating-point matrix used for geometric transformations (translation, rotation, scale) in 2D and 3D space.

## Inheritance

`ValueType` → `Matrix`

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Identity | Matrix | Identity matrix (no transformation) |
| Translation | Vector3 | Translation component |

## Static Factory Methods

### CreateTranslation(Vector3 position)

Creates a translation matrix.

### CreateRotationX/Y/Z(float radians)

Creates a rotation matrix around the specified axis.

### CreateScale(float scale)

Creates a uniform scale matrix.

### CreateScale(Vector3 scale)

Creates a non-uniform scale matrix.

### CreateLookAt(Vector3 cameraPosition, Vector3 cameraTarget, Vector3 cameraUpVector)

Creates a view matrix for a camera.

### CreateOrthographic(float width, float height, float zNearPlane, float zFarPlane)

Creates an orthographic projection matrix.

## Code Examples

### 2D Camera Transform

```csharp
Matrix cameraTransform = Matrix.CreateTranslation(-_cameraPosition.X, -_cameraPosition.Y, 0)
    * Matrix.CreateScale(_zoom);

_spriteBatch.Begin(transformMatrix: cameraTransform);
// Draw game world
_spriteBatch.End();
```

### 3D Rotation

```csharp
Matrix rotationMatrix = Matrix.CreateRotationX(rotation) *
                        Matrix.CreateRotationY(rotation) *
                        Matrix.CreateRotationZ(rotation);
Matrix worldMatrix = rotationMatrix * Matrix.CreateTranslation(Vector3.Zero);
effect.World = worldMatrix;
```

### Transform Vector

```csharp
Vector3 transformedPoint = Vector3.Transform(point, rotationMatrix);
```

## Related Classes

- [Vector2](vector2.md)
- [Vector3](vector3.md)

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Matrix.html

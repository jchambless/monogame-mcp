# BoundingBox

**Namespace:** Microsoft.Xna.Framework

## Summary

`BoundingBox` represents an axis-aligned bounding box in 3D space. Used for collision detection and culling.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Min | Vector3 | Minimum corner point |
| Max | Vector3 | Maximum corner point |

## Methods

### Intersects(BoundingBox box)

Checks intersection with another bounding box.

### Intersects(BoundingSphere sphere)

Checks intersection with a bounding sphere.

### Contains(Vector3 point)

Checks if a point is inside the box.

## Code Example

```csharp
BoundingBox playerBox = new BoundingBox(
    new Vector3(position.X - 1, position.Y - 1, position.Z - 1),
    new Vector3(position.X + 1, position.Y + 1, position.Z + 1)
);

if (playerBox.Intersects(enemyBox))
{
    OnCollision();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.BoundingBox.html

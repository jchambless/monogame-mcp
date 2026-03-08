# BoundingSphere

**Namespace:** Microsoft.Xna.Framework

## Summary

`BoundingSphere` represents a sphere in 3D space. Efficient for collision detection and culling.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| Center | Vector3 | Center point of the sphere |
| Radius | float | Sphere radius |

## Methods

### Intersects(BoundingSphere sphere)

Checks intersection with another sphere.

### Intersects(BoundingBox box)

Checks intersection with a bounding box.

### Intersects(Ray ray)

Checks ray intersection, returns nullable distance.

## Code Example

```csharp
BoundingSphere playerSphere = new BoundingSphere(_player3DPosition, 5.0f);
BoundingSphere enemySphere = new BoundingSphere(_enemy3DPosition, 5.0f);

if (playerSphere.Intersects(enemySphere))
{
    OnCollision3D();
}

Ray mouseRay = CalculateMouseRay();
float? hitDistance = mouseRay.Intersects(enemySphere);
if (hitDistance.HasValue && hitDistance.Value < 100f)
{
    OnEnemyTargeted();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.BoundingSphere.html

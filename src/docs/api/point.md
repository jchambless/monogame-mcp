# Point

**Namespace:** Microsoft.Xna.Framework

## Summary

`Point` represents integer X and Y coordinates. Used for pixel-perfect positioning and grid-based systems.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| X | int | X coordinate |
| Y | int | Y coordinate |
| Zero | Point | Returns Point(0, 0) |

## Code Example

```csharp
Point mousePoint = new Point(mouseState.X, mouseState.Y);
if (bounds.Contains(mousePoint))
{
    OnClicked();
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Point.html

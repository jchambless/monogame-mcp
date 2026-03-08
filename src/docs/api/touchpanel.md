# TouchPanel

**Namespace:** Microsoft.Xna.Framework.Input

## Summary

`TouchPanel` provides touch input for mobile and touch-enabled devices.

## Methods

### GetState()

Returns the current touch panel state with all active touches.

**Returns:** TouchCollection

## Properties

| Property | Type | Description |
|----------|------|-------------|
| DisplayWidth | int | Display width |
| DisplayHeight | int | Display height |
| EnabledGestures | GestureType | Enabled gesture types |

## Code Example

```csharp
TouchCollection touches = TouchPanel.GetState();

foreach (TouchLocation touch in touches)
{
    if (touch.State == TouchLocationState.Pressed)
    {
        Vector2 touchPosition = touch.Position;
        HandleTouch(touchPosition);
    }
}
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.Input.Touch.TouchPanel.html

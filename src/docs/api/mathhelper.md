# MathHelper

**Namespace:** Microsoft.Xna.Framework

## Summary

`MathHelper` provides commonly used mathematical constants and utility functions.

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| E | 2.71828 | Natural logarithm base |
| Pi | 3.14159 | Pi constant |
| TwoPi | 6.28318 | 2 * Pi |
| PiOver2 | 1.5708 | Pi / 2 |
| PiOver4 | 0.7854 | Pi / 4 |

## Methods

### Clamp(float value, float min, float max)

Restricts a value to a range.

### Lerp(float value1, float value2, float amount)

Linear interpolation between two values.

### ToRadians(float degrees)

Converts degrees to radians.

### ToDegrees(float radians)

Converts radians to degrees.

## Code Example

```csharp
float health = MathHelper.Clamp(health + 10, 0, 100);
float angle = MathHelper.ToRadians(45);
float smoothValue = MathHelper.Lerp(current, target, 0.1f);
```

## Source

https://docs.monogame.net/api/Microsoft.Xna.Framework.MathHelper.html

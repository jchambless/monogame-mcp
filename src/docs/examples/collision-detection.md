# Collision Detection

Comprehensive collision detection patterns for 2D and 3D games in MonoGame.

## Rectangle-Based 2D Collision

```csharp
// Create bounding rectangles
Rectangle playerBounds = new Rectangle(
    (int)_playerPosition.X - (_playerTexture.Width / 2),
    (int)_playerPosition.Y - (_playerTexture.Height / 2),
    _playerTexture.Width,
    _playerTexture.Height
);

Rectangle enemyBounds = new Rectangle(
    (int)_enemyPosition.X - (_enemyTexture.Width / 2),
    (int)_enemyPosition.Y - (_enemyTexture.Height / 2),
    _enemyTexture.Width,
    _enemyTexture.Height
);

// Check collision
if (playerBounds.Intersects(enemyBounds))
{
    OnPlayerEnemyCollision();
}
```

## Point-Based Collision (Mouse Clicks)

```csharp
protected override void Update(GameTime gameTime)
{
    MouseState mouse = Mouse.GetState();
    
    if (mouse.LeftButton == ButtonState.Pressed)
    {
        Point mousePoint = new Point(mouse.X, mouse.Y);
        
        foreach (var entity in _entities)
        {
            if (entity.Bounds.Contains(mousePoint))
            {
                entity.OnClicked();
                break;
            }
        }
    }
    
    base.Update(gameTime);
}
```

## Circle Collision Detection

```csharp
public struct Circle
{
    public Vector2 Center;
    public float Radius;
    
    public bool Intersects(Circle other)
    {
        float distance = Vector2.Distance(Center, other.Center);
        return distance < (Radius + other.Radius);
    }
}

// Usage
Circle playerCircle = new Circle { Center = _playerPosition, Radius = 32 };
Circle enemyCircle = new Circle { Center = _enemyPosition, Radius = 32 };

if (playerCircle.Intersects(enemyCircle))
{
    OnCollision();
}
```

## Bounding Sphere Collision (3D)

```csharp
BoundingSphere playerSphere = new BoundingSphere(_player3DPosition, 5.0f);
BoundingSphere enemySphere = new BoundingSphere(_enemy3DPosition, 5.0f);

if (playerSphere.Intersects(enemySphere))
{
    OnCollision3D();
}
```

## Ray Intersection (Mouse Picking in 3D)

```csharp
private Ray CalculateMouseRay(MouseState mouse, Matrix view, Matrix projection)
{
    Vector3 nearPoint = GraphicsDevice.Viewport.Unproject(
        new Vector3(mouse.X, mouse.Y, 0f),
        projection,
        view,
        Matrix.Identity
    );

    Vector3 farPoint = GraphicsDevice.Viewport.Unproject(
        new Vector3(mouse.X, mouse.Y, 1f),
        projection,
        view,
        Matrix.Identity
    );

    Vector3 direction = Vector3.Normalize(farPoint - nearPoint);
    return new Ray(nearPoint, direction);
}

protected override void Update(GameTime gameTime)
{
    MouseState mouse = Mouse.GetState();
    
    if (mouse.LeftButton == ButtonState.Pressed)
    {
        Ray mouseRay = CalculateMouseRay(mouse, _viewMatrix, _projectionMatrix);
        
        foreach (var enemy in _enemies)
        {
            float? hitDistance = mouseRay.Intersects(enemy.BoundingSphere);
            if (hitDistance.HasValue && hitDistance.Value < 100f)
            {
                enemy.OnTargeted();
                break;
            }
        }
    }
    
    base.Update(gameTime);
}
```

## Collision Manager for Multiple Objects

```csharp
public class CollisionManager
{
    public void CheckCollisions(List<GameObject> objects)
    {
        for (int i = 0; i < objects.Count; i++)
        {
            for (int j = i + 1; j < objects.Count; j++)
            {
                if (objects[i].Bounds.Intersects(objects[j].Bounds))
                {
                    ResolveCollision(objects[i], objects[j]);
                }
            }
        }
    }
    
    private void ResolveCollision(GameObject a, GameObject b)
    {
        // Calculate overlap
        Rectangle intersection = Rectangle.Intersect(a.Bounds, b.Bounds);
        
        // Separate objects
        if (intersection.Width < intersection.Height)
        {
            // Separate horizontally
            if (a.Position.X < b.Position.X)
            {
                a.Position.X -= intersection.Width / 2f;
                b.Position.X += intersection.Width / 2f;
            }
            else
            {
                a.Position.X += intersection.Width / 2f;
                b.Position.X -= intersection.Width / 2f;
            }
        }
        else
        {
            // Separate vertically
            if (a.Position.Y < b.Position.Y)
            {
                a.Position.Y -= intersection.Height / 2f;
                b.Position.Y += intersection.Height / 2f;
            }
            else
            {
                a.Position.Y += intersection.Height / 2f;
                b.Position.Y -= intersection.Height / 2f;
            }
        }
    }
}
```

## Source

Based on MonoGame documentation: https://docs.monogame.net/articles/getting_to_know/howto/graphics/HowTo_Test_for_Collisions.html

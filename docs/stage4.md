# Stage 4 — Performance Improvement

## Caching
Use Redis to cache the latest notification list for each user. Cache invalidation should happen on create, update, and view events.

## Pagination
Pagination keeps page payloads small and reduces the cost of rendering and transferring data.

## Lazy Loading
Render only the visible portion of the notification list and defer the rest until needed.

## Compression
Enable response compression on the API layer to reduce payload size for mobile clients.

## Database Optimization
- Keep indexes lean.
- Partition older notifications if the dataset grows beyond a few million records.
- Aggregate frequently queried metrics.

## API Optimization
- Use HTTPS and keep headers minimal.
- Return only required fields.
- Avoid N+1 queries in the backend service.

## Expected Improvements
- Lower latency under load
- Better mobile performance
- Reduced server memory usage
- Improved user experience while filtering and paging

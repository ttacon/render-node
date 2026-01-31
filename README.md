# render-api

A TypeScript Node.js client for the [Render API](https://api-docs.render.com/).

## Features

- **Builder Pattern**: Clean, fluent API design
- **Auto-pagination**: Async iterators for seamless pagination
- **Zod Validation**: Runtime type checking on all API responses
- **Nested Resources**: Intuitive access to related resources
- **Error Hierarchy**: Specific error classes for each HTTP status code
- **Retry Logic**: Automatic exponential backoff for rate limits and server errors
- **TypeScript Support**: Full type definitions with strict mode
- **Dual Package**: ESM and CommonJS builds

## Installation

```bash
npm install render-api
```

## Quick Start

```typescript
import { RenderClient } from 'render-api';

const render = new RenderClient({ apiKey: process.env.RENDER_API_KEY });

// List services
const { items } = await render.services.list();

// Auto-pagination
for await (const service of render.services.listAll()) {
  console.log(service.name);
}

// Create a service
const { service, deployId } = await render.services.create({
  type: 'web_service',
  name: 'my-api',
  ownerId: 'tea-xxxxx',
  repo: 'https://github.com/user/repo',
  serviceDetails: {
    runtime: 'node',
    plan: 'starter',
    region: 'oregon',
    envSpecificDetails: {
      buildCommand: 'npm install',
      startCommand: 'npm start',
    },
  },
});

// Nested resources
const deploys = await render.services.deploys.list(service.id);
await render.services.envVars.set(service.id, 'NODE_ENV', 'production');

// Postgres
const db = await render.postgres.create({
  name: 'my-db',
  ownerId: 'tea-xxxxx',
  plan: 'starter',
  version: '16',
});
const connInfo = await render.postgres.connectionInfo(db.id);
```

## Configuration

```typescript
const render = new RenderClient({
  apiKey: 'rnd_xxxxx',           // Required: Your Render API key
  baseUrl: 'https://api.render.com/v1',  // Optional: API base URL
  timeout: 30000,                 // Optional: Request timeout in ms (default: 30000)
  maxRetries: 3,                  // Optional: Max retries for failed requests (default: 3)
});
```

## Resources

### Services

```typescript
// List with filters
const { items, hasMore, cursor } = await render.services.list({
  type: 'web_service',
  region: 'oregon',
  limit: 10,
});

// CRUD operations
const { service } = await render.services.create({ ... });
const service = await render.services.retrieve('srv-xxxxx');
const updated = await render.services.update('srv-xxxxx', { name: 'new-name' });
await render.services.delete('srv-xxxxx');

// Actions
await render.services.suspend('srv-xxxxx');
await render.services.resume('srv-xxxxx');
await render.services.restart('srv-xxxxx');
await render.services.scale('srv-xxxxx', { numInstances: 3 });

// Nested resources
await render.services.deploys.create('srv-xxxxx', { clearCache: 'clear' });
await render.services.customDomains.create('srv-xxxxx', { name: 'example.com' });
await render.services.envVars.set('srv-xxxxx', 'KEY', 'value');
await render.services.secretFiles.set('srv-xxxxx', '.env', 'SECRET=xxx');
```

### Postgres

```typescript
const db = await render.postgres.create({
  name: 'my-db',
  ownerId: 'tea-xxxxx',
  plan: 'starter',
  version: '16',
});

const connInfo = await render.postgres.connectionInfo(db.id);
await render.postgres.createUser(db.id, { username: 'app_user' });
await render.postgres.suspend(db.id);
await render.postgres.resume(db.id);
```

### Key Value (Redis-compatible)

```typescript
const kv = await render.keyValue.create({
  name: 'my-cache',
  ownerId: 'tea-xxxxx',
});

const connInfo = await render.keyValue.connectionInfo(kv.id);
```

## Auto-Pagination

All list methods return paginated responses. Use `listAll()` for automatic pagination:

```typescript
// Manual pagination
let cursor: string | undefined;
do {
  const { items, hasMore, cursor: nextCursor } = await render.services.list({ cursor });
  for (const service of items) {
    console.log(service.name);
  }
  cursor = hasMore ? nextCursor : undefined;
} while (cursor);

// Auto-pagination (recommended)
for await (const service of render.services.listAll()) {
  console.log(service.name);
}

// With max items limit
for await (const service of render.services.listAll({ maxItems: 100 })) {
  console.log(service.name);
}
```

## Error Handling

```typescript
import {
  RenderApiError,
  RenderAuthError,
  RenderNotFoundError,
  RenderRateLimitError,
} from 'render-api';

try {
  await render.services.retrieve('srv-invalid');
} catch (error) {
  if (error instanceof RenderNotFoundError) {
    console.log('Service not found');
  } else if (error instanceof RenderAuthError) {
    console.log('Invalid API key');
  } else if (error instanceof RenderRateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof RenderApiError) {
    console.log(`API error: ${error.status} - ${error.message}`);
  }
}
```

## Interactive REPL

For testing and exploration, use the built-in REPL:

```bash
RENDER_API_KEY=rnd_xxx npm run repl
```

```
╔═══════════════════════════════════════════════════════════╗
║              Render API Interactive REPL                  ║
╚═══════════════════════════════════════════════════════════╝

render> await render.users.me()
{ id: 'usr-xxxxx', email: 'user@example.com' }

render> const { items } = await render.services.list()
render> items.map(s => s.name)
[ 'my-api', 'my-frontend' ]

render> .resources    # List all available resources
render> .examples     # Show usage examples
render> .exit         # Exit
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint

# Start REPL
RENDER_API_KEY=xxx npm run repl
```

## License

MIT

---

## Resource Implementation Status

| Resource | Endpoints | Implemented | Tested | Notes |
|----------|-----------|-------------|--------|-------|
| **Services** | 25 | ✅ | ⚪ | Full CRUD, suspend/resume, scale, autoscale, preview |
| **Services > Deploys** | 5 | ✅ | ⚪ | Nested under services |
| **Services > Custom Domains** | 5 | ✅ | ⚪ | Nested under services |
| **Services > Env Vars** | 5 | ✅ | ⚪ | Nested under services |
| **Services > Secret Files** | 5 | ✅ | ⚪ | Nested under services |
| **Services > Headers** | 4 | ✅ | ⚪ | Static sites only |
| **Services > Routes** | 5 | ✅ | ⚪ | Static sites only |
| **Services > Jobs** | 4 | ✅ | ⚪ | One-off jobs |
| **Postgres** | 17 | ✅ | ⚪ | Full management, users, exports, recovery |
| **Key Value** | 8 | ✅ | ⚪ | Redis-compatible |
| **Redis** | 6 | ✅ | ⚪ | Deprecated, use Key Value |
| **Disks** | 7 | ✅ | ⚪ | Includes snapshots |
| **Environment Groups** | 13 | ✅ | ⚪ | Shared env vars/secrets |
| **Projects** | 5 | ✅ | ⚪ | |
| **Environments** | 7 | ✅ | ⚪ | Staging, production, etc. |
| **Blueprints** | 5 | ✅ | ⚪ | IaC via render.yaml |
| **Registry Credentials** | 5 | ✅ | ⚪ | Private Docker registries |
| **Webhooks** | 6 | ✅ | ⚪ | |
| **Logs** | 2 | ✅ | ⚪ | HTTP only (no WebSocket) |
| **Metrics** | 17 | ✅ | ⚪ | CPU, memory, bandwidth, etc. |
| **Maintenance** | 4 | ✅ | ⚪ | Scheduled maintenance |
| **Notification Settings** | 5 | ✅ | ⚪ | |
| **Audit Logs** | 2 | ✅ | ⚪ | Workspace and org logs |
| **Workspaces** | 5 | ✅ | ⚪ | Team members |
| **Users** | 1 | ✅ | ✅ | Current user |
| **Events** | 1 | ✅ | ⚪ | Retrieve by ID |
| **Cron Jobs** | 2 | ✅ | ⚪ | Run/cancel cron jobs |
| **Core (HTTP, Errors, Pagination)** | - | ✅ | ✅ | |

**Legend:**
- ✅ Complete
- ⚪ Not yet tested (implementation complete)
- ❌ Not implemented

**Total Endpoints:** ~156 (excluding Early Access features: Workflows, Workflow Tasks)

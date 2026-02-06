#!/usr/bin/env bun

import * as repl from 'node:repl';
import { RenderClient } from '../src/index.js';

const API_KEY = process.env.RENDER_API_KEY;
const DEBUG = process.env.RENDER_DEBUG === 'true' || process.env.RENDER_DEBUG === '1';

if (!API_KEY) {
  console.error('\x1b[31mError: RENDER_API_KEY environment variable is not set.\x1b[0m');
  console.error('');
  console.error('Usage:');
  console.error('  RENDER_API_KEY=rnd_xxx bun run repl');
  console.error('');
  console.error('Or export the variable:');
  console.error('  export RENDER_API_KEY=rnd_xxx');
  console.error('  bun run repl');
  console.error('');
  console.error('Debug logging:');
  console.error('  RENDER_DEBUG=true RENDER_API_KEY=rnd_xxx bun run repl');
  console.error('');
  process.exit(1);
}

// Create the authenticated client
const render = new RenderClient({ apiKey: API_KEY, debug: DEBUG });

if (DEBUG) {
  console.log('\x1b[33m[DEBUG MODE ENABLED]\x1b[0m');
}

console.log('\x1b[36m');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║              Render API Interactive REPL                  ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║  An authenticated client is available as `render`        ║');
console.log('║                                                           ║');
console.log('║  Examples:                                                ║');
console.log('║    await render.services.list()                          ║');
console.log('║    await render.postgres.list()                          ║');
console.log('║    await render.users.me()                               ║');
console.log('║                                                           ║');
console.log('║  Auto-pagination:                                         ║');
console.log('║    for await (const s of render.services.listAll()) {    ║');
console.log('║      console.log(s.name);                                ║');
console.log('║    }                                                      ║');
console.log('║                                                           ║');
console.log('║  Type .help for REPL commands, .exit to quit             ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('\x1b[0m');

// Start the REPL
const replServer = repl.start({
  prompt: '\x1b[32mrender>\x1b[0m ',
  useColors: true,
  preview: true,
});

// Add the render client to the REPL context
replServer.context.render = render;

// Also expose the RenderClient class for creating additional clients
replServer.context.RenderClient = RenderClient;

// Add a helper to pretty-print JSON
replServer.context.pp = (obj: unknown) => {
  console.log(JSON.stringify(obj, null, 2));
};

// Custom commands
replServer.defineCommand('resources', {
  help: 'List all available resources on the render client',
  action() {
    console.log('\nAvailable resources on `render`:');
    console.log('  render.services          - Web services, workers, static sites, cron jobs');
    console.log('  render.services.deploys  - Deployments (nested)');
    console.log('  render.services.customDomains');
    console.log('  render.services.envVars');
    console.log('  render.services.secretFiles');
    console.log('  render.services.headers');
    console.log('  render.services.routes');
    console.log('  render.services.jobs');
    console.log('  render.postgres          - PostgreSQL databases');
    console.log('  render.keyValue          - Key-Value (Redis-compatible) stores');
    console.log('  render.redis             - Redis (deprecated)');
    console.log('  render.disks             - Persistent disks');
    console.log('  render.envGroups         - Environment variable groups');
    console.log('  render.projects          - Projects');
    console.log('  render.environments      - Environments');
    console.log('  render.blueprints        - Infrastructure as Code blueprints');
    console.log('  render.registryCredentials');
    console.log('  render.webhooks');
    console.log('  render.workspaces        - Workspaces (owners)');
    console.log('  render.users             - Current user');
    console.log('  render.logs              - Log queries');
    console.log('  render.metrics           - Metrics queries');
    console.log('  render.maintenance       - Maintenance runs');
    console.log('  render.notificationSettings');
    console.log('  render.auditLogs');
    console.log('  render.events');
    console.log('  render.cronJobs          - Cron job runs');
    console.log('');
    this.displayPrompt();
  },
});

replServer.defineCommand('examples', {
  help: 'Show usage examples',
  action() {
    console.log('\nExamples:');
    console.log('');
    console.log('  // List services');
    console.log('  const { items } = await render.services.list()');
    console.log('');
    console.log('  // Get current user');
    console.log('  const user = await render.users.me()');
    console.log('');
    console.log('  // List all services with auto-pagination');
    console.log('  for await (const s of render.services.listAll()) console.log(s.name)');
    console.log('');
    console.log('  // Create a service');
    console.log('  const { service } = await render.services.create({');
    console.log("    type: 'web_service',");
    console.log("    name: 'my-api',");
    console.log("    ownerId: 'tea-xxxxx',");
    console.log("    repo: 'https://github.com/user/repo',");
    console.log('    serviceDetails: {');
    console.log("      runtime: 'node',");
    console.log("      plan: 'starter',");
    console.log("      region: 'oregon',");
    console.log('      envSpecificDetails: {');
    console.log("        buildCommand: 'npm install',");
    console.log("        startCommand: 'npm start',");
    console.log('      },');
    console.log('    },');
    console.log('  })');
    console.log('');
    console.log('  // Pretty print with pp()');
    console.log('  pp(await render.services.list())');
    console.log('');
    this.displayPrompt();
  },
});

// Handle exit
replServer.on('exit', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});

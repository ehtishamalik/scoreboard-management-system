// HTTP (no transactions, faster cold starts)
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
// WebSocket/Pool (transactions supported)
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// ---------- HTTP connection ----------
const clientHttp = neon(env.DATABASE_URL);
export const db = drizzleHttp(clientHttp, { schema });

// ---------- WebSocket connection ----------
neonConfig.webSocketConstructor = globalThis.WebSocket ?? require('ws');
const clientWs = new Pool({ connectionString: env.DATABASE_URL });
export const dbWs = drizzleWs(clientWs, { schema });

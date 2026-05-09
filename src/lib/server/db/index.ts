import * as schema from './schema';

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

// HTTP (no transactions, faster cold starts)
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
// WebSocket/Pool (transactions supported)
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const getReadonlyHost = (): string => {
  if (env.READ_REPLICA_URL) {
    return env.READ_REPLICA_URL;
  }

  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

  return env.DATABASE_URL;
};

// ---------- HTTP connection ----------
const clientHttp = neon(env.DATABASE_URL);
export const db = drizzleHttp(clientHttp, { schema });

// ---------- HTTP connection for Read Replica ----------
const clientHttpReplica = neon(getReadonlyHost());
export const dbReplica = drizzleHttp(clientHttpReplica, { schema });

// ---------- WebSocket connection ----------
neonConfig.webSocketConstructor = globalThis.WebSocket ?? require('ws');
const clientWs = new Pool({ connectionString: env.DATABASE_URL });
export const dbWs = drizzleWs(clientWs, { schema });

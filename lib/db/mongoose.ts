import mongoose from 'mongoose';

/**
 * Cached Mongoose connection for Next.js App Router.
 *
 * Next.js hot-reloads modules in development, which would otherwise create
 * a new connection on every file save. This module stores the connection
 * promise on the Node.js `global` object so it survives module re-evaluation
 * while the process lives.
 *
 * @module lib/db/mongoose
 */

/** Shared cached connection state across hot reloads */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend NodeJS global to hold the cache
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global._mongooseCache) {
  global._mongooseCache = cache;
}

export function getMongoUri(): string {
  return (process.env.MONGODB_URI || 'mongodb://localhost:27017/mylol').trim();
}

/**
 * Returns a cached Mongoose connection, creating one if it does not exist yet.
 *
 * @returns {Promise<typeof mongoose>} The connected Mongoose instance.
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  const uri = getMongoUri();

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 4000,
      })
      .then((instance) => {
        cache.conn = instance;
        return instance;
      })
      .catch((err) => {
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    cache.conn = null;
    throw err;
  }
}

/**
 * Disconnects existing connection and connects to a new MongoDB URI dynamically.
 */
export async function reconnectMongo(newUri: string): Promise<typeof mongoose> {
  if (cache.conn || mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
  cache.conn = null;
  cache.promise = null;

  process.env.MONGODB_URI = newUri.trim();
  return dbConnect();
}

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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mylol';

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

/**
 * Returns a cached Mongoose connection, creating one if it does not exist yet.
 *
 * @returns {Promise<typeof mongoose>} The connected Mongoose instance.
 *
 * @example
 * import dbConnect from '@/lib/db/mongoose';
 * await dbConnect();
 */
export default async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((instance) => {
        cache.conn = instance;
        return instance;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

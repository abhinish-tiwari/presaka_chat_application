import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection attempts exceeded');
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

export const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return redisClient;
};

// Helper functions for common Redis operations
export const setWithExpiry = async (key, value, expirySeconds) => {
  return await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
};

export const get = async (key) => {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
};

export const del = async (key) => {
  return await redisClient.del(key);
};

export const exists = async (key) => {
  return await redisClient.exists(key);
};

export const increment = async (key) => {
  return await redisClient.incr(key);
};

export const setExpiry = async (key, seconds) => {
  return await redisClient.expire(key, seconds);
};


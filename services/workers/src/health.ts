// Health Check for Docker
// Created: 03-Jul-25

import Redis from 'ioredis';
import { config } from './config';

async function checkHealth() {
  const redis = new Redis(config.redis.url);
  
  try {
    // Check Redis connection
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      throw new Error('Redis ping failed');
    }
    
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    await redis.quit();
    process.exit(1);
  }
}

checkHealth();
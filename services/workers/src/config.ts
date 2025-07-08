// Worker Configuration
// Created: 03-Jul-25

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    },
    from: process.env.EMAIL_FROM || 'noreply@sasarjan.com',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  workers: {
    concurrency: {
      email: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '10'),
      payment: parseInt(process.env.PAYMENT_WORKER_CONCURRENCY || '5'),
      analytics: parseInt(process.env.ANALYTICS_WORKER_CONCURRENCY || '20'),
    },
  },
};
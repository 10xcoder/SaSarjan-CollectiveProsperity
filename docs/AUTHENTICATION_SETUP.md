# SaSarjan Authentication Setup Guide

This guide will help you set up the complete authentication system for SaSarjan, including email and WhatsApp verification.

## 🚀 Quick Start

1. **Copy Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Run Database Migrations**

   ```bash
   pnpm db:migrate
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 📊 Supabase Configuration

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API keys from Settings > API

### 2. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Database Migrations

Execute the migration file in your Supabase SQL editor:

```sql
-- File: supabase/migrations/20250107_create_verification_tables.sql
-- This creates the email_verifications and whatsapp_verifications tables
```

### 4. Configure Authentication Settings

In Supabase Dashboard > Authentication > Settings:

**Site URL:** `http://localhost:3000` (development) or your production URL

**Additional Redirect URLs:**

- `http://localhost:3000/auth/callback`
- `https://yourdomain.com/auth/callback`

**Enable Providers:**

- Email (always enabled)
- Google OAuth (optional)
- GitHub OAuth (optional)

### 5. OAuth Provider Setup (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add to Supabase: Authentication > Providers > Google

#### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth app
3. Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add to Supabase: Authentication > Providers > GitHub

## 📧 Email Service Configuration

Choose one of the following email providers:

### Option 1: Resend (Recommended)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SaSarjan
```

**Setup:**

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key
4. Update environment variables

### Option 2: SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SaSarjan
```

### Option 3: Supabase (Default)

```env
EMAIL_PROVIDER=supabase
```

Uses Supabase's built-in email service (limited customization).

## 📱 WhatsApp Configuration

Choose one of the following WhatsApp providers:

### Option 1: Twilio (Recommended for Development)

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Setup:**

1. Sign up at [twilio.com](https://twilio.com)
2. Get WhatsApp sandbox number for testing
3. For production: Apply for WhatsApp Business API
4. Get Account SID and Auth Token from Console

### Option 2: Meta WhatsApp Business (Production)

```env
WHATSAPP_PROVIDER=meta_cloud
META_ACCESS_TOKEN=your_permanent_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_BUSINESS_ACCOUNT_ID=your_business_account_id
```

**Setup:**

1. Create Meta Business account
2. Set up WhatsApp Business API
3. Get permanent access token
4. Create message templates in Business Manager

## 🔒 Rate Limiting Configuration

For production, set up Upstash Redis for rate limiting:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Setup:**

1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Get REST URL and token

## 🧪 Testing the Setup

### 1. Test Email Verification

```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email",
    "identifier": "test@example.com",
    "type": "signup",
    "fullName": "Test User"
  }'
```

### 2. Test WhatsApp Verification

```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "method": "phone",
    "identifier": "+1234567890",
    "type": "signup",
    "fullName": "Test User"
  }'
```

### 3. Test Verification Code

```bash
curl -X POST http://localhost:3000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "method": "email",
    "identifier": "test@example.com",
    "code": "123456",
    "type": "signup",
    "userData": {
      "fullName": "Test User",
      "password": "securepassword"
    }
  }'
```

## 📝 Available Auth Routes

- `GET /auth/login` - Login page
- `GET /auth/register` - Registration page
- `GET /auth/callback` - OAuth callback handler
- `POST /api/auth/send-verification` - Send verification code
- `POST /api/auth/verify-code` - Verify code and complete auth

## 🛠 Development Tips

### 1. Use Test Codes

For development, the system accepts `123456` as a valid verification code.

### 2. Phone Number Format

Use international format: `+1234567890` or `+91 98765 43210`

### 3. Email Testing

Use a service like [Mailtrap](https://mailtrap.io) for email testing in development.

### 4. WhatsApp Testing

- Twilio Sandbox: Test with sandbox number
- Meta: Use test phone numbers in development mode

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot find module '@sasarjan/auth'"**

```bash
pnpm build  # Rebuild the auth package
```

**2. Email not sending**

- Check email provider API keys
- Verify domain configuration
- Check rate limits

**3. WhatsApp not working**

- Verify API credentials
- Check phone number format
- Ensure WhatsApp is installed on test device

**4. OAuth redirect errors**

- Check redirect URLs in provider settings
- Ensure URLs match exactly (including protocol)

### Debug Mode

Set environment variable for verbose logging:

```env
DEBUG=auth:*
```

## 🚀 Production Deployment

### 1. Update Environment Variables

- Use production database URLs
- Set up proper email domain
- Configure production WhatsApp numbers
- Enable rate limiting with Redis

### 2. Security Checklist

- [ ] Use HTTPS for all URLs
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Use strong service role keys
- [ ] Configure proper redirect URLs
- [ ] Set up monitoring and logging

### 3. WhatsApp Business Verification

For production WhatsApp:

1. Complete Meta Business verification
2. Submit WhatsApp Business API application
3. Create approved message templates
4. Set up webhook for delivery status

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the environment variables
3. Test with curl commands
4. Check logs in development tools

For WhatsApp configuration help, provide:

- Your preferred provider (Twilio/Meta)
- Business requirements
- Expected message volume
- Target regions/countries

The authentication system supports both development and production environments with proper scaling and security measures in place.

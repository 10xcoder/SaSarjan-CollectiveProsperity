import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get client IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  // Priority: CF > X-Forwarded-For > X-Real-IP > request.ip
  let clientIP = cfConnectingIP || forwardedFor?.split(',')[0].trim() || realIP || 'unknown'
  
  // In development, use a dummy IP
  if (process.env.NODE_ENV === 'development' && clientIP === 'unknown') {
    clientIP = '127.0.0.1'
  }
  
  return NextResponse.json({ 
    ip: clientIP,
    headers: {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIP,
      'cf-connecting-ip': cfConnectingIP
    }
  })
}
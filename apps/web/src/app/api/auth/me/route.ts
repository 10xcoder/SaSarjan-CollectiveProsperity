import { NextRequest, NextResponse } from 'next/server'
import { withJWTAuth, getRequestUser } from '@sasarjan/auth'

export const GET = withJWTAuth(async (req: NextRequest) => {
  const user = getRequestUser(req)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({
    user: {
      id: user.sub,
      email: user.email,
      roles: user.roles,
      sessionId: user.sessionId
    }
  })
})
import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  try {
    // For JWT-based auth, logout is typically handled client-side
    // by removing the token from storage
    // However, we can provide a server endpoint for consistency
    
    return NextResponse.json(
      { 
        message: 'Logout successful',
        instructions: 'Please remove the authentication token from client storage'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to logout' },
    { status: 405 }
  )
}
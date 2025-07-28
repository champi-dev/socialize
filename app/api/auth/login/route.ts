import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    
    await connectDB()
    
    const body = await request.json()
    const { login, password, email } = body

    // Accept either 'login' field or 'email' field for backwards compatibility
    const loginValue = login || email

    // Validation
    if (!loginValue || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }]
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last active time
    user.lastActive = new Date()
    await user.save()

    // Generate token
    const token = user.generateAuthToken()

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          avatar: user.avatar,
          isVerified: user.isVerified,
          lastActive: user.lastActive
        },
        token
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
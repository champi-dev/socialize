import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // For now, return mock data since we haven't created the Post model yet
    const mockPosts = [
      {
        _id: '1',
        title: 'Welcome to Socialize!',
        content: 'This is a demo post to show the API is working.',
        author: {
          username: 'admin',
          displayName: 'Admin User'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      }
    ]
    
    return NextResponse.json({
      posts: mockPosts,
      total: mockPosts.length
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { title, content } = body
    
    // Basic validation
    if (!content) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      )
    }
    
    // For now, return a mock response since we need authentication middleware
    return NextResponse.json(
      { 
        error: 'Authentication required',
        message: 'Please login to create posts'
      },
      { status: 401 }
    )
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    if (!tag) {
      return NextResponse.json({ error: 'Tag parameter required' }, { status: 400 })
    }

    revalidateTag(tag)
    
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
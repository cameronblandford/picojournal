import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt, decrypt } from "@/lib/encryption"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (date) {
      const entry = await prisma.entry.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: new Date(date)
          }
        }
      })
      
      const decryptedEntry = entry ? {
        ...entry,
        content: decrypt(entry.content)
      } : null
      
      return NextResponse.json({ entry: decryptedEntry }, {
        headers: {
          'Cache-Control': 'private, max-age=300'
        }
      })
    }

    const entries = await prisma.entry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50
    })

    const decryptedEntries = entries.map(entry => ({
      ...entry,
      content: decrypt(entry.content)
    }))

    return NextResponse.json({ entries: decryptedEntries }, {
      headers: {
        'Cache-Control': 'private, max-age=300'
      }
    })
  } catch (error) {
    console.error("Error fetching entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, date } = await request.json()

    if (!content || !date) {
      return NextResponse.json(
        { error: "Content and date are required" },
        { status: 400 }
      )
    }

    const encryptedContent = encrypt(content)
    
    const entry = await prisma.entry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: new Date(date)
        }
      },
      update: {
        content: encryptedContent
      },
      create: {
        userId: session.user.id,
        content: encryptedContent,
        date: new Date(date)
      }
    })

    const decryptedEntry = {
      ...entry,
      content: decrypt(entry.content)
    }

    return NextResponse.json({ entry: decryptedEntry }, { status: 201 })
  } catch (error) {
    console.error("Error creating/updating entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
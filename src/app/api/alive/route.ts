import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Ensure we're using UTC date
    const checkDate = new Date(date + 'T00:00:00.000Z')
    
    const aliveCheck = await prisma.aliveCheck.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: checkDate
        }
      }
    })
    
    console.log("Checking alive status for:", { 
      userId: session.user.id, 
      date, 
      checkDate: checkDate.toISOString(),
      found: !!aliveCheck 
    })
    
    return NextResponse.json({ hasChecked: !!aliveCheck }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error("Error fetching alive check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      )
    }

    // Ensure we're using UTC date
    const checkDate = new Date(date + 'T00:00:00.000Z')
    
    // Check if already exists
    const existing = await prisma.aliveCheck.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: checkDate
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already checked today" }, { status: 400 })
    }
    
    const aliveCheck = await prisma.aliveCheck.create({
      data: {
        userId: session.user.id,
        date: checkDate
      }
    })

    console.log("Created alive check:", { userId: session.user.id, date, id: aliveCheck.id })

    return NextResponse.json({ aliveCheck }, { status: 201 })
  } catch (error) {
    console.error("Error creating alive check:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
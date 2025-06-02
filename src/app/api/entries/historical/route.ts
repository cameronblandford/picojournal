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

    // Debug logging
    console.log(`Historical API called for user: ${session.user.email} (${session.user.id})`)

    // Get today's date as a string and create Date objects that match our storage format
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Calculate date strings first
    const oneWeekAgoDate = new Date(today)
    oneWeekAgoDate.setDate(today.getDate() - 7)
    const oneWeekAgoStr = oneWeekAgoDate.toISOString().split('T')[0]
    
    const oneMonthAgoDate = new Date(today)
    oneMonthAgoDate.setMonth(today.getMonth() - 1)
    const oneMonthAgoStr = oneMonthAgoDate.toISOString().split('T')[0]
    
    const oneYearAgoDate = new Date(today)
    oneYearAgoDate.setFullYear(today.getFullYear() - 1)
    const oneYearAgoStr = oneYearAgoDate.toISOString().split('T')[0]
    
    // Create Date objects in local timezone (which matches our storage)
    const oneWeekAgo = new Date(oneWeekAgoStr + 'T00:00:00')
    const oneMonthAgo = new Date(oneMonthAgoStr + 'T00:00:00')
    const oneYearAgo = new Date(oneYearAgoStr + 'T00:00:00')

    const [weekEntry, monthEntry, yearEntry] = await Promise.all([
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: oneWeekAgo
          }
        }
      }),
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: oneMonthAgo
          }
        }
      }),
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: oneYearAgo
          }
        }
      })
    ])

    return NextResponse.json({
      oneWeekAgo: weekEntry,
      oneMonthAgo: monthEntry,
      oneYearAgo: yearEntry
    })
  } catch (error) {
    console.error("Error fetching historical entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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

    const today = new Date()
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(today.getDate() - 7)
    
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setMonth(today.getMonth() - 1)
    
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)

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
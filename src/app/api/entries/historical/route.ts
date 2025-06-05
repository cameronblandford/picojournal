import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Debug logging
    console.log(`Historical API called for user: ${session.user.email} (${session.user.id})`)

    // Use the exact same method that worked in our test scripts
    const today = new Date()
    const oneWeekAgoStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const oneMonthAgoDate = new Date(today)
    oneMonthAgoDate.setMonth(today.getMonth() - 1)
    const oneMonthAgoStr = oneMonthAgoDate.toISOString().split('T')[0]
    const oneYearAgoDate = new Date(today)
    oneYearAgoDate.setFullYear(today.getFullYear() - 1)
    const oneYearAgoStr = oneYearAgoDate.toISOString().split('T')[0]

    console.log(`Target dates: ${oneWeekAgoStr}, ${oneMonthAgoStr}, ${oneYearAgoStr}`)

    // Use UTC dates to match our database storage format
    const oneWeekAgo = new Date(oneWeekAgoStr + 'T00:00:00.000Z')
    const oneMonthAgo = new Date(oneMonthAgoStr + 'T00:00:00.000Z')
    const oneYearAgo = new Date(oneYearAgoStr + 'T00:00:00.000Z')

    console.log(`Created date objects: ${oneWeekAgo.toISOString()}, ${oneMonthAgo.toISOString()}, ${oneYearAgo.toISOString()}`)

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

    console.log(`Results: week=${!!weekEntry}, month=${!!monthEntry}, year=${!!yearEntry}`)

    return NextResponse.json({
      oneWeekAgo: weekEntry ? { ...weekEntry, content: decrypt(weekEntry.content) } : null,
      oneMonthAgo: monthEntry ? { ...monthEntry, content: decrypt(monthEntry.content) } : null,
      oneYearAgo: yearEntry ? { ...yearEntry, content: decrypt(yearEntry.content) } : null
    }, {
      headers: {
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    console.error("Error fetching historical entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing historical API logic directly...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  console.log(`👤 Test user: ${testUser.email} (${testUser.id})`)

  // Simulate the exact logic from the API
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  console.log(`\n📅 Target dates:`)
  console.log(`   Today: ${today.toISOString()} (${today.toISOString().split('T')[0]})`)
  console.log(`   One week ago: ${oneWeekAgo.toISOString()} (${oneWeekAgo.toISOString().split('T')[0]})`)
  console.log(`   One month ago: ${oneMonthAgo.toISOString()} (${oneMonthAgo.toISOString().split('T')[0]})`)
  console.log(`   One year ago: ${oneYearAgo.toISOString()} (${oneYearAgo.toISOString().split('T')[0]})`)

  const [weekEntry, monthEntry, yearEntry] = await Promise.all([
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: oneWeekAgo
        }
      }
    }),
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: oneMonthAgo
        }
      }
    }),
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: oneYearAgo
        }
      }
    })
  ])

  console.log(`\n🔍 Historical entries found:`)
  console.log(`   Week ago: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  if (weekEntry) {
    console.log(`\n📝 Week ago entry:`)
    console.log(`   Date: ${weekEntry.date.toISOString()}`)
    console.log(`   Content: "${weekEntry.content}"`)
  }

  if (monthEntry) {
    console.log(`\n📝 Month ago entry:`)
    console.log(`   Date: ${monthEntry.date.toISOString()}`)
    console.log(`   Content: "${monthEntry.content}"`)
  }

  if (yearEntry) {
    console.log(`\n📝 Year ago entry:`)
    console.log(`   Date: ${yearEntry.date.toISOString()}`)
    console.log(`   Content: "${yearEntry.content}"`)
  }

  // Test the API response format
  const apiResponse = {
    oneWeekAgo: weekEntry,
    oneMonthAgo: monthEntry,
    oneYearAgo: yearEntry
  }

  console.log(`\n📡 API would return:`)
  console.log(JSON.stringify(apiResponse, null, 2))

  // Check if any entries exist around these dates
  if (!weekEntry || !monthEntry || !yearEntry) {
    console.log(`\n🔍 Checking for entries around missing dates...`)

    if (!weekEntry) {
      const nearWeek = await prisma.entry.findMany({
        where: {
          userId: testUser.id,
          date: {
            gte: new Date(oneWeekAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
            lte: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'asc' }
      })
      console.log(`   Entries within ±3 days of week ago:`)
      nearWeek.forEach(entry => {
        console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 40)}..."`)
      })
    }

    if (!monthEntry) {
      const nearMonth = await prisma.entry.findMany({
        where: {
          userId: testUser.id,
          date: {
            gte: new Date(oneMonthAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
            lte: new Date(oneMonthAgo.getTime() + 3 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'asc' }
      })
      console.log(`   Entries within ±3 days of month ago:`)
      nearMonth.forEach(entry => {
        console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 40)}..."`)
      })
    }

    if (!yearEntry) {
      const nearYear = await prisma.entry.findMany({
        where: {
          userId: testUser.id,
          date: {
            gte: new Date(oneYearAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
            lte: new Date(oneYearAgo.getTime() + 3 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'asc' }
      })
      console.log(`   Entries within ±3 days of year ago:`)
      nearYear.forEach(entry => {
        console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 40)}..."`)
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
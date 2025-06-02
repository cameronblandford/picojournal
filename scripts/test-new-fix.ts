import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing the new timezone fix...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  console.log(`👤 Test user: ${testUser.email}`)

  // Use the same logic as the updated API
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

  console.log(`\n📅 Calculated dates (new method):`)
  console.log(`   Week ago: ${oneWeekAgo.toISOString()} (${oneWeekAgoStr})`)
  console.log(`   Month ago: ${oneMonthAgo.toISOString()} (${oneMonthAgoStr})`)
  console.log(`   Year ago: ${oneYearAgo.toISOString()} (${oneYearAgoStr})`)

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

  console.log(`\n🔍 Results:`)
  console.log(`   Week ago: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  if (weekEntry) {
    console.log(`\n📝 Week ago: "${weekEntry.content}"`)
  }
  if (monthEntry) {
    console.log(`📝 Month ago: "${monthEntry.content}"`)
  }
  if (yearEntry) {
    console.log(`📝 Year ago: "${yearEntry.content}"`)
  }

  // Also test what the API response would look like
  const apiResponse = {
    oneWeekAgo: weekEntry,
    oneMonthAgo: monthEntry,
    oneYearAgo: yearEntry
  }

  console.log(`\n📡 API Response:`)
  console.log(JSON.stringify(apiResponse, (key, value) => {
    if (value && typeof value === 'object' && value.date) {
      return {
        ...value,
        date: value.date.toISOString()
      }
    }
    return value
  }, 2))
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
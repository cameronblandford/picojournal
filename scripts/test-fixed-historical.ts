import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing fixed historical lookback...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  // Use the same logic as the fixed API
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  console.log(`📅 Today (normalized): ${today.toISOString()}`)
  console.log(`📅 One week ago: ${oneWeekAgo.toISOString()} (${oneWeekAgo.toISOString().split('T')[0]})`)
  console.log(`📅 One month ago: ${oneMonthAgo.toISOString()} (${oneMonthAgo.toISOString().split('T')[0]})`)
  console.log(`📅 One year ago: ${oneYearAgo.toISOString()} (${oneYearAgo.toISOString().split('T')[0]})`)

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
  console.log(`   Week ago entry: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago entry: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago entry: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  if (weekEntry) {
    console.log(`\n📝 Week ago: "${weekEntry.content}"`)
  }
  if (monthEntry) {
    console.log(`📝 Month ago: "${monthEntry.content}"`)
  }
  if (yearEntry) {
    console.log(`📝 Year ago: "${yearEntry.content}"`)
  }

  // Let's also check what entries exist around the target dates
  if (!weekEntry) {
    console.log(`\n🔍 Checking entries around ${oneWeekAgo.toISOString().split('T')[0]}:`)
    const nearbyEntries = await prisma.entry.findMany({
      where: {
        userId: testUser.id,
        date: {
          gte: new Date(oneWeekAgo.getTime() - 2 * 24 * 60 * 60 * 1000),
          lte: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'asc' }
    })
    
    nearbyEntries.forEach(entry => {
      console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 40)}..."`)
    })
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
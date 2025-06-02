import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Checking seed data...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  console.log(`✅ Test user found: ${testUser.email}`)

  const totalEntries = await prisma.entry.count({
    where: { userId: testUser.id }
  })

  const entriesThisWeek = await prisma.entry.count({
    where: {
      userId: testUser.id,
      date: {
        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })

  const entriesThisMonth = await prisma.entry.count({
    where: {
      userId: testUser.id,
      date: {
        gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  })

  const oldestEntry = await prisma.entry.findFirst({
    where: { userId: testUser.id },
    orderBy: { date: 'asc' }
  })

  const newestEntry = await prisma.entry.findFirst({
    where: { userId: testUser.id },
    orderBy: { date: 'desc' }
  })

  const sampleEntries = await prisma.entry.findMany({
    where: { userId: testUser.id },
    orderBy: { date: 'desc' },
    take: 5
  })

  console.log(`📈 Total entries: ${totalEntries}`)
  console.log(`📅 Entries this week: ${entriesThisWeek}`)
  console.log(`📅 Entries this month: ${entriesThisMonth}`)
  console.log(`🗓️  Date range: ${oldestEntry?.date.toISOString().split('T')[0]} to ${newestEntry?.date.toISOString().split('T')[0]}`)
  
  console.log('\n📝 Sample recent entries:')
  sampleEntries.forEach((entry, index) => {
    console.log(`   ${index + 1}. ${entry.date.toISOString().split('T')[0]}: "${entry.content}"`)
  })

  // Check for historical entries (1 week, 1 month, 1 year ago)
  const today = new Date()
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  const weekAgoEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneWeekAgo
      }
    }
  })

  const monthAgoEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneMonthAgo
      }
    }
  })

  const yearAgoEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneYearAgo
      }
    }
  })

  console.log('\n🔍 Historical entries check:')
  console.log(`   One week ago (${oneWeekAgo.toISOString().split('T')[0]}): ${weekAgoEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   One month ago (${oneMonthAgo.toISOString().split('T')[0]}): ${monthAgoEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   One year ago (${oneYearAgo.toISOString().split('T')[0]}): ${yearAgoEntry ? '✅ Found' : '❌ Not found'}`)

  if (weekAgoEntry) console.log(`      Week ago: "${weekAgoEntry.content}"`)
  if (monthAgoEntry) console.log(`      Month ago: "${monthAgoEntry.content}"`)
  if (yearAgoEntry) console.log(`      Year ago: "${yearAgoEntry.content}"`)
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
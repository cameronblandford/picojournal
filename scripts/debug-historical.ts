import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging historical lookback...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  const today = new Date()
  console.log(`📅 Today: ${today.toISOString()}`)
  console.log(`📅 Today (date only): ${today.toISOString().split('T')[0]}`)

  // Create date objects the same way as the API
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  console.log(`\n🔍 Calculated dates:`)
  console.log(`   One week ago: ${oneWeekAgo.toISOString()} (${oneWeekAgo.toISOString().split('T')[0]})`)
  console.log(`   One month ago: ${oneMonthAgo.toISOString()} (${oneMonthAgo.toISOString().split('T')[0]})`)
  console.log(`   One year ago: ${oneYearAgo.toISOString()} (${oneYearAgo.toISOString().split('T')[0]})`)

  // Try to find entries with these exact dates
  console.log(`\n🔍 Looking for entries with exact dates...`)
  
  const weekEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneWeekAgo
      }
    }
  })

  const monthEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneMonthAgo
      }
    }
  })

  const yearEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneYearAgo
      }
    }
  })

  console.log(`   Week ago entry: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago entry: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago entry: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  // Now let's try with normalized dates (start of day)
  console.log(`\n🔍 Trying with normalized dates (start of day)...`)

  const normalizeDate = (date: Date) => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }

  const normalizedWeekAgo = normalizeDate(oneWeekAgo)
  const normalizedMonthAgo = normalizeDate(oneMonthAgo)
  const normalizedYearAgo = normalizeDate(oneYearAgo)

  console.log(`   Normalized week ago: ${normalizedWeekAgo.toISOString()}`)
  console.log(`   Normalized month ago: ${normalizedMonthAgo.toISOString()}`)
  console.log(`   Normalized year ago: ${normalizedYearAgo.toISOString()}`)

  const normalizedWeekEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: normalizedWeekAgo
      }
    }
  })

  const normalizedMonthEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: normalizedMonthAgo
      }
    }
  })

  const normalizedYearEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: normalizedYearAgo
      }
    }
  })

  console.log(`   Normalized week ago entry: ${normalizedWeekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Normalized month ago entry: ${normalizedMonthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Normalized year ago entry: ${normalizedYearEntry ? '✅ Found' : '❌ Not found'}`)

  // Let's also check what entries we actually have around these dates
  console.log(`\n📋 Checking actual entries around these dates...`)

  const entriesAroundWeek = await prisma.entry.findMany({
    where: {
      userId: testUser.id,
      date: {
        gte: new Date(normalizedWeekAgo.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before
        lte: new Date(normalizedWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000)  // 3 days after
      }
    },
    orderBy: { date: 'asc' }
  })

  console.log(`   Entries around week ago (±3 days):`)
  entriesAroundWeek.forEach(entry => {
    console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 50)}..."`)
  })

  if (normalizedWeekEntry) {
    console.log(`\n✅ Week ago entry found: "${normalizedWeekEntry.content}"`)
  }
  if (normalizedMonthEntry) {
    console.log(`✅ Month ago entry found: "${normalizedMonthEntry.content}"`)
  }
  if (normalizedYearEntry) {
    console.log(`✅ Year ago entry found: "${normalizedYearEntry.content}"`)
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
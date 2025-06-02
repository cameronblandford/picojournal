import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing with raw SQL...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  console.log(`👤 Test user: ${testUser.email} (${testUser.id})`)

  // Calculate target dates
  const today = new Date()
  const oneWeekAgoStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const oneMonthAgoDate = new Date(today)
  oneMonthAgoDate.setMonth(today.getMonth() - 1)
  const oneMonthAgoStr = oneMonthAgoDate.toISOString().split('T')[0]
  const oneYearAgoDate = new Date(today)
  oneYearAgoDate.setFullYear(today.getFullYear() - 1)
  const oneYearAgoStr = oneYearAgoDate.toISOString().split('T')[0]

  console.log(`\n📅 Target date strings:`)
  console.log(`   Week ago: ${oneWeekAgoStr}`)
  console.log(`   Month ago: ${oneMonthAgoStr}`)
  console.log(`   Year ago: ${oneYearAgoStr}`)

  // Test with raw SQL
  console.log(`\n🔍 Testing with raw SQL...`)

  const weekEntryRaw = await prisma.$queryRaw`
    SELECT * FROM "Entry" 
    WHERE "userId" = ${testUser.id} 
    AND date = ${oneWeekAgoStr}::date
  `

  const monthEntryRaw = await prisma.$queryRaw`
    SELECT * FROM "Entry" 
    WHERE "userId" = ${testUser.id} 
    AND date = ${oneMonthAgoStr}::date
  `

  const yearEntryRaw = await prisma.$queryRaw`
    SELECT * FROM "Entry" 
    WHERE "userId" = ${testUser.id} 
    AND date = ${oneYearAgoStr}::date
  `

  console.log(`   Week ago (raw): ${Array.isArray(weekEntryRaw) && weekEntryRaw.length > 0 ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago (raw): ${Array.isArray(monthEntryRaw) && monthEntryRaw.length > 0 ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago (raw): ${Array.isArray(yearEntryRaw) && yearEntryRaw.length > 0 ? '✅ Found' : '❌ Not found'}`)

  if (Array.isArray(weekEntryRaw) && weekEntryRaw.length > 0) {
    console.log(`\n📝 Week ago entry (raw):`, weekEntryRaw[0])
  }

  // Now test with Prisma using different date formats
  console.log(`\n🔍 Testing Prisma with different date formats...`)

  // Method 1: Date string as date
  try {
    const weekEntry1 = await prisma.entry.findFirst({
      where: {
        userId: testUser.id,
        date: {
          equals: new Date(oneWeekAgoStr + 'T00:00:00.000Z')
        }
      }
    })
    console.log(`   Method 1 (UTC): ${weekEntry1 ? '✅ Found' : '❌ Not found'}`)
  } catch (e) {
    console.log(`   Method 1 error:`, e)
  }

  // Method 2: Date string as local time
  try {
    const weekEntry2 = await prisma.entry.findFirst({
      where: {
        userId: testUser.id,
        date: {
          equals: new Date(oneWeekAgoStr + 'T00:00:00')
        }
      }
    })
    console.log(`   Method 2 (local): ${weekEntry2 ? '✅ Found' : '❌ Not found'}`)
  } catch (e) {
    console.log(`   Method 2 error:`, e)
  }

  // Method 3: Using the exact unique constraint
  try {
    const weekEntry3 = await prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: new Date(oneWeekAgoStr + 'T00:00:00')
        }
      }
    })
    console.log(`   Method 3 (unique constraint): ${weekEntry3 ? '✅ Found' : '❌ Not found'}`)
    if (weekEntry3) {
      console.log(`     Content: "${weekEntry3.content}"`)
    }
  } catch (e) {
    console.log(`   Method 3 error:`, e)
  }

  // Let's also check what dates we have for this user around the target
  console.log(`\n📋 Entries around target dates:`)
  const allEntries = await prisma.entry.findMany({
    where: { userId: testUser.id },
    orderBy: { date: 'desc' },
    take: 20
  })

  allEntries.forEach(entry => {
    const dateStr = entry.date.toISOString().split('T')[0]
    const isTarget = [oneWeekAgoStr, oneMonthAgoStr, oneYearAgoStr].includes(dateStr)
    console.log(`   ${dateStr}: "${entry.content.substring(0, 50)}..." ${isTarget ? '🎯' : ''}`)
  })
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
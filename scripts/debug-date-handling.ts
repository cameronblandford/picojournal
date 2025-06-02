import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging date handling...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  // Let's see what happens when we query with different date formats
  const targetDate = '2025-05-26'
  
  console.log(`🎯 Looking for entry on ${targetDate}`)

  // Method 1: Use string date
  console.log('\n1️⃣ Using string date:')
  try {
    const entry1 = await prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: targetDate as any // TypeScript workaround
        }
      }
    })
    console.log(`   Result: ${entry1 ? '✅ Found' : '❌ Not found'}`)
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Method 2: Use Date object with explicit timezone
  console.log('\n2️⃣ Using Date object:')
  const dateObj = new Date(targetDate + 'T00:00:00.000Z')
  console.log(`   Date object: ${dateObj.toISOString()}`)
  try {
    const entry2 = await prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: dateObj
        }
      }
    })
    console.log(`   Result: ${entry2 ? '✅ Found' : '❌ Not found'}`)
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Method 3: Use Date object with local timezone
  console.log('\n3️⃣ Using Date object with local timezone:')
  const localDateObj = new Date(targetDate + 'T00:00:00')
  console.log(`   Local date object: ${localDateObj.toISOString()}`)
  try {
    const entry3 = await prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: testUser.id,
          date: localDateObj
        }
      }
    })
    console.log(`   Result: ${entry3 ? '✅ Found' : '❌ Not found'}`)
  } catch (error) {
    console.log(`   Error: ${error}`)
  }

  // Method 4: Let's see what dates we actually have
  console.log('\n4️⃣ Checking actual entries around this date:')
  const nearbyEntries = await prisma.entry.findMany({
    where: {
      userId: testUser.id,
      date: {
        gte: new Date('2025-05-25T00:00:00Z'),
        lte: new Date('2025-05-27T23:59:59Z')
      }
    },
    orderBy: { date: 'asc' }
  })

  nearbyEntries.forEach(entry => {
    console.log(`   ${entry.date.toISOString()} (${entry.date.toISOString().split('T')[0]}): "${entry.content.substring(0, 30)}..."`)
  })

  // Method 5: Check raw database query
  console.log('\n5️⃣ Raw database check:')
  const rawResult = await prisma.$queryRaw`
    SELECT date, content 
    FROM "Entry" 
    WHERE "userId" = ${testUser.id} 
    AND date = ${targetDate}::date
  `
  console.log(`   Raw query result:`, rawResult)
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
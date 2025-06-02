import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Final debug of historical entries...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  console.log(`👤 Test user ID: ${testUser.id}`)

  // Check what entries we have for this exact user
  const userEntries = await prisma.entry.findMany({
    where: { userId: testUser.id },
    orderBy: { date: 'desc' },
    take: 10
  })

  console.log(`\n📝 Recent entries for this user:`)
  userEntries.forEach(entry => {
    console.log(`   ${entry.date.toISOString()} (${entry.date.toISOString().split('T')[0]}): "${entry.content.substring(0, 50)}..."`)
  })

  // Now check specific historical dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)

  console.log(`\n🎯 Looking for entry on ${oneWeekAgo.toISOString()} for user ${testUser.id}`)

  // Direct query
  const directEntry = await prisma.entry.findUnique({
    where: {
      userId_date: {
        userId: testUser.id,
        date: oneWeekAgo
      }
    }
  })

  console.log(`   Direct query result: ${directEntry ? '✅ Found' : '❌ Not found'}`)
  if (directEntry) {
    console.log(`   Content: "${directEntry.content}"`)
  }

  // Also check if there might be multiple users
  const allUsers = await prisma.user.findMany()
  console.log(`\n👥 Total users in database: ${allUsers.length}`)
  
  for (const user of allUsers) {
    const entryCount = await prisma.entry.count({
      where: { userId: user.id }
    })
    console.log(`   ${user.email || 'No email'} (${user.id}): ${entryCount} entries`)
  }

  // Check if the historical entry exists but for a different user
  const historicalEntryAnyUser = await prisma.entry.findFirst({
    where: {
      date: oneWeekAgo,
      content: {
        contains: "One week ago"
      }
    },
    include: {
      user: true
    }
  })

  if (historicalEntryAnyUser) {
    console.log(`\n🔍 Found historical entry for different user:`)
    console.log(`   User: ${historicalEntryAnyUser.user.email} (${historicalEntryAnyUser.userId})`)
    console.log(`   Content: "${historicalEntryAnyUser.content}"`)
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
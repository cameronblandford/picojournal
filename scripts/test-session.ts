import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking all users and their entries...\n')

  const allUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: { entries: true }
      }
    }
  })

  console.log(`👥 All users in database:`)
  for (const user of allUsers) {
    console.log(`   ${user.email} (${user.id}): ${user._count.entries} entries`)
    
    if (user.email === 'test@picojournal.app') {
      console.log(`   ⭐ This is our target test user`)
    }
  }

  // Check if there might be session/auth issues by looking at recent entries for each user
  console.log(`\n📝 Recent entries by user:`)
  for (const user of allUsers) {
    const recentEntries = await prisma.entry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 3
    })
    
    console.log(`\n   ${user.email}:`)
    recentEntries.forEach(entry => {
      console.log(`     ${entry.date.toISOString().split('T')[0]}: "${entry.content.substring(0, 40)}..."`)
    })
  }

  // Check if there are entries for the historical dates but for different users
  const today = new Date()
  const oneWeekAgoStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  console.log(`\n🔍 Checking all entries for ${oneWeekAgoStr} (regardless of user):`)
  const allWeekEntries = await prisma.entry.findMany({
    where: {
      date: new Date(oneWeekAgoStr + 'T00:00:00')
    },
    include: {
      user: true
    }
  })

  allWeekEntries.forEach(entry => {
    console.log(`   User: ${entry.user.email} - Content: "${entry.content}"`)
  })

  console.log(`\n💡 Summary:`)
  console.log(`   - Total users: ${allUsers.length}`)
  console.log(`   - Test user exists: ${allUsers.some(u => u.email === 'test@picojournal.app') ? '✅' : '❌'}`)
  console.log(`   - Test user has entries: ${allUsers.find(u => u.email === 'test@picojournal.app')?._count.entries || 0}`)
  console.log(`   - Historical entries exist: ${allWeekEntries.length > 0 ? '✅' : '❌'}`)
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
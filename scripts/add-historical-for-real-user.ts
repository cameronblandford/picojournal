import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Adding historical entries for the real user account...\n')

  const realUser = await prisma.user.findUnique({
    where: { email: 'cam.blandford@gmail.com' }
  })

  if (!realUser) {
    console.log('❌ Real user not found')
    return
  }

  console.log(`👤 Real user: ${realUser.email} (${realUser.id})`)

  // Calculate the exact dates we want entries for
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  console.log(`📅 Target dates for real user:`)
  console.log(`   One week ago: ${oneWeekAgo.toISOString().split('T')[0]}`)
  console.log(`   One month ago: ${oneMonthAgo.toISOString().split('T')[0]}`)
  console.log(`   One year ago: ${oneYearAgo.toISOString().split('T')[0]}`)

  const historicalEntries = [
    {
      date: oneWeekAgo,
      content: "A week ago I was working on setting up this journaling app and felt excited about the project."
    },
    {
      date: oneMonthAgo,
      content: "A month ago I was planning several coding projects and feeling motivated about building tools."
    },
    {
      date: oneYearAgo,
      content: "A year ago I was deep into software development and learning new technologies every day."
    }
  ]

  console.log(`\n📝 Creating historical entries for real user...`)

  for (const entry of historicalEntries) {
    try {
      const result = await prisma.entry.upsert({
        where: {
          userId_date: {
            userId: realUser.id,
            date: entry.date
          }
        },
        update: {
          content: entry.content
        },
        create: {
          userId: realUser.id,
          date: entry.date,
          content: entry.content
        }
      })

      console.log(`   ✅ ${entry.date.toISOString().split('T')[0]}: "${entry.content}"`)
    } catch (error) {
      console.log(`   ❌ Failed to create entry for ${entry.date.toISOString().split('T')[0]}: ${error}`)
    }
  }

  // Verify the entries were created
  console.log(`\n🔍 Verifying entries for real user...`)

  const [weekEntry, monthEntry, yearEntry] = await Promise.all([
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: realUser.id,
          date: oneWeekAgo
        }
      }
    }),
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: realUser.id,
          date: oneMonthAgo
        }
      }
    }),
    prisma.entry.findUnique({
      where: {
        userId_date: {
          userId: realUser.id,
          date: oneYearAgo
        }
      }
    })
  ])

  console.log(`   Week ago entry: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago entry: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago entry: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  const totalEntries = await prisma.entry.count({
    where: { userId: realUser.id }
  })

  console.log(`\n🎉 Historical entries added! Real user now has ${totalEntries} total entries.`)
  console.log(`\n💡 Now refresh the app and the historical lookback should work!`)
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
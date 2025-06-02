import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Adding specific historical test entries...\n')

  const testUser = await prisma.user.findUnique({
    where: { email: 'test@picojournal.app' }
  })

  if (!testUser) {
    console.log('❌ Test user not found')
    return
  }

  // Calculate the exact dates we want entries for
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  console.log(`📅 Today: ${today.toISOString().split('T')[0]}`)
  console.log(`📅 Target dates:`)
  console.log(`   One week ago: ${oneWeekAgo.toISOString().split('T')[0]}`)
  console.log(`   One month ago: ${oneMonthAgo.toISOString().split('T')[0]}`)
  console.log(`   One year ago: ${oneYearAgo.toISOString().split('T')[0]}`)

  const historicalEntries = [
    {
      date: oneWeekAgo,
      content: "One week ago: Had a wonderful breakthrough in my creative project that I'm still excited about."
    },
    {
      date: oneMonthAgo,
      content: "One month ago: Started a new morning routine that has been transforming my daily energy levels."
    },
    {
      date: oneYearAgo,
      content: "One year ago: Made a decision that completely changed my perspective on work-life balance."
    }
  ]

  console.log(`\n📝 Creating historical entries...`)

  for (const entry of historicalEntries) {
    try {
      const result = await prisma.entry.upsert({
        where: {
          userId_date: {
            userId: testUser.id,
            date: entry.date
          }
        },
        update: {
          content: entry.content
        },
        create: {
          userId: testUser.id,
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
  console.log(`\n🔍 Verifying entries...`)

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

  console.log(`   Week ago entry: ${weekEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Month ago entry: ${monthEntry ? '✅ Found' : '❌ Not found'}`)
  console.log(`   Year ago entry: ${yearEntry ? '✅ Found' : '❌ Not found'}`)

  console.log(`\n🎉 Historical test entries added successfully!`)
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
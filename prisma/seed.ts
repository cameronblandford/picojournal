import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleEntries = [
  "Had a productive day at work and finished the quarterly report.",
  "Went for a morning run and felt energized throughout the day.",
  "Cooked a new recipe for dinner that turned out surprisingly well.",
  "Spent quality time with family over a board game night.",
  "Discovered a new coffee shop with amazing pastries downtown.",
  "Worked on my side project and made significant progress.",
  "Had a challenging but rewarding conversation with my manager.",
  "Enjoyed a peaceful evening reading my favorite book series.",
  "Attended an inspiring webinar about sustainable living practices.",
  "Tried meditation for the first time and found it relaxing.",
  "Caught up with an old friend over video call.",
  "Completed a difficult workout and felt accomplished afterwards.",
  "Watched an amazing documentary about ocean conservation.",
  "Had a lazy Sunday and enjoyed every minute of it.",
  "Successfully debugged a complex issue that was bothering me.",
  "Visited the local farmers market and bought fresh produce.",
  "Learned a new skill through an online tutorial today.",
  "Had an unexpected but delightful conversation with a neighbor.",
  "Organized my workspace and feel more focused now.",
  "Enjoyed a beautiful sunset during my evening walk.",
  "Tried a new restaurant and was pleasantly surprised.",
  "Completed all my tasks early and had extra free time.",
  "Had a good laugh watching comedy shows with friends.",
  "Made progress on decluttering my living space today.",
  "Received positive feedback on a project I've been working on.",
  "Spent time gardening and planted some new flowers.",
  "Had a meaningful phone call with a family member.",
  "Discovered a new podcast that perfectly matches my interests.",
  "Successfully fixed something that had been broken for weeks.",
  "Enjoyed a quiet morning with coffee and journaling.",
  "Felt grateful for all the small joys in my life.",
  "Overcame a fear and tried something completely new today.",
  "Had an productive brainstorming session for upcoming projects.",
  "Enjoyed cooking a meal from scratch with fresh ingredients.",
  "Took time to appreciate the changing seasons outside.",
  "Had a breakthrough moment while working on a personal goal.",
  "Spent quality time outdoors and felt recharged by nature.",
  "Successfully resolved a misunderstanding with a colleague.",
  "Treated myself to something special as a reward.",
  "Felt proud of maintaining my new healthy habits.",
  "Had an inspiring conversation about future possibilities.",
  "Enjoyed a spontaneous adventure in my own city.",
  "Made someone's day better with a small act of kindness.",
  "Felt content with the progress I've made this month.",
  "Discovered something new about myself through reflection.",
  "Had a day full of small wins that added up.",
  "Enjoyed the simple pleasure of a home-cooked meal.",
  "Felt motivated after setting clear goals for next week.",
  "Had a refreshing break from my usual routine today.",
  "Appreciated having supportive people in my life.",
  "Felt accomplished after tackling a challenging task.",
  "Enjoyed learning something fascinating from a documentary.",
  "Had a moment of clarity about an important decision.",
  "Felt energized after spending time in nature.",
  "Successfully balanced work responsibilities with personal time.",
  "Had a heartwarming exchange with a stranger today.",
  "Felt grateful for the opportunity to help someone else.",
  "Enjoyed a perfect cup of coffee while watching the sunrise.",
  "Made progress on a creative project that brings me joy.",
  "Had a restful night's sleep and woke up refreshed.",
  "Felt proud of standing up for something I believe in.",
  "Enjoyed quality time without any digital distractions.",
  "Had a breakthrough in understanding a complex concept.",
  "Felt inspired by someone else's story of perseverance.",
  "Successfully navigated a challenging social situation.",
  "Enjoyed experimenting with a new hobby or skill.",
  "Had a day where everything seemed to go smoothly.",
  "Felt thankful for the lessons learned from recent challenges.",
  "Enjoyed reconnecting with an activity I used to love.",
  "Had a moment of pure joy from something unexpected.",
  "Felt accomplished after organizing an important area of my life.",
  "Enjoyed the satisfaction of completing a long-term project.",
  "Had a meaningful conversation about shared values.",
  "Felt energized by making positive changes to my routine.",
  "Enjoyed the perfect weather for outdoor activities.",
  "Had a realization that shifted my perspective positively.",
  "Felt proud of maintaining consistency with my goals.",
  "Enjoyed discovering a hidden gem in my neighborhood.",
  "Had a day filled with laughter and good company.",
  "Felt motivated by progress toward an important milestone.",
  "Enjoyed the peaceful satisfaction of a job well done.",
  "Had an enlightening experience that broadened my worldview.",
  "Felt grateful for the simple comforts of home.",
  "Enjoyed trying something outside my usual comfort zone.",
  "Had a productive planning session for upcoming adventures.",
  "Felt content with how I spent my time today.",
  "Enjoyed the meditative quality of a repetitive task.",
  "Had a serendipitous encounter that brightened my day.",
  "Felt proud of how I handled a difficult situation.",
  "Enjoyed the anticipation of something exciting coming up.",
  "Had a day that reminded me why I love what I do.",
  "Felt recharged after taking time for self-care.",
  "Enjoyed sharing knowledge with someone eager to learn.",
  "Had a moment of appreciation for how far I've come.",
  "Felt inspired to pursue a new direction or opportunity.",
  "Enjoyed the simple pleasure of a good conversation.",
  "Had a day that felt perfectly balanced and fulfilling.",
  "Felt grateful for the unexpected kindness of others.",
  "Enjoyed making progress on decluttering my digital life.",
  "Had a realization about what truly matters to me.",
  "Felt energized by connecting with like-minded people.",
  "Enjoyed the satisfaction of solving a puzzling problem.",
  "Had a day where I felt fully present and engaged.",
  "Felt proud of maintaining patience during a stressful time.",
  "Enjoyed discovering new music that resonates with me.",
  "Had a meaningful exchange that deepened a relationship.",
  "Felt motivated by seeing positive changes in my habits.",
  "Enjoyed the perfect balance of productivity and relaxation.",
  "Had a moment of clarity about my priorities and values.",
  "Felt thankful for the opportunity to learn from mistakes.",
  "Enjoyed exploring a new part of town I'd never visited.",
  "Had a day where small gestures made a big difference.",
  "Felt accomplished after completing a challenging workout routine.",
  "Enjoyed the meditative experience of cooking without rushing.",
  "Had an unexpected conversation that provided valuable insight.",
  "Felt grateful for technology that connects me with loved ones.",
  "Enjoyed the satisfaction of giving back to my community.",
  "Had a day where I felt truly aligned with my values.",
  "Felt energized by making progress on personal development goals.",
  "Enjoyed the simple pleasure of watching clouds drift by.",
  "Had a breakthrough moment in understanding someone else's perspective.",
  "Felt proud of maintaining my commitment to healthy boundaries.",
  "Enjoyed discovering a new author whose writing speaks to me.",
  "Had a day filled with small acts of creativity and expression.",
  "Felt content with the natural rhythm of work and rest.",
  "Enjoyed the anticipation of reuniting with someone special.",
  "Had a moment of pure appreciation for the beauty around me.",
  "Felt motivated by progress toward a meaningful long-term goal.",
  "Enjoyed the satisfaction of organizing thoughts through writing.",
  "Had a day where I felt deeply connected to my purpose."
]

function getRandomEntry(): string {
  return sampleEntries[Math.floor(Math.random() * sampleEntries.length)]
}

function getRandomDateInPast(daysBack: number): Date {
  const today = new Date()
  const randomDays = Math.floor(Math.random() * daysBack)
  const date = new Date(today)
  date.setDate(date.getDate() - randomDays)
  // Reset time to start of day to match our date-only storage
  date.setHours(0, 0, 0, 0)
  return date
}

async function main() {
  console.log('🌱 Starting seed...')

  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@picojournal.app' },
    update: {},
    create: {
      email: 'test@picojournal.app',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  console.log(`✅ Created test user: ${testUser.email}`)

  // Generate entries for the past 2 years (730 days)
  const numberOfEntries = 300 // Entries spread across past year+
  const maxDaysBack = 400 // Go back up to 400 days
  
  const entries = []
  const usedDates = new Set<string>()

  for (let i = 0; i < numberOfEntries; i++) {
    let date: Date
    let dateString: string
    
    // Ensure we don't create duplicate entries for the same date
    do {
      date = getRandomDateInPast(maxDaysBack)
      dateString = date.toISOString().split('T')[0]
    } while (usedDates.has(dateString))
    
    usedDates.add(dateString)
    
    entries.push({
      userId: testUser.id,
      content: getRandomEntry(),
      date: date,
    })
  }

  // Add specific historical entries to ensure lookback feature works
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  // Add these specific dates if they don't already exist
  const historicalDates = [
    { date: oneWeekAgo, content: "Exactly one week ago I had a breakthrough moment in my creative work." },
    { date: oneMonthAgo, content: "One month ago today I started a new habit that has been incredibly rewarding." },
    { date: oneYearAgo, content: "A year ago I made a decision that completely changed my perspective on life." }
  ]

  for (const historical of historicalDates) {
    const dateString = historical.date.toISOString().split('T')[0]
    if (!usedDates.has(dateString)) {
      entries.push({
        userId: testUser.id,
        content: historical.content,
        date: historical.date
      })
      usedDates.add(dateString)
    }
  }

  // Sort entries by date (oldest first) for better insertion
  entries.sort((a, b) => a.date.getTime() - b.date.getTime())

  console.log(`📝 Creating ${entries.length} journal entries (including guaranteed historical entries)...`)

  // Insert entries in batches for better performance
  const batchSize = 50
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    await prisma.entry.createMany({
      data: batch,
      skipDuplicates: true, // Skip any entries that would violate the unique constraint
    })
    console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}`)
  }

  // Get some stats
  const totalEntries = await prisma.entry.count({
    where: { userId: testUser.id }
  })

  const oldestEntry = await prisma.entry.findFirst({
    where: { userId: testUser.id },
    orderBy: { date: 'asc' }
  })

  const newestEntry = await prisma.entry.findFirst({
    where: { userId: testUser.id },
    orderBy: { date: 'desc' }
  })

  console.log(`\n📊 Seed completed successfully!`)
  console.log(`   Total entries created: ${totalEntries}`)
  console.log(`   Date range: ${oldestEntry?.date.toISOString().split('T')[0]} to ${newestEntry?.date.toISOString().split('T')[0]}`)
  console.log(`\n🔑 Test user credentials:`)
  console.log(`   Email: test@picojournal.app`)
  console.log(`   Password: testpassword123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
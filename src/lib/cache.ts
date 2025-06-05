import { unstable_cache } from 'next/cache'

export const getCachedEntries = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('./prisma')
    return prisma.entry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50
    })
  },
  ['user-entries'],
  {
    revalidate: 300, // 5 minutes
    tags: ['entries']
  }
)

export const getCachedEntryByDate = unstable_cache(
  async (userId: string, date: Date) => {
    const { prisma } = await import('./prisma')
    return prisma.entry.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    })
  },
  ['user-entry-by-date'],
  {
    revalidate: 300, // 5 minutes
    tags: ['entries']
  }
)

export const getCachedHistoricalEntries = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('./prisma')
    
    const today = new Date()
    const oneWeekAgoStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const oneMonthAgoDate = new Date(today)
    oneMonthAgoDate.setMonth(today.getMonth() - 1)
    const oneMonthAgoStr = oneMonthAgoDate.toISOString().split('T')[0]
    const oneYearAgoDate = new Date(today)
    oneYearAgoDate.setFullYear(today.getFullYear() - 1)
    const oneYearAgoStr = oneYearAgoDate.toISOString().split('T')[0]

    const oneWeekAgo = new Date(oneWeekAgoStr + 'T00:00:00.000Z')
    const oneMonthAgo = new Date(oneMonthAgoStr + 'T00:00:00.000Z')
    const oneYearAgo = new Date(oneYearAgoStr + 'T00:00:00.000Z')

    const [weekEntry, monthEntry, yearEntry] = await Promise.all([
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId,
            date: oneWeekAgo
          }
        }
      }),
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId,
            date: oneMonthAgo
          }
        }
      }),
      prisma.entry.findUnique({
        where: {
          userId_date: {
            userId,
            date: oneYearAgo
          }
        }
      })
    ])

    return {
      oneWeekAgo: weekEntry,
      oneMonthAgo: monthEntry,
      oneYearAgo: yearEntry
    }
  },
  ['historical-entries'],
  {
    revalidate: 3600, // 1 hour
    tags: ['entries']
  }
)

export const invalidateEntriesCache = () => {
  return fetch('/api/revalidate?tag=entries', { method: 'POST' })
}
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Entry {
  id: string
  content: string
  date: string
  createdAt: string
}

interface HistoricalEntry {
  id: string
  content: string
  date: string
}

interface HistoricalEntriesData {
  oneWeekAgo: HistoricalEntry | null
  oneMonthAgo: HistoricalEntry | null
  oneYearAgo: HistoricalEntry | null
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchEntries()
    }
  }, [session])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  return { entries, loading, refetch: fetchEntries }
}

export function useHistoricalEntries() {
  const [historicalEntries, setHistoricalEntries] = useState<HistoricalEntriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchHistoricalEntries()
    }
  }, [session])

  const fetchHistoricalEntries = async () => {
    try {
      const response = await fetch('/api/entries/historical')
      if (response.ok) {
        const data = await response.json()
        setHistoricalEntries(data)
      }
    } catch (error) {
      console.error('Error fetching historical entries:', error)
    } finally {
      setLoading(false)
    }
  }

  return { historicalEntries, loading, refetch: fetchHistoricalEntries }
}

export function useTodayEntry() {
  const [todayEntry, setTodayEntry] = useState('')
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchTodayEntry()
    }
  }, [session])

  const fetchTodayEntry = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/entries?date=${today}`)
      if (response.ok) {
        const data = await response.json()
        setTodayEntry(data.entry?.content || '')
      }
    } catch (error) {
      console.error("Error fetching today's entry:", error)
    } finally {
      setLoading(false)
    }
  }

  return { todayEntry, setTodayEntry, loading, refetch: fetchTodayEntry }
}
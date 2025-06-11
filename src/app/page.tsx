"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import JournalEntry from "@/components/JournalEntry"
import HistoricalEntries from "@/components/HistoricalEntries"
import RecentEntries from "@/components/RecentEntries"
import AliveButton from "@/components/AliveButton"
import EmotionalTodoApp from "@/components/EmotionalTodoApp"
import { useTodayEntry } from "@/hooks/useEntries"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { todayEntry, setTodayEntry, loading } = useTodayEntry()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  const handleSaveEntry = (content: string) => {
    setTodayEntry(content)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">PicoJournal</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Today - {todayFormatted}
                </h2>
                <JournalEntry
                  initialContent={todayEntry}
                  date={today}
                  onSave={handleSaveEntry}
                />
                
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or simply</span>
                  </div>
                </div>
                
                <AliveButton date={today} />
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <HistoricalEntries />
              </div>
            </div>

            <EmotionalTodoApp />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <RecentEntries />
          </div>
        </div>
      </main>
    </div>
  )
}
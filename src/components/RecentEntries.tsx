"use client"

import { memo } from "react"
import { useEntries } from "@/hooks/useEntries"

const RecentEntries = memo(function RecentEntries() {
  const { entries, loading } = useEntries()

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent entries</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No entries yet. Start by writing about today!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent entries</h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="text-gray-900 mb-2">{entry.content}</p>
            <p className="text-sm text-gray-500">
              {formatDate(entry.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

export default RecentEntries
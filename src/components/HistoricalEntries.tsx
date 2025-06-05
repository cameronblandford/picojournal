"use client"

import { memo } from "react"
import { useHistoricalEntries } from "@/hooks/useEntries"

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

const HistoricalEntries = memo(function HistoricalEntries() {
  const { historicalEntries, loading } = useHistoricalEntries()

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Looking back...</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const hasAnyEntries = historicalEntries?.oneWeekAgo || historicalEntries?.oneMonthAgo || historicalEntries?.oneYearAgo

  if (!hasAnyEntries) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No historical entries to show yet. Keep journaling!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Looking back...</h3>
      
      {historicalEntries?.oneWeekAgo && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">One week ago</h4>
          <p className="text-gray-700 mb-1">{historicalEntries.oneWeekAgo.content}</p>
          <p className="text-sm text-blue-600">
            {formatDate(historicalEntries.oneWeekAgo.date)}
          </p>
        </div>
      )}

      {historicalEntries?.oneMonthAgo && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">One month ago</h4>
          <p className="text-gray-700 mb-1">{historicalEntries.oneMonthAgo.content}</p>
          <p className="text-sm text-green-600">
            {formatDate(historicalEntries.oneMonthAgo.date)}
          </p>
        </div>
      )}

      {historicalEntries?.oneYearAgo && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">One year ago</h4>
          <p className="text-gray-700 mb-1">{historicalEntries.oneYearAgo.content}</p>
          <p className="text-sm text-purple-600">
            {formatDate(historicalEntries.oneYearAgo.date)}
          </p>
        </div>
      )}
    </div>
  )
})

export default HistoricalEntries
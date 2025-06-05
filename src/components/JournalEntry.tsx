"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { useSession } from "next-auth/react"

interface JournalEntryProps {
  initialContent?: string
  date: string
  onSave?: (content: string) => void
}

const JournalEntry = memo(function JournalEntry({ initialContent = "", date, onSave }: JournalEntryProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSave = useCallback(async () => {
    if (!session || !content.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          date,
        }),
      })

      if (response.ok) {
        setLastSaved(new Date())
        onSave?.(content.trim())
      }
    } catch (error) {
      console.error("Error saving entry:", error)
    } finally {
      setIsSaving(false)
    }
  }, [session, content, date, onSave])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 mb-2">
          How was your day? (One sentence)
        </label>
        <textarea
          id="journal-entry"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write one sentence about your day..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows={3}
          maxLength={280}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {content.length}/280 characters
          </span>
          {lastSaved && (
            <span className="text-sm text-green-600">
              Saved at {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={isSaving || !content.trim()}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? "Saving..." : "Save Entry"}
      </button>
      
      <p className="text-sm text-gray-500 text-center">
        Press Cmd/Ctrl + Enter to save quickly
      </p>
    </div>
  )
})

export default JournalEntry
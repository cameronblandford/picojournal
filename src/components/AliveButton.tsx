"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface AliveButtonProps {
  date: string
}

export default function AliveButton({ date }: AliveButtonProps) {
  const [hasChecked, setHasChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const fetchAliveStatus = async () => {
      try {
        const response = await fetch(`/api/alive?date=${date}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Alive status for date", date, ":", data.hasChecked)
          setHasChecked(data.hasChecked)
        }
      } catch (error) {
        console.error("Error fetching alive status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAliveStatus()
  }, [session, date])

  const handleAliveCheck = async () => {
    if (!session || hasChecked) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/alive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      })

      if (response.ok) {
        setHasChecked(true)
      }
    } catch (error) {
      console.error("Error marking alive:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <button disabled className="w-full bg-gray-100 text-gray-400 py-4 px-6 rounded-md cursor-not-allowed">
        Loading...
      </button>
    )
  }

  return (
    <button
      onClick={handleAliveCheck}
      disabled={hasChecked || isSaving}
      className={`w-full py-4 px-6 rounded-md font-medium transition-all ${
        hasChecked
          ? "bg-green-100 text-green-700 cursor-not-allowed"
          : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
      } disabled:opacity-75`}
    >
      {hasChecked ? "✓ Alive Today" : isSaving ? "Marking..." : "Alive"}
    </button>
  )
}
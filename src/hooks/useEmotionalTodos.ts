import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

interface EmotionalTodo {
  id: string
  task: string
  benefit: string
  blocker: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export function useEmotionalTodos() {
  const [todos, setTodos] = useState<EmotionalTodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchTodos = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch("/api/emotional-todos")
      if (!response.ok) throw new Error("Failed to fetch todos")
      
      const data = await response.json()
      setTodos(data.todos)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos")
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = async (todo: { task: string; benefit: string; blocker: string }) => {
    try {
      const response = await fetch("/api/emotional-todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo)
      })

      if (!response.ok) throw new Error("Failed to add todo")
      
      const data = await response.json()
      setTodos(prev => [data.todo, ...prev])
      return data.todo
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo")
      throw err
    }
  }

  const updateTodo = async (id: string, updates: Partial<EmotionalTodo>) => {
    try {
      const response = await fetch("/api/emotional-todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) throw new Error("Failed to update todo")
      
      const data = await response.json()
      setTodos(prev => prev.map(todo => 
        todo.id === id ? data.todo : todo
      ))
      return data.todo
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo")
      throw err
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/emotional-todos?id=${id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete todo")
      
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo")
      throw err
    }
  }

  const toggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    
    return updateTodo(id, { completed: !todo.completed })
  }

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    refetch: fetchTodos
  }
}
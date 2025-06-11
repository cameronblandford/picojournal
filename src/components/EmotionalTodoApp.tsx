"use client"

import React, { useState } from 'react'
import { Plus, Check, X, Edit2 } from 'lucide-react'
import { useEmotionalTodos } from '@/hooks/useEmotionalTodos'

export default function EmotionalTodoApp() {
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete
  } = useEmotionalTodos()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [newTask, setNewTask] = useState({
    task: '',
    benefit: '',
    blocker: ''
  })

  const handleAddTask = async () => {
    if (newTask.task.trim() && newTask.benefit.trim() && newTask.blocker.trim()) {
      setIsSaving(true)
      try {
        await addTodo(newTask)
        setNewTask({ task: '', benefit: '', blocker: '' })
        setIsAdding(false)
      } catch (error) {
        console.error('Error adding task:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleToggleComplete = async (id: string) => {
    try {
      await toggleComplete(id)
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTodo(id)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const startEdit = (todo: { id: string; task: string; benefit: string; blocker: string }) => {
    setEditingId(todo.id)
    setNewTask({
      task: todo.task,
      benefit: todo.benefit,
      blocker: todo.blocker
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    
    setIsSaving(true)
    try {
      await updateTodo(editingId, newTask)
      setEditingId(null)
      setNewTask({ task: '', benefit: '', blocker: '' })
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewTask({ task: '', benefit: '', blocker: '' })
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <p className="text-red-600 text-center">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Emotional Todo List
      </h1>

      {/* Add Task Form */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task (e.g., 'finish report')"
              value={newTask.task}
              onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
            <input
              type="text"
              placeholder="Emotional benefit (e.g., 'relief', 'pride')"
              value={newTask.benefit}
              onChange={(e) => setNewTask({ ...newTask, benefit: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSaving}
            />
            <input
              type="text"
              placeholder="Emotional blocker (e.g., 'fear', 'overwhelm')"
              value={newTask.blocker}
              onChange={(e) => setNewTask({ ...newTask, blocker: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isSaving}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={editingId ? saveEdit : handleAddTask}
              disabled={isSaving}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingId ? 'Save' : 'Add Task'}
            </button>
            <button
              onClick={editingId ? cancelEdit : () => setIsAdding(false)}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Task
        </button>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {todos.map(todo => (
          <div key={todo.id} className={`p-3 rounded-lg border-2 transition-all ${
            todo.completed 
              ? 'bg-green-50 border-green-200 opacity-75' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggleComplete(todo.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {todo.completed && <Check size={12} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-gray-800 ${todo.completed ? 'line-through' : ''}`}>
                  {todo.task}
                </div>
                <div className="flex gap-4 mt-1 text-xs">
                  <span className="text-green-600">
                    ✨ {todo.benefit}
                  </span>
                  <span className="text-red-500">
                    🚧 {todo.blocker}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(todo)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteTask(todo.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {todos.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No tasks yet!</p>
            <p className="text-sm">Add a task to get started with emotional awareness.</p>
          </div>
        )}
      </div>
    </div>
  )
}
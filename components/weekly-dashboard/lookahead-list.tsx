"use client"

import { useState, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

export interface LookaheadItem {
  id: string
  item_text: string
  item_order: number
}

interface LookaheadListProps {
  items: LookaheadItem[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
  placeholder?: string
}

export function LookaheadList({ items, onAdd, onUpdate, onDelete, placeholder = "Add item..." }: LookaheadListProps) {
  const [newItemText, setNewItemText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const handleAdd = () => {
    if (newItemText.trim()) {
      onAdd(newItemText.trim())
      setNewItemText("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id)
    setEditText(currentText)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onUpdate(editingId, editText.trim())
    }
    setEditingId(null)
    setEditText("")
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit()
    } else if (e.key === "Escape") {
      setEditingId(null)
      setEditText("")
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
          {editingId === item.id ? (
            <Input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={saveEdit}
              className="flex-1 h-7 text-sm"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm cursor-pointer"
              onClick={() => startEdit(item.id, item.item_text)}
            >
              {item.item_text}
            </span>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded cursor-pointer"
            aria-label="Delete item"
          >
            <X className="w-3 h-3 text-destructive" />
          </button>
        </div>
      ))}

      {/* Inline add input */}
      <div className="flex items-center gap-2 p-2">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <Input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="inline-add-input flex-1 h-7 text-sm border-0 bg-transparent focus-visible:ring-1"
        />
      </div>
    </div>
  )
}

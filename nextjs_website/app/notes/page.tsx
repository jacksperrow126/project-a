'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getNotes, createNote, deleteNote, type Note } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons } from '@/lib/icons'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: 'Common' as Note['tag'],
    remark: false
  })

  const tags: Note['tag'][] = ['Common', 'Drink', 'Friends', 'Study', 'Work', 'Life', 'Entertainment', 'Family', 'Health']

  useEffect(() => {
    loadNotes()
  }, [selectedTag])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await getNotes(selectedTag || undefined)
      setNotes(data)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) {
      alert('Please enter note content')
      return
    }

    try {
      await createNote(formData)
      setFormData({ title: '', content: '', tag: 'Common', remark: false })
      setShowAddForm(false)
      loadNotes()
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('Failed to create note. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id)
        loadNotes()
      } catch (error) {
        console.error('Failed to delete note:', error)
        alert('Failed to delete note. Please try again.')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <header className="w-full px-4 sm:px-6 py-6 border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white text-xl sm:text-2xl font-bold">VL</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-indigo-700 group-hover:to-purple-800 transition-all duration-300">
              Valy Life
            </span>
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Notes</h1>
          <p className="text-sm sm:text-base text-gray-600">Capture your thoughts and ideas</p>
        </div>

        {/* Filter Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              selectedTag === ''
                ? 'bg-purple-600 text-white'
                : 'bg-white/60 text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/60 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
            size="md"
          >
            {showAddForm ? '− Cancel' : '+ Add Note'}
          </Button>
        </div>

        {showAddForm && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Add New Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Title (Optional)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title"
                icon={<span>📌</span>}
              />
              <Textarea
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Write your note here..."
                required
                icon={<FontAwesomeIcon icon={icons.stickyNote} className="text-gray-400" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value as Note['tag'] })}
                  options={tags.map(tag => ({ value: tag, label: tag }))}
                  icon={<FontAwesomeIcon icon={icons.tag} className="text-gray-400" />}
                />
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as remarkable ⭐</span>
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Create Note
              </Button>
            </form>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={icons.stickyNote} className="text-3xl text-gray-600" />
            </div>
            <p className="text-gray-600 text-lg">No notes yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first note to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`bg-white/60 backdrop-blur-sm rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${
                  note.remark ? 'border-yellow-300 bg-yellow-50/60' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {note.title || 'Không Đề'}
                      {note.remark && <span className="ml-2 text-yellow-600">⭐</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{formatDate(note.date)}</p>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                      {note.tag}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-2"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


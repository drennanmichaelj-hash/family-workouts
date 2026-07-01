import { useState } from 'react'
import { EXERCISES, EXERCISE_CATEGORIES } from '../data/exercises'

export default function ExerciseSelector({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...EXERCISE_CATEGORIES]

  const filtered = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscles.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Exercise</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        {/* Category pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto overflow-y-hidden" style={{ WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-1">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No exercises found</p>
          )}
          {filtered.map((ex, i) => (
            <button
              key={i}
              onClick={() => onSelect(ex)}
              className="w-full text-left px-3 py-3 rounded-xl hover:bg-indigo-50 active:bg-indigo-100 flex items-center justify-between group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                <p className="text-xs text-gray-400">{ex.muscles}</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600">
                {ex.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

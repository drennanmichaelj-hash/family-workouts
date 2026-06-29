import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { MOODS } from '../data/exercises'
import ExerciseSelector from './ExerciseSelector'

const TEMPLATES = [
  {
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Overhead Press', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Dumbbell Lateral Raise', category: 'Dumbbell', sets: [{ reps: 12, weight: '' }, { reps: 12, weight: '' }, { reps: 12, weight: '' }] },
      { name: 'Cable Tricep Pushdown', category: 'Cable', sets: [{ reps: 12, weight: '' }, { reps: 12, weight: '' }, { reps: 12, weight: '' }] },
    ]
  },
  {
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', category: 'Barbell', sets: [{ reps: 5, weight: '' }, { reps: 5, weight: '' }, { reps: 5, weight: '' }] },
      { name: 'Barbell Row', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Lat Pulldown', category: 'Machine', sets: [{ reps: 10, weight: '' }, { reps: 10, weight: '' }, { reps: 10, weight: '' }] },
      { name: 'Dumbbell Curl', category: 'Dumbbell', sets: [{ reps: 12, weight: '' }, { reps: 12, weight: '' }, { reps: 12, weight: '' }] },
    ]
  },
  {
    name: 'Leg Day',
    exercises: [
      { name: 'Back Squat', category: 'Barbell', sets: [{ reps: 5, weight: '' }, { reps: 5, weight: '' }, { reps: 5, weight: '' }] },
      { name: 'Romanian Deadlift', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Leg Press', category: 'Machine', sets: [{ reps: 10, weight: '' }, { reps: 10, weight: '' }, { reps: 10, weight: '' }] },
      { name: 'Leg Curl', category: 'Machine', sets: [{ reps: 12, weight: '' }, { reps: 12, weight: '' }, { reps: 12, weight: '' }] },
    ]
  },
  {
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Barbell Row', category: 'Barbell', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }] },
      { name: 'Overhead Press', category: 'Barbell', sets: [{ reps: 10, weight: '' }, { reps: 10, weight: '' }] },
      { name: 'Pull-up', category: 'Bodyweight', sets: [{ reps: 8, weight: '' }, { reps: 8, weight: '' }] },
    ]
  },
  {
    name: 'Full Body',
    exercises: [
      { name: 'Back Squat', category: 'Barbell', sets: [{ reps: 5, weight: '' }, { reps: 5, weight: '' }, { reps: 5, weight: '' }] },
      { name: 'Bench Press', category: 'Barbell', sets: [{ reps: 5, weight: '' }, { reps: 5, weight: '' }, { reps: 5, weight: '' }] },
      { name: 'Barbell Row', category: 'Barbell', sets: [{ reps: 5, weight: '' }, { reps: 5, weight: '' }, { reps: 5, weight: '' }] },
    ]
  },
]

function newSet(isCardio = false) {
  return isCardio ? { time: '', distance: '' } : { reps: '', weight: '' }
}

export default function LogWorkout({ currentUser, onSave, prefill }) {
  const [title, setTitle] = useState(prefill?.title || '')
  const [duration, setDuration] = useState(prefill?.duration || '')
  const [mood, setMood] = useState(prefill ? { emoji: prefill.mood_emoji, label: prefill.mood } : null)
  const [notes, setNotes] = useState(prefill?.notes || '')
  const [exercises, setExercises] = useState(
    prefill?.exercises?.map(ex => ({ ...ex, sets: ex.sets?.map(s => ({ ...s })) || [newSet()] })) || []
  )
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(exercises.length === 0)

  const isCardio = (ex) => ex.category === 'Cardio'

  function loadTemplate(template) {
    setTitle(template.name)
    setExercises(template.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s }))
    })))
    setShowTemplates(false)
  }

  function addExercise(ex) {
    setExercises(prev => [...prev, { ...ex, sets: [newSet(isCardio(ex))] }])
    setShowExerciseSelector(false)
  }

  function removeExercise(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  function addSet(exIdx) {
    setExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, sets: [...ex.sets, newSet(isCardio(ex))] } : ex
    ))
  }

  function removeSet(exIdx, setIdx) {
    setExercises(prev => prev.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) } : ex
    ))
  }

  function updateSet(exIdx, setIdx, field, value) {
    setExercises(prev => prev.map((ex, i) =>
      i === exIdx
        ? { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
        : ex
    ))
  }

  async function handleSave() {
    if (exercises.length === 0) return
    setSaving(true)

    try {
      const workoutData = {
        user_id: currentUser.userId,
        nickname: currentUser.nickname,
        title: title || `${currentUser.nickname}'s Workout`,
        duration: duration ? parseInt(duration) : null,
        mood: mood?.label || null,
        mood_emoji: mood?.emoji || null,
        notes: notes || null,
        exercises,
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single()

      if (error) throw error
      onSave(data)
    } catch (err) {
      console.error(err)
      alert('Error saving workout. Check your connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      {/* Templates */}
      {showTemplates && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-500 mb-2 px-1">Start from a template</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => loadTemplate(t)}
                className="flex-shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-2 text-sm font-medium active:bg-indigo-100"
              >
                {t.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTemplates(false)}
            className="text-xs text-gray-400 mt-1"
          >
            Skip template →
          </button>
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        placeholder="Workout name (e.g. Push Day)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
      />

      {/* Duration + Mood row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="Duration"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
        </div>
        <div className="flex gap-1">
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setMood(mood?.label === m.label ? null : m)}
              className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center border transition-all ${
                mood?.label === m.label
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 bg-white'
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-none"
      />

      {/* Exercises */}
      <div className="space-y-3 mb-4">
        {exercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{ex.name}</p>
                <p className="text-xs text-gray-400">{ex.category}</p>
              </div>
              <button
                onClick={() => removeExercise(exIdx)}
                className="text-gray-300 text-xl leading-none hover:text-red-400"
              >
                &times;
              </button>
            </div>

            {/* Set headers */}
            <div className="grid grid-cols-3 text-xs text-gray-400 font-medium mb-1 px-1">
              <span>Set</span>
              {isCardio(ex) ? (
                <>
                  <span>Time (min)</span>
                  <span>Distance (mi)</span>
                </>
              ) : (
                <>
                  <span>Reps</span>
                  <span>Weight (lbs)</span>
                </>
              )}
            </div>

            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="grid grid-cols-3 gap-2 mb-1 items-center">
                <span className="text-xs text-gray-500 font-medium px-1">{setIdx + 1}</span>
                {isCardio(ex) ? (
                  <>
                    <input
                      type="number"
                      placeholder="—"
                      value={set.time}
                      onChange={e => updateSet(exIdx, setIdx, 'time', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="—"
                        value={set.distance}
                        onChange={e => updateSet(exIdx, setIdx, 'distance', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white flex-1"
                      />
                      {ex.sets.length > 1 && (
                        <button onClick={() => removeSet(exIdx, setIdx)} className="text-gray-300 text-base hover:text-red-400">×</button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      placeholder="—"
                      value={set.reps}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="—"
                        value={set.weight}
                        onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white flex-1"
                      />
                      {ex.sets.length > 1 && (
                        <button onClick={() => removeSet(exIdx, setIdx)} className="text-gray-300 text-base hover:text-red-400">×</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            <button
              onClick={() => addSet(exIdx)}
              className="text-xs text-indigo-600 font-medium mt-1 px-1"
            >
              + Add set
            </button>
          </div>
        ))}
      </div>

      {/* Add exercise button */}
      <button
        onClick={() => setShowExerciseSelector(true)}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all mb-4"
      >
        + Add Exercise
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={exercises.length === 0 || saving}
        className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold text-base disabled:opacity-40 active:bg-indigo-700"
      >
        {saving ? 'Saving...' : '💪 Share Workout'}
      </button>

      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={addExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  )
}

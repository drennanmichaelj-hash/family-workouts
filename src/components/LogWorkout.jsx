import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { MOODS } from '../data/exercises'
import ExerciseSelector from './ExerciseSelector'

function blankExercise(ex) {
  const cardio = ex.category === 'Cardio'
  return { ...ex, numSets: '', reps: '', weight: '', time: '', distance: '' }
}

export default function LogWorkout({ currentUser, onSave, prefill }) {
  const [title, setTitle] = useState(prefill?.title || '')
  const [duration, setDuration] = useState(prefill?.duration || '')
  const [mood, setMood] = useState(prefill ? { emoji: prefill.mood_emoji, label: prefill.mood } : null)
  const [notes, setNotes] = useState(prefill?.notes || '')
  const [exercises, setExercises] = useState(
    prefill?.exercises?.map(ex => ({
      name: ex.name,
      category: ex.category,
      numSets: ex.numSets || '',
      reps: ex.reps || '',
      weight: ex.weight || '',
      time: ex.time || '',
      distance: ex.distance || '',
    })) || []
  )
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [saving, setSaving] = useState(false)

  const isCardio = (ex) => ex.category === 'Cardio'

  // Can save if there are exercises OR notes
  const canSave = exercises.length > 0 || notes.trim().length > 0

  function addExercise(ex) {
    setExercises(prev => [...prev, blankExercise(ex)])
    setShowExerciseSelector(false)
  }

  function removeExercise(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateExercise(i, field, value) {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  async function handleSave() {
    if (!canSave || saving) return
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
      {/* Title */}
      <input
        type="text"
        placeholder="Workout name (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
      />

      {/* Duration + Mood */}
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
        placeholder="Notes — describe your workout, how you felt, anything. Exercises below are optional."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-none"
      />

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-2 mb-3">
          {exercises.map((ex, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{ex.name}</p>
                  <p className="text-xs text-gray-400">{ex.category}</p>
                </div>
                <button
                  onClick={() => removeExercise(i)}
                  className="text-gray-300 text-xl leading-none hover:text-red-400 px-1"
                >
                  &times;
                </button>
              </div>

              {isCardio(ex) ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={ex.time}
                      onChange={e => updateExercise(i, 'time', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-xs text-gray-400">min</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={ex.distance}
                      onChange={e => updateExercise(i, 'distance', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-xs text-gray-400">miles</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={ex.numSets}
                      onChange={e => updateExercise(i, 'numSets', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-xs text-gray-400">sets</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={ex.reps}
                      onChange={e => updateExercise(i, 'reps', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-xs text-gray-400">reps</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="—"
                      value={ex.weight}
                      onChange={e => updateExercise(i, 'weight', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-xs text-gray-400">lbs</span>
                  </div>
                </div>
              )}
              <div className="mt-5" />
            </div>
          ))}
        </div>
      )}

      {/* Add exercise button */}
      <button
        onClick={() => setShowExerciseSelector(true)}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all mb-4"
      >
        + Add Exercise (optional)
      </button>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave || saving}
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

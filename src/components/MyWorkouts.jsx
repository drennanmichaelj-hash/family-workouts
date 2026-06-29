import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import WorkoutCard from './WorkoutCard'

export default function MyWorkouts({ currentUser, onRedo }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyWorkouts() {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, likes(*), comments(*)')
        .eq('user_id', currentUser.userId)
        .order('created_at', { ascending: false })

      if (!error && data) setWorkouts(data)
      setLoading(false)
    }
    fetchMyWorkouts()
  }, [currentUser.userId])

  async function handleDelete(workoutId) {
    if (!confirm('Delete this workout?')) return
    await supabase.from('workouts').delete().eq('id', workoutId)
    setWorkouts(prev => prev.filter(w => w.id !== workoutId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <p className="text-sm">Loading your workouts...</p>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
        <div className="text-5xl mb-4">📋</div>
        <p className="font-semibold text-gray-600 text-lg">No workouts logged yet</p>
        <p className="text-sm mt-1">Log your first workout to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {workouts.map(workout => (
        <div key={workout.id} className="relative">
          <WorkoutCard
            workout={workout}
            currentUser={currentUser}
            onCopy={null}
          />
          <div className="flex gap-2 mt-1 px-1">
            <button
              onClick={() => onRedo(workout)}
              className="text-xs text-indigo-600 font-medium"
            >
              ↻ Do again
            </button>
            <button
              onClick={() => handleDelete(workout.id)}
              className="text-xs text-red-400 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

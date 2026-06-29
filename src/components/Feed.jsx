import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import WorkoutCard from './WorkoutCard'

export default function Feed({ currentUser, onCopyWorkout }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchWorkouts() {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        likes (*),
        comments (*)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setWorkouts(data)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchWorkouts()

    // Real-time subscription for new workouts
    const channel = supabase
      .channel('workouts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workouts' }, () => {
        fetchWorkouts()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchWorkouts()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-4xl mb-3 animate-pulse">💪</div>
        <p className="text-sm">Loading workouts...</p>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
        <div className="text-5xl mb-4">🏋️</div>
        <p className="font-semibold text-gray-600 text-lg">No workouts yet</p>
        <p className="text-sm mt-1">Log your first workout and share it with the family!</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="w-full text-xs text-indigo-500 py-1 mb-3 disabled:opacity-50"
      >
        {refreshing ? 'Refreshing...' : '↻ Refresh feed'}
      </button>

      <div className="space-y-4">
        {workouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            currentUser={currentUser}
            onCopy={workout.user_id !== currentUser.userId ? onCopyWorkout : null}
          />
        ))}
      </div>
    </div>
  )
}

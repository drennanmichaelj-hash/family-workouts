import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function NicknameSetup({ onComplete }) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = nickname.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      // Generate a simple unique ID for this device
      const userId = crypto.randomUUID()

      const { error: dbError } = await supabase
        .from('profiles')
        .insert({ id: userId, nickname: trimmed })

      if (dbError) throw dbError

      localStorage.setItem('workout_user_id', userId)
      localStorage.setItem('workout_nickname', trimmed)
      onComplete({ userId, nickname: trimmed })
    } catch (err) {
      setError('Something went wrong. Check your Supabase connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💪</div>
          <h1 className="text-2xl font-bold text-gray-900">Family Workouts</h1>
          <p className="text-gray-500 mt-2 text-sm">What should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name or nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
            autoFocus
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!nickname.trim() || loading}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-lg disabled:opacity-50 active:bg-indigo-700"
          >
            {loading ? 'Joining...' : "Let's Go →"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your name is saved on this device. No password needed.
        </p>
      </div>
    </div>
  )
}

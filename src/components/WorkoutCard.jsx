import { useState } from 'react'
import { supabase } from '../supabaseClient'

const REACTIONS = ['🔥', '💪', '👏', '❤️', '😮']

export default function WorkoutCard({ workout, currentUser, onCopy }) {
  const [likes, setLikes] = useState(workout.likes || [])
  const [comments, setComments] = useState(workout.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const myReaction = likes.find(l => l.user_id === currentUser.userId)

  async function handleReaction(emoji) {
    setShowReactions(false)
    if (myReaction?.reaction === emoji) {
      // Remove reaction
      await supabase.from('likes').delete().eq('id', myReaction.id)
      setLikes(prev => prev.filter(l => l.id !== myReaction.id))
    } else if (myReaction) {
      // Change reaction
      const { data } = await supabase
        .from('likes')
        .update({ reaction: emoji })
        .eq('id', myReaction.id)
        .select()
        .single()
      setLikes(prev => prev.map(l => l.id === myReaction.id ? data : l))
    } else {
      // Add reaction
      const { data } = await supabase
        .from('likes')
        .insert({ workout_id: workout.id, user_id: currentUser.userId, nickname: currentUser.nickname, reaction: emoji })
        .select()
        .single()
      setLikes(prev => [...prev, data])
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)

    const { data } = await supabase
      .from('comments')
      .insert({ workout_id: workout.id, user_id: currentUser.userId, nickname: currentUser.nickname, content: commentText.trim() })
      .select()
      .single()

    if (data) {
      setComments(prev => [...prev, data])
      setCommentText('')
    }
    setSubmitting(false)
  }

  // Group reactions by emoji
  const reactionCounts = likes.reduce((acc, l) => {
    acc[l.reaction] = (acc[l.reaction] || [])
    acc[l.reaction].push(l.nickname)
    return acc
  }, {})

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'just now'
  }

  const moodColors = {
    'On Fire': 'bg-orange-100 text-orange-700',
    'Strong': 'bg-indigo-100 text-indigo-700',
    'Good': 'bg-green-100 text-green-700',
    'Okay': 'bg-gray-100 text-gray-600',
    'Tired': 'bg-blue-100 text-blue-600',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {workout.nickname[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{workout.nickname}</p>
            <p className="text-xs text-gray-400">{timeAgo(workout.created_at)}</p>
          </div>
        </div>
        {workout.mood && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${moodColors[workout.mood] || 'bg-gray-100 text-gray-600'}`}>
            {workout.mood_emoji} {workout.mood}
          </span>
        )}
      </div>

      {/* Title & meta */}
      <div className="px-4 pb-3">
        {workout.title && (
          <h3 className="font-bold text-gray-900 text-base mb-1">{workout.title}</h3>
        )}
        <div className="flex gap-3 text-sm text-gray-500">
          {workout.duration && <span>⏱ {workout.duration} min</span>}
          <span>🏋️ {workout.exercises?.length || 0} exercises</span>
        </div>
        {workout.notes && (
          <p className="text-sm text-gray-600 mt-2 italic">"{workout.notes}"</p>
        )}
      </div>

      {/* Exercises */}
      {workout.exercises && workout.exercises.length > 0 && (
        <div className="mx-4 mb-3 bg-gray-50 rounded-xl p-3 space-y-2">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{ex.name}</p>
                <p className="text-xs text-gray-400">{ex.category}</p>
              </div>
              <div className="text-right flex-shrink-0 text-xs text-gray-600">
                {ex.category === 'Cardio' ? (
                  <span>
                    {ex.time && `${ex.time} min`}
                    {ex.time && ex.distance && ' · '}
                    {ex.distance && `${ex.distance} mi`}
                  </span>
                ) : (
                  <span>
                    {ex.numSets && `${ex.numSets} sets`}
                    {ex.numSets && ex.reps && ' × '}
                    {ex.reps && `${ex.reps} reps`}
                    {ex.weight && ` × ${ex.weight} lbs`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reaction bar */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(reactionCounts).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={users.join(', ')}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-all ${
                myReaction?.reaction === emoji
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {emoji} <span className="text-xs font-medium">{users.length}</span>
            </button>
          ))}

          {/* Add reaction */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-lg hover:bg-gray-200 transition-all"
            >
              {myReaction ? '✓' : '+'}
            </button>
            {showReactions && (
              <div className="absolute bottom-10 left-0 bg-white shadow-xl rounded-2xl p-2 flex gap-1 border border-gray-100 z-10">
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-gray-500 flex items-center gap-1"
          >
            💬 {comments.length}
          </button>
          {onCopy && (
            <button
              onClick={() => onCopy(workout)}
              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium active:bg-indigo-700"
            >
              Copy workout
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center">No comments yet. Be first!</p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                {c.nickname[0].toUpperCase()}
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">{c.nickname}</p>
                <p className="text-sm text-gray-800">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="bg-indigo-600 text-white rounded-xl px-4 text-sm font-medium disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

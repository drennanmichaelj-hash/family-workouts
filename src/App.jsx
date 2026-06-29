import { useState, useEffect } from 'react'
import NicknameSetup from './components/NicknameSetup'
import Feed from './components/Feed'
import LogWorkout from './components/LogWorkout'
import MyWorkouts from './components/MyWorkouts'

const TABS = [
  { id: 'feed', label: 'Feed', icon: '🏠' },
  { id: 'log', label: 'Log', icon: '➕' },
  { id: 'mine', label: 'Mine', icon: '👤' },
]

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [tab, setTab] = useState('feed')
  const [copyPrefill, setCopyPrefill] = useState(null)
  const [savedBanner, setSavedBanner] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('workout_user_id')
    const nickname = localStorage.getItem('workout_nickname')
    if (userId && nickname) {
      setCurrentUser({ userId, nickname })
    }
  }, [])

  function handleWorkoutSaved(workout) {
    setCopyPrefill(null)
    setTab('feed')
    setSavedBanner(true)
    setTimeout(() => setSavedBanner(false), 3000)
  }

  function handleCopyWorkout(workout) {
    setCopyPrefill(workout)
    setTab('log')
  }

  function handleRedoWorkout(workout) {
    setCopyPrefill(workout)
    setTab('log')
  }

  function handleTabChange(newTab) {
    if (newTab !== 'log') setCopyPrefill(null)
    setTab(newTab)
  }

  if (!currentUser) {
    return <NicknameSetup onComplete={setCurrentUser} />
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h1 className="font-bold text-gray-900 text-lg">Family Workouts</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {currentUser.nickname[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 font-medium">{currentUser.nickname}</span>
          </div>
        </div>
      </header>

      {/* Saved banner */}
      {savedBanner && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium z-30 shadow-lg">
          ✓ Workout shared!
        </div>
      )}

      {/* Page content */}
      <main className="px-4 pt-4">
        {tab === 'feed' && (
          <Feed
            currentUser={currentUser}
            onCopyWorkout={handleCopyWorkout}
          />
        )}

        {tab === 'log' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-xl">
                {copyPrefill ? 'Copying workout' : 'Log Workout'}
              </h2>
              {copyPrefill && (
                <button
                  onClick={() => setCopyPrefill(null)}
                  className="text-xs text-gray-400"
                >
                  Start fresh
                </button>
              )}
            </div>
            <LogWorkout
              key={copyPrefill?.id || 'new'}
              currentUser={currentUser}
              onSave={handleWorkoutSaved}
              prefill={copyPrefill}
            />
          </div>
        )}

        {tab === 'mine' && (
          <div>
            <h2 className="font-bold text-gray-900 text-xl mb-4">My Workouts</h2>
            <MyWorkouts
              currentUser={currentUser}
              onRedo={handleRedoWorkout}
            />
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-20">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all ${
                tab === t.id
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <span className={`text-xl ${t.id === 'log' && tab === 'log' ? 'scale-110' : ''}`}>
                {t.icon}
              </span>
              <span className="text-xs font-medium">{t.label}</span>
              {tab === t.id && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

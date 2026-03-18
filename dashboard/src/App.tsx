import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Home } from './screens/Home'
import { Scrolls } from './screens/Scrolls'
import { Campaign } from './screens/Campaign'
import { Oracle } from './screens/Oracle'
import { Armoury } from './screens/Armoury'
import { Training } from './screens/Training'
import { Ransom } from './screens/Ransom'
import { Forge } from './screens/Forge'
import { useJobs } from './hooks/useJobs'
import { usePipeline } from './hooks/usePipeline'
import type { Screen, Job } from './types'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { jobs, syncing, lastSynced, syncError, sync: syncJobs } = useJobs()
  const { pipeline, sync: syncPipeline, add: addToPipeline, move: moveCard } = usePipeline()

  // Pre-load oracle / armoury job context
  const [preloadJob, setPreloadJob] = useState<Job | null>(null)

  const status = syncError ? 'error' : jobs.length > 0 || lastSynced ? 'connected' : 'connecting'

  useEffect(() => {
    syncJobs()
    syncPipeline()
  }, [syncJobs, syncPipeline])

  function navigate(s: Screen) { setScreen(s) }

  function handleLoadOracle(job: Job) {
    setPreloadJob(job)
    setScreen('oracle')
  }

  function handleLoadArmoury(job: Job) {
    setPreloadJob(job)
    setScreen('armoury')
  }

  const screens: Record<Screen, React.ReactNode> = {
    home: (
      <Home
        jobs={jobs}
        pipeline={pipeline}
        onNavigate={navigate}
      />
    ),
    scrolls: (
      <Scrolls
        jobs={jobs}
        onAddToPipeline={addToPipeline}
        onLoadOracle={handleLoadOracle}
        onLoadArmoury={handleLoadArmoury}
        onSync={syncJobs}
      />
    ),
    campaign: (
      <Campaign
        pipeline={pipeline}
        jobs={jobs}
        onMove={moveCard}
        onAdd={addToPipeline}
      />
    ),
    oracle:   <Oracle   preloadJob={preloadJob} onClearPreload={() => setPreloadJob(null)} />,
    armoury:  <Armoury  preloadJob={preloadJob} onClearPreload={() => setPreloadJob(null)} />,
    training: <Training />,
    ransom:   <Ransom />,
    forge:    <Forge />,
  }

  return (
    <div className="shell">
      <Sidebar
        active={screen}
        onNavigate={navigate}
        jobCount={jobs.length}
        lastSynced={lastSynced}
        syncing={syncing}
        onSync={syncJobs}
      />
      <div className="main-area">
        <Topbar status={status} />
        <div className="screen-wrap">
          {screens[screen]}
        </div>
      </div>
    </div>
  )
}

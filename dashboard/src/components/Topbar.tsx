import { FireTorch } from './FireTorch'

interface Props {
  status: 'connected' | 'error' | 'connecting'
}

const statusLabel = { connected: 'Pipeline firing', error: 'Connection lost', connecting: 'Connecting…' }
const dotColour   = { connected: '#3aaa3a', error: '#c83030', connecting: '#d06000' }

export function Topbar({ status }: Props) {
  return (
    <div className="topbar">
      <div className="tb-torch-wrap" style={{ left: 12 }}>
        <FireTorch width={46} height={66} seed={1.4} cupW={13} cupH={8} bodyW={8} bodyH={18} />
      </div>

      <div className="tb-title">⚔ &nbsp; The Prep Knight &nbsp; ⚔</div>

      <div className="tb-live">
        <div className="live-dot" style={{ background: dotColour[status] }} />
        <div className="live-txt">{statusLabel[status]}</div>
      </div>

      <div className="tb-torch-wrap" style={{ right: 12 }}>
        <FireTorch width={46} height={66} seed={3.7} cupW={13} cupH={8} bodyW={8} bodyH={18} />
      </div>
    </div>
  )
}

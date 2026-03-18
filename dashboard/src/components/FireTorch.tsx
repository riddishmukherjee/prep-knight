import { useEffect, useRef } from 'react'

interface Props {
  width: number
  height: number
  seed: number
  cupW?: number
  cupH?: number
  bodyW?: number
  bodyH?: number
}

export function FireTorch({ width, height, seed, cupW = 13, cupH = 8, bodyW = 8, bodyH = 18 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let t = seed * 2.718
    let animId: number

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; ml: number; sz: number; ph: number }
    const P: Particle[] = Array.from({ length: 30 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 8,
      y: height - 4,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.7 + Math.random() * 1.4),
      life: Math.random(),
      ml: 0.52 + Math.random() * 0.46,
      sz: 2.5 + Math.random() * 6,
      ph: Math.random() * 6.28,
    }))

    function rp(p: Particle) {
      p.x = width / 2 + (Math.random() - 0.5) * 9
      p.y = height - 5
      p.vx = (Math.random() - 0.5) * 0.65
      p.vy = -(0.8 + Math.random() * 1.5)
      p.life = 0
      p.ml = 0.5 + Math.random() * 0.5
      p.sz = 2 + Math.random() * 6.5
      p.ph = Math.random() * 6.28
    }

    function fp(tx: number, ty: number, bw: number, col: string, al: number) {
      ctx.save()
      ctx.globalAlpha = al
      ctx.fillStyle = col
      const cx = width / 2, by = height - 2, hw = bw / 2
      ctx.beginPath()
      ctx.moveTo(cx - hw, by)
      ctx.bezierCurveTo(cx - hw * 0.85, by - (by - ty) * 0.28, tx - hw * 0.3, ty + (by - ty) * 0.5, tx, ty)
      ctx.bezierCurveTo(tx + hw * 0.3, ty + (by - ty) * 0.5, cx + hw * 0.85, by - (by - ty) * 0.28, cx + hw, by)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    function draw() {
      t += 0.042
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2, by = height - 2
      const sw = Math.sin(t * 1.08) * 2.6 + Math.sin(t * 2.35) * 1.3
      const br = Math.sin(t * 1.65) * 0.07 + 1
      const g = ctx.createRadialGradient(cx + sw * 0.25, by - height * 0.3, 0, cx, by, height * 0.52)
      g.addColorStop(0, 'rgba(255,140,0,.17)')
      g.addColorStop(1, 'rgba(255,60,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(cx + sw * 0.25, by - height * 0.33, width * 0.52 * br, height * 0.5, 0, 0, Math.PI * 2)
      ctx.fill()
      fp(cx + sw * 0.14, by - height * 0.70 * br, width * 0.56, '#b02800', 0.82)
      fp(cx + sw * 0.22, by - height * 0.60 * br, width * 0.44, '#d85000', 0.78)
      fp(cx + sw * 0.32, by - height * 0.48 * br, width * 0.34, '#f07000', 0.74)
      fp(cx + sw * 0.38, by - height * 0.34 * br, width * 0.24, '#ffa000', 0.68)
      fp(cx + sw * 0.30, by - height * 0.20 * br, width * 0.14, '#ffd040', 0.62)
      fp(cx + sw * 0.20, by - height * 0.10 * br, width * 0.07, '#fff8a0', 0.48)
      const lb = Math.sin(t * 3.2 + 0.9) * 2.2, lb2 = Math.sin(t * 2.5 + 1.5) * 1.8
      ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#e06000'
      ctx.beginPath()
      ctx.moveTo(cx - width * 0.20, by)
      ctx.bezierCurveTo(cx - width * 0.26 - lb, by - height * 0.22, cx - width * 0.08, by - height * 0.42, cx + sw * 0.35, by - height * 0.52 * br)
      ctx.bezierCurveTo(cx - width * 0.04, by - height * 0.35, cx - width * 0.12, by - height * 0.16, cx - width * 0.20, by)
      ctx.fill(); ctx.restore()
      ctx.save(); ctx.globalAlpha = 0.24; ctx.fillStyle = '#e06000'
      ctx.beginPath()
      ctx.moveTo(cx + width * 0.20, by)
      ctx.bezierCurveTo(cx + width * 0.26 + lb2, by - height * 0.20, cx + width * 0.10, by - height * 0.40, cx + sw * 0.18, by - height * 0.50 * br)
      ctx.bezierCurveTo(cx + width * 0.05, by - height * 0.33, cx + width * 0.13, by - height * 0.14, cx + width * 0.20, by)
      ctx.fill(); ctx.restore()
      for (const p of P) {
        p.life += 0.02
        if (p.life > p.ml) rp(p)
        const pr = p.life / p.ml
        p.x += p.vx + Math.sin(t * 2.1 + p.ph) * 0.35
        p.y += p.vy; p.vy *= 0.994
        const al = pr < 0.2 ? pr / 0.2 : 1 - (pr - 0.2) / 0.8
        const sz = p.sz * (1 - pr * 0.5)
        if (pr < 0.35) {
          const eg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz)
          eg.addColorStop(0, `rgba(255,215,65,${al * 0.9})`)
          eg.addColorStop(0.4, `rgba(255,115,0,${al * 0.6})`)
          eg.addColorStop(1, 'rgba(185,35,0,0)')
          ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.fillStyle = `rgba(50,32,16,${al * 0.11})`
          ctx.beginPath(); ctx.arc(p.x, p.y, sz * 1.6, 0, Math.PI * 2); ctx.fill()
        }
      }
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [width, height, seed])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
      <div className="t-cup" style={{ width: cupW, height: cupH }} />
      <div className="t-body" style={{ width: bodyW, height: bodyH }} />
    </div>
  )
}

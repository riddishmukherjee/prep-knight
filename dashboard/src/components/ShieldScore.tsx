interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const colours = {
  high:  { fill: 'rgba(58,170,58,.15)',    stroke: '#3aaa3a', text: '#3aaa3a' },
  mid:   { fill: 'rgba(212,168,53,.15)',   stroke: '#d4a835', text: '#d4a835' },
  low:   { fill: 'rgba(138,16,16,.15)',    stroke: '#c83030', text: '#c83030' },
}

export function ShieldScore({ score, size = 'md' }: Props) {
  const tier = score >= 8 ? 'high' : score >= 6 ? 'mid' : 'low'
  const { fill, stroke, text } = colours[tier]
  const dims = { sm: [28, 32, 11, 19], md: [36, 42, 13, 25], lg: [48, 56, 17, 33] }
  const [w, h, fs, ty] = dims[size]

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={`M${w/2} 2L${w-4} ${h*.18}L${w-4} ${h*.55}Q${w-4} ${h*.85} ${w/2} ${h-2}Q${4} ${h*.85} ${4} ${h*.55}L${4} ${h*.18}Z`}
        fill={fill} stroke={stroke} strokeWidth="1.5"
      />
      <text
        x={w / 2} y={ty}
        textAnchor="middle"
        fontFamily="Cinzel,serif"
        fontSize={fs}
        fontWeight="900"
        fill={text}
      >
        {score}
      </text>
    </svg>
  )
}

export default function IconTreasury({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <polyline points="12 2 2 10 22 10"/>
      <rect x="5" y="10" width="4" height="12"/>
      <rect x="10" y="10" width="4" height="12"/>
      <rect x="15" y="10" width="4" height="12"/>
    </svg>
  )
}

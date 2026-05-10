// ============================================================
//  Badge — status/role pill
// ============================================================

export default function Badge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

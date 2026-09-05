export default function Toast({ message, visible }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--navy-900)', color: '#fff', padding: '10px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 600, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }}>
      {message}
    </div>
  )
}

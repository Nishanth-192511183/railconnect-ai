const RiskBadge = ({ level }) => {
  let value = level

  if (typeof level === 'object' && level !== null) {
    value = level.level || 'LOW'
  }

  value = String(value || 'LOW').toUpperCase()

  return (
    <span className={`risk-badge ${value.toLowerCase()}`}>
      {value}
    </span>
  )
}

export default RiskBadge
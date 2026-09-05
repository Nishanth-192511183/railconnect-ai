export default function Button({ children, variant = 'primary', size = 'md', block, icon: Icon, ...props }) {
  const cls = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'secondary' && 'btn-secondary',
    variant === 'danger' && 'btn-danger',
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
  ].filter(Boolean).join(' ')
  return (
    <button className={cls} {...props}>
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  )
}

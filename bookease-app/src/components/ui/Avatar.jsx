import { initials } from '../../utils/helpers'

export default function Avatar({ user, size = 'md', style = {}, className = '' }) {
  const sizeClass = size === 'sm' ? ' avatar-sm' : size === 'lg' ? ' avatar-lg' : ''
  const baseClass = `avatar${sizeClass} ${className}`.trim()

  if (user?.avatar) {
    return (
      <img 
        src={user.avatar} 
        alt="Avatar" 
        className={baseClass} 
        style={{ objectFit: 'cover', ...style }} 
      />
    )
  }

  return (
    <div className={baseClass} style={style}>
      {initials(user)}
    </div>
  )
}

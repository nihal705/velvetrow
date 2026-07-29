// LogoV.jsx - With props
import React from 'react'
import { Link } from 'react-router-dom'

const LogoV = ({ 
  circleSize = 'w-12 h-12',      // Default size
  vSize = 'text-3xl',             // Default V size
}) => {
  return (
    <Link to='/' className='max-md:flex-1'>
      <div className="flex items-center gap-0">
        <div className={`flex items-center justify-center ${circleSize} rounded-full border-2 border-primary/60 .bg-gradient-to-br from-primary/20 to-transparent shadow-lg shadow-primary/20 shrink-0`}>
          <span 
            className={`text-primary ${vSize} font-bold leading-none`} 
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            V
          </span>
        </div>
      </div>
    </Link>
  )
}

export default LogoV
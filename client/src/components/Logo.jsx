// Logo.jsx - With props
import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ 
  circleSize = 'w-12 h-12',      // Default size
  textSize = 'text-2xl',          // Default text size
  vSize = 'text-3xl',             // Default V size
  overlap = '-ml-4.5'               // Default overlap
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
        
        <span className={`${textSize} font-bold tracking-tight ${overlap}`}>
          <span className="text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>
            elvet
          </span>
          <span className="text-white/90" style={{ fontFamily: 'Playfair Display, serif' }}>
            Row
          </span>
        </span>
      </div>
    </Link>
  )
}

export default Logo
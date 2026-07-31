import React from 'react'
import { Link } from 'react-router-dom'

const Footer = ({
  circleSize = 'w-12 h-12',      // Default size
  textSize = 'text-2xl',          // Default text size
  vSize = 'text-3xl',             // Default V size
  overlap = '-ml-4.5'               // Default overlap
}) => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,700&display=swap');
          * {
            font-family: "Geist", sans-serif;
          }
        `}
      </style>
      <div className='bg-black pt-20 px-4'>
        <footer className="bg-[#131314] w-full max-w-337.5 mx-auto text-white pt-8 lg:pt-12 px-4 sm:px-8 md:px-16 lg:px-28 rounded-tl-3xl rounded-tr-3xl overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12">
            
            {/* Left Column - Logo with Circle */}
            <div className="lg:col-span-3 space-y-6">
              <Link to="/" className="block">
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
              <p className="text-sm/6 text-neutral-300 max-w-96">
                Experience premium movie ticketing with VelvetRow. Book your seats, discover new releases, and enjoy the magic of cinema.
              </p>
              <div className="flex gap-5 md:gap-6 order-1 md:order-2">
                {/* X (Twitter) */}
                <a href="#" className="text-white hover:text-primary transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                {/* Github */}
                <a href="#" className="text-white hover:text-primary transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                </a>
                {/* Linkedin */}
                <a href="#" className="text-white hover:text-primary transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                {/* Youtube */}
                <a href="#" className="text-white hover:text-primary transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="text-white hover:text-primary transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>

            {/* Right Column - Company & Get in Touch */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-8 md:gap-12 lg:gap-28 items-start">
              
              {/* Company Links */}
              <div>
                <h3 className="font-medium text-sm mb-4 text-primary">Company</h3>
                <ul className="space-y-3 text-sm text-neutral-300">
                  <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
                  <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
                  <li><Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
                </ul>
              </div>

              {/* Get in Touch */}
              <div>
                <h3 className="font-medium text-sm mb-4 text-primary">Get in Touch</h3>
                <ul className="space-y-3 text-sm text-neutral-300">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>+1 (555) 123-4567</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span>support@velvetrow.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto mt-12 pt-4 border-t border-neutral-700 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-neutral-400 text-sm">© 2026 VelvetRow. All rights reserved.</p>
            <p className='text-sm text-neutral-400'>Made with ❤️ for movie lovers</p>
          </div>

          {/* BIG Bottom VelvetRow with WIDE Reddish Glow */}
          <div className="relative overflow-visible mt-8 -mx-4 sm:-mx-8 md:-mx-16 lg:-mx-28"> {/* ← Negative margin to spread out */}
            
            {/* Wide Reddish Glow - spread across full width */}
            <div className="absolute inset-x-0 bottom-0 mx-auto w-[200%] h-full max-h-96 bg-primary/15 rounded-full blur-[200px] pointer-events-none left-1/2 -translate-x-1/2"></div>
            
            {/* Additional glow layer for more spread */}
            <div className="absolute inset-x-0 bottom-0 mx-auto w-[150%] h-full max-h-72 bg-primary/10 rounded-full blur-[150px] pointer-events-none left-1/2 -translate-x-1/2"></div>
            
            {/* Big VelvetRow Text */}
            <h3 className="text-center font-extrabold leading-[0.7] text-transparent text-[clamp(3rem,15vw,15rem)] [-webkit-text-stroke:2px_rgba(248,69,101,0.4)] mt-6 px-4 select-none">
              VelvetRow
            </h3>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Footer
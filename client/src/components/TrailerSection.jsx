import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20'>
      <p className='text-gray-300 font-medium text-lg max-w-240 mx-auto'>Trailer</p>

      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />
        
        <div className="w-full max-w-240 mx-auto bg-black/50 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${currentTrailer.videoUrl.split('v=')[1]}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block' }}
          ></iframe>
        </div>
      </div>

      <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
        {dummyTrailers.map((trailer) => (
          <div 
            key={trailer.id}
            className='relative group-hover:not-hover:opacity-50 hover:-translate-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer'
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img 
              src={trailer.image} 
              alt="Trailer thumbnail" 
              className='rounded-lg w-full h-full object-cover brightness-75'
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x169/333/666?text=Trailer'
              }}
            />
            <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2' />
            {currentTrailer.id === trailer.id && (
              <div className='absolute inset-0 border-2 border-primary rounded-lg'></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrailerSection
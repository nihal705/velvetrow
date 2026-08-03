import React from 'react'
import { dummyShowsData } from '../assets/assets'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'

const Favorite = () => {
  return dummyShowsData.length > 0 ? (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-28 py-8'>

      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" left="50px" />

      <h1 className='text-1xl font-medium mt-24 text-white'>Your favorite Movies</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-18 mt-8'>
        {dummyShowsData.map((movie) => 
        <MovieCard movie={movie} key={movie._id} />
        )}
      </div>
    </div>
  ) : (
    <div>
      <h1 className='text-1xl font-medium mt-24 text-white'>No movies available at the moment.</h1>
    </div>
  )
}

export default Favorite
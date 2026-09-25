import React from 'react';
import { useAppContext } from '../context/AppContext';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import { Link } from 'react-router-dom';

const Favorite = () => {
  const { favoriteMovies, image_base_url } = useAppContext();

  // Show loading or empty state if no favorites
  if (!favoriteMovies) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-28 py-8'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" left="50px" />

      <h1 className='text-2xl font-semibold mt-24 text-white'>
        Your Favorite Movies
      </h1>

      {favoriteMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <p className="text-gray-400 text-lg">No favorite movies yet</p>
          <Link 
            to="/movies" 
            className="mt-4 px-6 py-2 bg-primary rounded-md hover:bg-primary-dull transition"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie._id || movie.id || movie.movieId} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorite;
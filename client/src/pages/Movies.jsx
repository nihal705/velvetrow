import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'

const Movies = () => {
  const { shows, isShowsLoading } = useAppContext()

  if (isShowsLoading) {
    return <Loading />
  }

  return (
    <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-28 py-8'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" left="50px" />
      <h1 className='text-1xl font-medium mt-24 text-white'>Now Showing</h1>
      {shows.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-18 mt-8'>
          {shows.map((movie) => <MovieCard movie={movie} key={movie._id} />)}
        </div>
      ) : (
        <p className='mt-8 text-gray-400'>No upcoming shows are scheduled yet.</p>
      )}
    </div>
  )
};

export default Movies;
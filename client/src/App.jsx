import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'

const App = () => {

  const isAdminRoute = useLocation().pthname.startswith('/admin')

  return (
    <>
      <Toaster/>
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <React path='/' element={<Home/>} />
        <React path='/movies' element={<Movies/>} />
        <React path='/movies/:id' element={<MovieDetails/>} />
        <React path='/movies/:id/:date' element={<SeatLayout/>} />
        <React path='/my-bookings' element={<MyBookings/>} />
        <React path='/favorite' element={<Favorite/>} />
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App;
import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// Dummy data for when TMDB is not accessible
const dummyMovies = [
  {
    id: 324544,
    title: "In the Lost Lands",
    overview:
      "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power.",
    poster_path: "/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
    backdrop_path: "/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
    release_date: "2025-02-27",
    original_language: "en",
    vote_average: 6.4,
    vote_count: 15000,
  },
  {
    id: 1232546,
    title: "Until Dawn",
    overview:
      "One year after her sister mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
    poster_path: "/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
    backdrop_path: "/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
    release_date: "2025-04-23",
    original_language: "en",
    vote_average: 6.405,
    vote_count: 18000,
  },
  {
    id: 552524,
    title: "Lilo & Stitch",
    overview:
      "The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.",
    poster_path: "/mKKqV23MQ0uakJS8OCE2TfV5jNS.jpg",
    backdrop_path: "/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
    release_date: "2025-05-17",
    original_language: "en",
    vote_average: 7.117,
    vote_count: 27500,
  },
  {
    id: 668489,
    title: "Havoc",
    overview:
      "When a drug heist swerves lethally out of control, a jaded cop fights his way through a corrupt city's criminal underworld.",
    poster_path: "/ubP2OsF3GlfqYPvXyLw9d78djGX.jpg",
    backdrop_path: "/65MVgDa6YjSdqzh7YOA04mYkioo.jpg",
    release_date: "2025-04-25",
    original_language: "en",
    vote_average: 6.537,
    vote_count: 35960,
  },
  {
    id: 950387,
    title: "A Minecraft Movie",
    overview:
      "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld.",
    poster_path: "/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
    backdrop_path: "/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
    release_date: "2025-03-31",
    original_language: "en",
    vote_average: 6.516,
    vote_count: 15225,
  },
  {
    id: 575265,
    title: "Mission: Impossible - The Final Reckoning",
    overview:
      "Ethan Hunt and team continue their search for the terrifying AI known as the Entity.",
    poster_path: "/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
    backdrop_path: "/1p5aI299YBnqrEEvVGJERk2MXXb.jpg",
    release_date: "2025-05-17",
    original_language: "en",
    vote_average: 7.042,
    vote_count: 19885,
  },
  {
    id: 986056,
    title: "Thunderbolts*",
    overview:
      "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission.",
    poster_path: "/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg",
    backdrop_path: "/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
    release_date: "2025-04-30",
    original_language: "en",
    vote_average: 7.443,
    vote_count: 23569,
  },
];

// API to get now playing movies from TMDB API (with fallback)
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3/movie/now_playing",
      { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } },
    );

    const movies = data.results;

    res.json({ success: true, movies: movies });
  } catch (error) {
    console.error("❌ TMDB API error:", error.message);

    // Return dummy data as fallback
    res.json({
      success: true,
      movies: dummyMovies,
      message: "Using sample movie data (TMDB API not available)",
    });
  }
};

// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      try {
        // Fetch movie details and credits from TMDB API
        const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
            timeout: 10000,
          }),

          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
            timeout: 10000,
          }),
        ]);

        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsResponse.data;

        const movieDetails = {
          _id: movieId,
          title: movieApiData.title,
          overview: movieApiData.overview,
          poster_path: movieApiData.poster_path,
          backdrop_path: movieApiData.backdrop_path,
          genres: movieApiData.genres,
          casts: movieCreditsData.cast || [],
          release_date: movieApiData.release_date,
          original_language: movieApiData.original_language,
          tagline: movieApiData.tagline || "",
          vote_average: movieApiData.vote_average,
          runtime: movieApiData.runtime,
        };

        movie = await Movie.create(movieDetails);
      } catch (error) {
        console.error("❌ Error fetching movie details:", error.message);

        // Check if movie exists in dummy data
        const dummyMovie = dummyMovies.find(
          (m) => String(m.id) === String(movieId),
        );
        if (dummyMovie) {
          const movieDetails = {
            _id: movieId,
            title: dummyMovie.title,
            overview: dummyMovie.overview,
            poster_path: dummyMovie.poster_path,
            backdrop_path: dummyMovie.backdrop_path,
            genres: [],
            casts: [],
            release_date: dummyMovie.release_date,
            original_language: dummyMovie.original_language || "en",
            tagline: "",
            vote_average: dummyMovie.vote_average || 0,
            runtime: 120,
          };

          movie = await Movie.create(movieDetails);
        } else {
          return res.json({
            success: false,
            message: `Movie not found: ${movieId}. Please try a different movie.`,
          });
        }
      }
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show Added successfully." });
  } catch (error) {
    console.error("❌ Add show error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from the database
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueShows = new Set(shows.map((show) => show.movie));

    res.json({ success: true, shows: Array.from(uniqueShows) });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);

    if (!movie) {
      // Check if movie exists in dummy data
      const dummyMovie = dummyMovies.find(
        (m) => String(m.id) === String(movieId),
      );
      if (dummyMovie) {
        // Return empty shows but with dummy movie data
        return res.json({
          success: true,
          movie: {
            _id: movieId,
            title: dummyMovie.title,
            overview: dummyMovie.overview,
            poster_path: dummyMovie.poster_path,
            backdrop_path: dummyMovie.backdrop_path,
            release_date: dummyMovie.release_date,
            original_language: dummyMovie.original_language || "en",
            vote_average: dummyMovie.vote_average || 0,
          },
          dateTime: {},
        });
      }
      return res.json({ success: false, message: "Movie not found" });
    }

    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

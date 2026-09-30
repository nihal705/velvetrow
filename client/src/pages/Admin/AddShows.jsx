import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/Admin/Title";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/KConverter";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNowPlayingMovies = async () => {
    setLoading(true);
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (data.success && data.movies?.length > 0) {
        setNowPlayingMovies(data.movies);
      } else {
        toast.info("Using sample movie data");
        // Fallback to dummy data if needed
        setNowPlayingMovies([]);
      }
    } catch (error) {
      console.error("❌ Error fetching movies:", error);
      toast.error("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeAdd = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    setDateTimeSelection((prev) => {
      const times = prev[selectedDate] || [];
      if (!times.includes(selectedTime)) {
        return { ...prev, [selectedDate]: [...times, selectedTime] };
      } else {
        toast.error("This time already added for this date");
        return prev;
      }
    });

    // Clear inputs after adding
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setAddingShow(true);

      if (!selectedMovie) {
        toast.error("Please select a movie");
        setAddingShow(false);
        return;
      }

      if (Object.keys(dateTimeSelection).length === 0) {
        toast.error("Please add at least one date and time");
        setAddingShow(false);
        return;
      }

      if (!showPrice || Number(showPrice) <= 0) {
        toast.error("Please enter a valid show price");
        setAddingShow(false);
        return;
      }

      const showsInput = Object.entries(dateTimeSelection).map(
        ([date, times]) => ({
          date,
          time: times,
        }),
      );

      const payload = {
        movieId: selectedMovie,
        showsInput,
        showPrice: Number(showPrice),
      };

      const { data } = await axios.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message || "Show added successfully!");
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
        setSelectedDate("");
        setSelectedTime("");
        // Refresh the movie list
        fetchNowPlayingMovies();
      } else {
        toast.error(data.message || "Failed to add show");
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setAddingShow(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlayingMovies();
    }
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Title text1="Add" text2="Shows" />

      {nowPlayingMovies.length === 0 ? (
        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400">No movies available. Please check:</p>
          <ul className="list-disc list-inside mt-2 text-gray-400">
            <li>Your TMDB API key is set correctly in server/.env</li>
            <li>Your backend server is running</li>
            <li>You are connected to the internet</li>
          </ul>
          <button
            onClick={fetchNowPlayingMovies}
            className="mt-4 px-4 py-2 bg-primary rounded-md hover:bg-primary-dull transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
          <div className="overflow-x-auto pb-4">
            <div className="group flex flex-wrap gap-4 mt-4 w-max">
              {nowPlayingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className={`relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300 ${
                    selectedMovie === movie.id
                      ? "ring-2 ring-primary rounded-lg"
                      : ""
                  }`}
                  onClick={() => setSelectedMovie(movie.id)}
                >
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={image_base_url + movie.poster_path}
                      alt="movie_poster"
                      className="w-full object-cover brightness-90"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x450/333/666?text=No+Image";
                      }}
                    />
                    <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                      <p className="flex items-center gap-1 text-gray-400">
                        <StarIcon className="w-4 h-4 text-primary fill-primary" />
                        {movie.vote_average?.toFixed(1) || "N/A"}
                      </p>
                      <p className="text-gray-300">
                        {kConverter(movie.vote_count || 0)} Votes
                      </p>
                    </div>
                  </div>
                  {selectedMovie === movie.id && (
                    <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                      <CheckIcon
                        className="w-4 h-4 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}
                  <p className="font-medium truncate mt-1">{movie.title}</p>
                  <p className="text-gray-400 text-sm">{movie.release_date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Show Price Input */}
          <div className="mt-8">
            <label className="block text-sm font-medium mb-2">Show Price</label>
            <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md bg-gray-900/50">
              <p className="text-gray-400 text-sm">{currency}</p>
              <input
                min={0}
                type="number"
                value={showPrice}
                onChange={(e) => setShowPrice(e.target.value)}
                placeholder="Enter show price"
                className="outline-none bg-transparent w-32 text-white"
              />
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Select Date and Time
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md bg-gray-900/50">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="outline-none bg-transparent text-white cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div className="flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md bg-gray-900/50">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="outline-none bg-transparent text-white cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <button
                onClick={handleDateTimeAdd}
                disabled={!selectedDate || !selectedTime}
                className="bg-primary/80 text-white px-4 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Time
              </button>
            </div>
          </div>

          {/* Display Selected Times */}
          {Object.keys(dateTimeSelection).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-medium">Selected Date-Time</h2>
              <ul className="space-y-3">
                {Object.entries(dateTimeSelection).map(([date, times]) => (
                  <li key={date}>
                    <div className="font-medium text-sm text-primary">
                      {date}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm">
                      {times.map((time) => (
                        <div
                          key={time}
                          className="border border-primary px-3 py-1.5 flex items-center rounded bg-primary/5"
                        >
                          <span>{time}</span>
                          <DeleteIcon
                            onClick={() => handleRemoveTime(date, time)}
                            width={15}
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer transition"
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              addingShow ||
              !selectedMovie ||
              Object.keys(dateTimeSelection).length === 0 ||
              !showPrice
            }
            className="bg-primary text-white px-8 py-2.5 mt-6 rounded-lg hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {addingShow ? "Adding Show..." : "Add Show"}
          </button>
        </>
      )}
    </>
  );
};

export default AddShows;

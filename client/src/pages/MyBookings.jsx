import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {}
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0px" left="600px" />
      </div>
      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <p className="text-gray-400 text-lg">No bookings found</p>
          <Link
            to="/movies"
            className="mt-4 px-6 py-2 bg-primary rounded-md hover:bg-primary-dull transition"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item, index) => {
            // Safety check
            if (!item?.show?.movie) return null;

            const movie = item.show.movie;
            const posterUrl = image_base_url + movie.poster_path;

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 transition duration-300"
              >
                {/* Left Section - Movie Info */}
                <div className="flex flex-col sm:flex-row flex-1">
                  {/* Movie Poster */}
                  <div className="w-full sm:w-40 md:w-48 shrink-0">
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-48 sm:h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x450/333/666?text=No+Image";
                      }}
                    />
                  </div>

                  {/* Movie Details */}
                  <div className="flex flex-col justify-between p-4 flex-1">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {movie.title}
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {timeFormat(movie.runtime)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {dateFormat(item.show.showDateTime)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                        {item.bookedSeats?.length || 0} Tickets
                      </span>
                      <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                        Seats: {item.bookedSeats?.join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Price & Status */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between p-4 md:min-w-50 border-t md:border-t-0 md:border-l border-primary/10">
                  <div className="text-center md:text-right">
                    <p className="text-2xl font-bold text-white">
                      {currency}
                      {item.amount || 0}
                    </p>
                    {item.isPaid ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium mt-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-yellow-400 text-sm font-medium mt-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

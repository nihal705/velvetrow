import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import BlurCircle from "./BlurCircle";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const dates = Object.entries(dateTime || {})
    .filter(([, times]) => Array.isArray(times) && times.length > 0)
    .map(([date]) => date)
    .sort();
  const pageCount = Math.ceil(dates.length / 3);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visibleDates = dates.slice(currentPage * 3, currentPage * 3 + 3);

  const onBookHandler = () => {
    if (!selected || !dateTime[selected]?.length) {
      return toast("Please select a date");
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0" />
        <div>
          <p className="text-lg font-semibold">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-5">
            <button
              type="button"
              aria-label="Previous show dates"
              disabled={currentPage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon width={28} />
            </button>
            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {visibleDates.map((date) => {
                const [year, month, day] = date.split("-").map(Number);
                const localDate = new Date(year, month - 1, day);

                return (
                  <button
                    type="button"
                    onClick={() => setSelected(date)}
                    key={date}
                    aria-label={new Date(`${date}T00:00:00`).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                    className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${
                      selected === date
                        ? "bg-primary text-white"
                        : "border border-primary/70"
                    }`}
                  >
                    <span>{localDate.getDate()}</span>
                    <span className="text-xs leading-tight">
                      {localDate.toLocaleString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </button>
                );
              })}
            </span>
            <button
              type="button"
              aria-label="Next show dates"
              disabled={currentPage >= pageCount - 1}
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              className="disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon width={28} />
            </button>
          </div>
          {dates.length === 0 && (
            <p className="mt-5 text-sm text-gray-400">
              No upcoming showtimes are available.
            </p>
          )}
        </div>
        <button
          onClick={onBookHandler}
          disabled={dates.length === 0}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
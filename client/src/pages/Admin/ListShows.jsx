import { Fragment, useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/Admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShowId, setEditingShowId] = useState(null);
  const [venueForm, setVenueForm] = useState({
    theaterName: "",
    theaterAddress: "",
    theaterMapUrl: "",
  });
  const [isSavingVenue, setIsSavingVenue] = useState(false);

  const getAllShow = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const editVenue = (show) => {
    setEditingShowId(show._id);
    setVenueForm({
      theaterName: show.theaterName || "",
      theaterAddress: show.theaterAddress || "",
      theaterMapUrl: show.theaterMapUrl || "",
    });
  };

  const saveVenue = async (event, showId) => {
    event.preventDefault();
    setIsSavingVenue(true);
    try {
      const token = await getToken();
      const { data } = await axios.patch(`/api/admin/${showId}/venue`, venueForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!data.success) {
        throw new Error(data.message || "Unable to update theater details.");
      }
      setShows((currentShows) =>
        currentShows.map((show) =>
          show._id === showId ? { ...show, ...data.show } : show,
        ),
      );
      setEditingShowId(null);
      toast.success("Theater details updated.");
    } catch (error) {
      console.error("Failed to update theater details:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to update theater details.",
      );
    } finally {
      setIsSavingVenue(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShow();
    }
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Title text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        {shows.length === 0 ? (
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400">No shows found. Add a show first!</p>
          </div>
        ) : (
          <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
            <thead>
              <tr className="bg-primary/20 text-left text-white">
                <th className="p-2 font-medium pl-5">Movie Name</th>
                <th className="p-2 font-medium">Show Time</th>
                <th className="p-2 font-medium">Theater</th>
                <th className="p-2 font-medium">Total Bookings</th>
                <th className="p-2 font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <Fragment key={show._id}>
                  <tr
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                  >
                    <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                    <td className="p-2">{dateFormat(show.showDateTime)}</td>
                    <td className="p-2">
                      {show.theaterName || "Not specified"}
                      {show.theaterAddress && (
                        <p className="whitespace-normal text-xs text-gray-400">
                          {show.theaterAddress}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => editVenue(show)}
                        className="mt-1 text-xs text-primary hover:underline"
                      >
                        {show.theaterName ? "Edit venue" : "Set venue"}
                      </button>
                    </td>
                    <td className="p-2">{show.totalBookings || 0}</td>
                    <td className="p-2">{currency} {show.totalRevenue || 0}</td>
                  </tr>
                  {editingShowId === show._id && (
                    <tr key={`${show._id}-venue-edit`} className="bg-black/30">
                      <td colSpan={5} className="p-4">
                        <form
                          onSubmit={(event) => saveVenue(event, show._id)}
                          className="grid grid-cols-1 md:grid-cols-3 gap-3"
                        >
                          <input
                            required
                            aria-label="Theater name"
                            value={venueForm.theaterName}
                            onChange={(event) =>
                              setVenueForm((form) => ({
                                ...form,
                                theaterName: event.target.value,
                              }))
                            }
                            placeholder="Theater name"
                            className="min-w-0 rounded-md border border-gray-600 bg-gray-900 px-3 py-2"
                          />
                          <input
                            required
                            aria-label="Theater address"
                            value={venueForm.theaterAddress}
                            onChange={(event) =>
                              setVenueForm((form) => ({
                                ...form,
                                theaterAddress: event.target.value,
                              }))
                            }
                            placeholder="Theater address"
                            className="min-w-0 rounded-md border border-gray-600 bg-gray-900 px-3 py-2"
                          />
                          <input
                            type="url"
                            aria-label="Map link"
                            value={venueForm.theaterMapUrl}
                            onChange={(event) =>
                              setVenueForm((form) => ({
                                ...form,
                                theaterMapUrl: event.target.value,
                              }))
                            }
                            placeholder="Map link (optional)"
                            className="min-w-0 rounded-md border border-gray-600 bg-gray-900 px-3 py-2"
                          />
                          <div className="flex gap-2 md:col-span-3">
                            <button
                              type="submit"
                              disabled={isSavingVenue}
                              className="rounded-md bg-primary px-4 py-2 disabled:opacity-50"
                            >
                              {isSavingVenue ? "Saving…" : "Save venue"}
                            </button>
                            <button
                              type="button"
                              disabled={isSavingVenue}
                              onClick={() => setEditingShowId(null)}
                              className="rounded-md border border-gray-600 px-4 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ListShows;
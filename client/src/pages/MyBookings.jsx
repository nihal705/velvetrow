import { Fragment, useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import loadRazorpay from "../lib/loadRazorpay";
import QRCode from "qrcode";

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const TicketQRCode = ({ ticketId }) => {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let isCurrent = true;
    QRCode.toDataURL(ticketId, {
      width: 192,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (isCurrent) setQrCode(dataUrl);
      })
      .catch((error) => {
        console.error("Failed to create ticket QR code:", error);
        if (isCurrent) toast.error("Could not generate this ticket's QR code.");
      });

    return () => {
      isCurrent = false;
    };
  }, [ticketId]);

  return qrCode ? (
    <img
      src={qrCode}
      alt={`Entry QR code for seat ${ticketId}`}
      className="w-36 h-36 rounded-lg bg-white p-2"
    />
  ) : (
    <div className="w-36 h-36 rounded-lg bg-white/10 animate-pulse" aria-label="Generating ticket QR code" />
  );
};

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
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load your bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthConfig = async () => ({
    headers: { Authorization: `Bearer ${await getToken()}` },
  });

  const continuePayment = async (bookingId) => {
    try {
      const { data } = await axios.get(
        `/api/booking/${bookingId}/checkout`,
        await getAuthConfig(),
      );
      if (!data.success) {
        throw new Error(data.message || "Could not continue payment.");
      }

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay Checkout. Check your connection and try again.");
      }

      const checkout = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "VelvetRow",
        description: "Complete your movie ticket booking",
        order_id: data.orderId,
        prefill: {
          name: user.fullName || user.name || "User",
          email: user.emailAddresses?.[0]?.emailAddress || user.email,
          contact: user.phoneNumbers?.[0]?.phoneNumber || "",
        },
        theme: { color: "#f84565" },
        modal: {
          ondismiss: () =>
            toast.info("Payment cancelled. You can resume or cancel this pending booking."),
        },
        handler: async (paymentResponse) => {
          try {
            const { data: verification } = await axios.post(
              "/api/booking/verify-payment",
              { ...paymentResponse, bookingId },
              await getAuthConfig(),
            );
            if (!verification.success) {
              throw new Error(verification.message || "Payment verification failed.");
            }
            toast.success("Payment successful! Booking confirmed.");
            await getMyBookings();
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed. Contact support.",
            );
          }
        },
      });
      checkout.on("payment.failed", (event) => {
        console.error("Razorpay payment failed:", event.error);
        toast.error(event.error?.description || "Razorpay could not complete the payment.");
      });
      checkout.open();
    } catch (error) {
      console.error("Unable to resume payment:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to resume payment.",
      );
      if (error.response?.status === 410) {
        await getMyBookings();
      }
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.delete(
        `/api/booking/${bookingId}`,
        await getAuthConfig(),
      );
      if (!data.success) {
        throw new Error(data.message || "Could not cancel booking.");
      }
      toast.success(data.message);
      await getMyBookings();
    } catch (error) {
      console.error("Unable to cancel booking:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to cancel booking.",
      );
    }
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
          {bookings.map((item) => {
            // Safety check
            if (!item?.show?.movie) return null;

            const movie = item.show.movie;
            const posterUrl = movie.poster_path?.startsWith("http")
              ? movie.poster_path
              : `${image_base_url || ""}${movie.poster_path || ""}`;
            const showStart = new Date(item.show.showDateTime);
            const validUntil = new Date(
              showStart.getTime() + (movie.runtime || 120) * 60 * 1000,
            );
            const ticketAmount =
              (item.amount || 0) / Math.max(item.bookedSeats?.length || 1, 1);

            return (
              <Fragment key={item._id}>
              <div
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
                        e.currentTarget.onerror = null;
                        if (movie.backdrop_path) {
                          e.currentTarget.src = movie.backdrop_path.startsWith("http")
                            ? movie.backdrop_path
                            : `${image_base_url || ""}${movie.backdrop_path}`;
                        }
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
                      <p className="text-gray-300 text-sm mt-3">
                        <span className="font-medium text-white">Theater:</span>{" "}
                        {item.show.theaterName || "Venue details not available"}
                      </p>
                      {item.show.theaterAddress && (
                        <p className="text-gray-400 text-sm mt-1">
                          {item.show.theaterAddress}
                        </p>
                      )}
                      {item.show.theaterMapUrl && (
                        <a
                          href={item.show.theaterMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-1 text-primary hover:underline text-sm"
                        >
                          Open theater location
                        </a>
                      )}
                      <p className="text-gray-400 text-sm mt-2">
                        Booked: {formatDateTime(item.createdAt)}
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
                  {!item.isPaid && (
                    <div className="flex gap-2 mt-3 md:flex-col">
                      <button
                        type="button"
                        onClick={() => continuePayment(item._id)}
                        className="px-3 py-2 rounded-md bg-primary hover:bg-primary-dull text-white text-sm"
                      >
                        Continue payment
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelBooking(item._id)}
                        className="px-3 py-2 rounded-md border border-gray-500 hover:border-red-400 text-sm"
                      >
                        Cancel booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {item.isPaid && (
                <section
                  aria-label={`${movie.title} entry tickets`}
                  className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3"
                >
                  {(item.tickets || []).map((ticket) => (
                    <article
                      key={ticket.ticketId}
                      className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-primary/20 bg-black/30 p-4"
                    >
                      <TicketQRCode ticketId={ticket.ticketId} />
                      <div className="w-full min-w-0 text-sm space-y-2">
                        <h3 className="text-lg font-semibold">
                          {movie.title} · Seat {ticket.seat}
                        </h3>
                        <p className="text-gray-300">
                          <span className="text-gray-500">Theater:</span>{" "}
                          {item.show.theaterName || "Venue details unavailable"}
                        </p>
                        {item.show.theaterAddress && (
                          <p className="text-gray-400">{item.show.theaterAddress}</p>
                        )}
                        {item.show.theaterMapUrl && (
                          <a
                            href={item.show.theaterMapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-primary hover:underline"
                          >
                            Get directions
                          </a>
                        )}
                        <p>
                          <span className="text-gray-500">Show:</span>{" "}
                          {formatDateTime(item.show.showDateTime)}
                        </p>
                        <p>
                          <span className="text-gray-500">Valid until:</span>{" "}
                          {formatDateTime(validUntil)}
                        </p>
                        <p>
                          <span className="text-gray-500">Booking date:</span>{" "}
                          {formatDateTime(item.createdAt)}
                        </p>
                        <p>
                          <span className="text-gray-500">Payment:</span>{" "}
                          <span className="text-green-400">
                            Paid{item.paidAt ? ` · ${formatDateTime(item.paidAt)}` : ""}
                          </span>
                        </p>
                        {item.razorpayPaymentId && (
                          <p className="break-all">
                            <span className="text-gray-500">Payment ID:</span>{" "}
                            {item.razorpayPaymentId}
                          </p>
                        )}
                        <p>
                          <span className="text-gray-500">Ticket amount:</span>{" "}
                          {currency}
                          {ticketAmount.toFixed(2)}
                        </p>
                        {ticket.checkedInAt && (
                          <p className="text-primary">
                            Used at {formatDateTime(ticket.checkedInAt)}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </section>
              )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

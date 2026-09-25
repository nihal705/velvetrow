import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      toast.error("Failed to load show details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select time first");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error("You can only select up to 5 seats");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast.error("This seat is already booked");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId],
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isSelected = selectedSeats.includes(seatId);
          const isOccupied = occupiedSeats.includes(seatId);
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isOccupied}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition text-xs font-medium ${
                isSelected
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-primary/20"
              } ${isOccupied ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`,
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      }
    } catch (error) {}
  };

  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");
      if (!selectedTime) return toast.error("Please select a time");
      if (selectedSeats.length === 0)
        return toast.error("Please select at least one seat");

      setIsProcessing(true);

      // 1. Create booking and get Razorpay order
      const { data } = await axios.post(
        "/api/booking/create",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (!data.success) {
        toast.error(data.message);
        setIsProcessing(false);
        return;
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "VelvetRow",
        description: `Booking for ${selectedSeats.length} seat(s)`,
        order_id: data.orderId,
        prefill: {
          name: user.fullName || user.name || "User",
          email: user.emailAddresses?.[0]?.emailAddress || user.email,
          contact: user.phoneNumbers?.[0]?.phoneNumber || "",
        },
        theme: {
          color: "#f84565",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setIsProcessing(false);
          },
        },
        handler: function (response) {
          // Payment successful - verify with backend
          verifyPayment(response, data.bookingId);
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse, bookingId) => {
    try {
      // Send payment verification to backend
      const { data } = await axios.post(
        "/api/booking/verify-payment",
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId: bookingId,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );

      if (data.success) {
        toast.success("Payment successful! Booking confirmed.");
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    getShow();
  }, []);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  if (isLoading) {
    return <Loading />;
  }

  if (!show) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <p className="text-red-500 text-xl">Show not found</p>
        <button
          onClick={() => navigate("/movies")}
          className="mt-4 px-6 py-2 bg-primary rounded-md hover:bg-primary-dull transition"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  if (!show.dateTime || !show.dateTime[date]) {
    const availableDates = show.dateTime ? Object.keys(show.dateTime) : [];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <p className="text-yellow-500 text-xl">
          No timings available for this date
        </p>
        {availableDates.length > 0 && (
          <p className="text-gray-400 mt-2">
            Available dates: {availableDates.join(", ")}
          </p>
        )}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-primary rounded-md hover:bg-primary-dull transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50 gap-8">
      {/* Available Timings */}
      <div className="w-full md:w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" className="max-w-full" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Selected Seats:{" "}
              <span className="text-primary font-semibold">
                {selectedSeats.join(", ")}
              </span>
            </p>
            <p className="text-gray-400 text-sm">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
        )}

        <button
          onClick={bookTickets}
          disabled={selectedSeats.length === 0 || !selectedTime || isProcessing}
          className="flex items-center gap-1 mt-8 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></span>
              Processing...
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;

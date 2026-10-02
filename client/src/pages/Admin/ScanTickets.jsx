import { useCallback, useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import Title from "../../components/Admin/Title";
import { useAppContext } from "../../context/AppContext";

const ScanTickets = () => {
  const { axios, getToken } = useAppContext();
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const scannerRef = useRef(null);
  const requestInFlight = useRef(false);

  const checkIn = useCallback(async (value) => {
    const submittedTicketId = value.trim();
    if (!submittedTicketId || requestInFlight.current) return;

    requestInFlight.current = true;
    setIsChecking(true);
    setResult(null);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/admin/check-in",
        { ticketId: submittedTicketId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setResult({ success: true, ...data });
      setTicketId("");
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not verify this ticket.";
      setResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsChecking(false);
    }
  }, [axios, getToken]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "ticket-qr-reader",
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1,
        rememberLastUsedCamera: true,
      },
      false,
    );
    scannerRef.current = scanner;
    scanner.render((decodedText) => checkIn(decodedText), () => null);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to stop ticket QR scanner:", error);
      });
      scannerRef.current = null;
    };
  }, [checkIn]);

  return (
    <div className="max-w-4xl">
      <Title text1="Scan" text2="Tickets" />
      <p className="mt-3 text-sm text-gray-400">
        Scan each paid ticket QR once at the theater entrance. Camera access is
        required; use manual entry if the camera is unavailable.
      </p>

      <div className="mt-6 rounded-xl border border-primary/20 bg-black/30 p-3 sm:p-5">
        <div id="ticket-qr-reader" className="mx-auto max-w-lg" />
      </div>

      <form
        className="mt-5 flex flex-col sm:flex-row gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          checkIn(ticketId);
        }}
      >
        <input
          value={ticketId}
          disabled={isChecking || Boolean(result)}
          onChange={(event) => setTicketId(event.target.value)}
          placeholder="Enter ticket code"
          aria-label="Ticket code"
          className="min-w-0 flex-1 rounded-md border border-gray-600 bg-gray-900 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isChecking || Boolean(result) || !ticketId.trim()}
          className="rounded-md bg-primary px-5 py-2 font-medium disabled:opacity-50"
        >
          {isChecking ? "Verifying…" : "Check in"}
        </button>
      </form>

      {result && (
        <>
          <section
            aria-live="polite"
            className={`mt-5 rounded-xl border p-4 ${
              result.success
                ? "border-green-500/40 bg-green-500/10"
                : "border-red-500/40 bg-red-500/10"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                result.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.success ? "Ticket accepted" : "Ticket not accepted"}
            </h2>
            <p className="mt-1">{result.message}</p>
            {result.ticket && (
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-gray-400">Movie</dt>
                  <dd>{result.ticket.movie}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Seat</dt>
                  <dd>{result.ticket.seat}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Theater</dt>
                  <dd>{result.ticket.theaterName || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Show time</dt>
                  <dd>{new Date(result.ticket.showDateTime).toLocaleString()}</dd>
                </div>
              </dl>
            )}
          </section>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setTicketId("");
              requestInFlight.current = false;
            }}
            className="mt-4 rounded-md border border-gray-500 px-4 py-2 hover:border-primary"
          >
            Scan next ticket
          </button>
        </>
      )}
    </div>
  );
};

export default ScanTickets;

import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movie: { type: String, required: true, ref: "Movie" },
  showDateTime: { type: Date, required: true },
  showPrice: { type: Number, required: true },
  theaterName: { type: String, trim: true, default: "" },
  theaterAddress: { type: String, trim: true, default: "" },
  theaterMapUrl: { type: String, trim: true, default: "" },
  occupiedSeats: { type: Object, default: {} },
}, { minimize: false });

export default mongoose.model("Show", showSchema);
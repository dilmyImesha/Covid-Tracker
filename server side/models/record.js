import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
    country: String,
    cca2: String,
    capital: String,
    region: String,
    population: Number,
    currencies: Object,
    flag: String,
    covidStats: Object,
    submittedBy: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Record", recordSchema);

import express from "express";
import Record from "../models/Record.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// SAVE COVID SNAPSHOT
// -----------------------------
router.post("/", requireAuth, async (req, res) => {
    try {
        const payload = req.body;

        if (!payload.country || !payload.covidStats)
            return res.status(400).json({ message: "Invalid data" });

        const newRecord = new Record({
            ...payload,
            submittedBy: req.user.id
        });

        await newRecord.save();

        res.json({ message: "Snapshot saved successfully!", id: newRecord._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// -----------------------------
// GET SAVED SNAPSHOTS
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
    try {
        const filter = {};

        if (req.query.country) {
            filter.country = req.query.country;
        }

        const records = await Record.find(filter).sort({ createdAt: -1 });

        res.json(records);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;

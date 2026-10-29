import { timingSafeEqual } from "node:crypto";
import { rotateBothGenders } from "../services/ootdRotationService.js";

export async function rotateOOTDFromCron(req, res) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(503).json({ success: false, message: "OOTD cron secret is not configured." });

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(req.get("authorization") || "");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    try {
        const results = await rotateBothGenders();
        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Daily OOTD rotation failed:", error);
        return res.status(error.code === "OOTD_BUSY" ? 503 : 500)
            .json({ success: false, message: "Could not complete daily OOTD rotation." });
    }
}

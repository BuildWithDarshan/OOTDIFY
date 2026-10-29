import { randomUUID } from "node:crypto";
import Outfit from "../models/Outfit.js";
import OOTDRotationState from "../models/OOTDRotationState.js";

const INDIA_TIME_ZONE = "Asia/Kolkata";
const LEASE_MS = 30_000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function indiaDayKey(date = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone: INDIA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(date).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function millisecondsUntilNextIndiaMidnight(date = new Date()) {
    // 18:30 UTC is midnight in India on the following calendar day.
    const nextMidnight = Date.parse(`${indiaDayKey(date)}T18:30:00.000Z`);
    return Math.max(1_000, nextMidnight - date.getTime());
}

const featuredAt = (outfit) => outfit.lastOOTDAt || (outfit.isOOTD ? outfit.ootdDate : null);
const age = (value) => value ? new Date(value).getTime() : 0;

export function chooseNextOOTD(outfits, currentId = null) {
    if (!outfits.length) return null;
    const alternatives = outfits.filter((outfit) => String(outfit._id) !== String(currentId));
    const pool = alternatives.length ? alternatives : outfits;
    return [...pool].sort((left, right) =>
        age(featuredAt(left)) - age(featuredAt(right)) ||
        age(left.createdAt) - age(right.createdAt) ||
        String(left._id).localeCompare(String(right._id))
    )[0];
}

async function acquireLease(gender) {
    try {
        await OOTDRotationState.updateOne(
            { _id: gender }, { $setOnInsert: { _id: gender } }, { upsert: true }
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
    }

    const token = randomUUID();
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const now = new Date();
        const claimed = await OOTDRotationState.findOneAndUpdate(
            { _id: gender, $or: [{ leaseUntil: null }, { leaseUntil: { $lte: now } }] },
            { $set: { leaseToken: token, leaseUntil: new Date(now.getTime() + LEASE_MS) } },
            { new: true }
        );
        if (claimed) return token;
        await wait(100);
    }
    const error = new Error(`OOTD rotation is busy for ${gender}. Retry shortly.`);
    error.code = "OOTD_BUSY";
    throw error;
}

async function releaseLease(gender, token) {
    await OOTDRotationState.updateOne(
        { _id: gender, leaseToken: token },
        { $set: { leaseToken: null, leaseUntil: null } }
    );
}

async function featureOutfit(gender, outfitId, now) {
    const current = await Outfit.find({ gender, isOOTD: true }).select("_id lastOOTDAt ootdDate");
    for (const outfit of current) {
        if (!outfit.lastOOTDAt && outfit.ootdDate) {
            await Outfit.updateOne({ _id: outfit._id, lastOOTDAt: null },
                { $set: { lastOOTDAt: outfit.ootdDate } });
        }
    }
    await Outfit.updateMany({ gender, isOOTD: true },
        { $set: { isOOTD: false }, $unset: { ootdDate: "" } });
    const selected = await Outfit.findOneAndUpdate(
        { _id: outfitId, gender, isActive: true },
        { $set: { isOOTD: true, ootdDate: now, lastOOTDAt: now } },
        { new: true }
    );
    if (!selected) throw new Error("The selected OOTD outfit is no longer active.");
    return selected;
}

async function finishDay(gender, token, dayKey, outfitId) {
    const result = await OOTDRotationState.updateOne(
        { _id: gender, leaseToken: token },
        { $set: { dayKey, selectedOutfit: outfitId, leaseToken: null, leaseUntil: null } }
    );
    if (result.matchedCount !== 1) throw new Error("OOTD rotation lease expired before completion.");
}

export async function ensureDailyOOTD(gender, now = new Date()) {
    if (!["men", "women"].includes(gender)) throw new Error("Invalid OOTD gender.");
    const dayKey = indiaDayKey(now);
    const [state, current] = await Promise.all([
        OOTDRotationState.findById(gender),
        Outfit.findOne({ gender, isActive: true, isOOTD: true }).select("_id"),
    ]);
    if (state?.dayKey === dayKey && current) {
        return { gender, dayKey, status: "current", outfitId: current._id };
    }

    const token = await acquireLease(gender);
    try {
        const [lockedState, activeOOTD] = await Promise.all([
            OOTDRotationState.findById(gender),
            Outfit.findOne({ gender, isActive: true, isOOTD: true }).select("_id"),
        ]);
        if (lockedState.dayKey === dayKey && activeOOTD) {
            return { gender, dayKey, status: "current", outfitId: activeOOTD._id };
        }

        const candidates = await Outfit.find({ gender, isActive: true })
            .select("_id createdAt lastOOTDAt ootdDate isOOTD")
            .sort({ createdAt: 1, _id: 1 }).lean();
        const next = chooseNextOOTD(candidates, activeOOTD?._id);
        if (!next) {
            await finishDay(gender, token, dayKey, null);
            return { gender, dayKey, status: "empty", outfitId: null };
        }

        const selected = await featureOutfit(gender, next._id, now);
        await finishDay(gender, token, dayKey, selected._id);
        return { gender, dayKey, status: "rotated", outfitId: selected._id };
    } finally {
        await releaseLease(gender, token);
    }
}

export async function setManualOOTD(outfitId, now = new Date()) {
    const outfit = await Outfit.findOne({ _id: outfitId, isActive: true }).select("_id gender");
    if (!outfit) return null;
    const gender = outfit.gender;
    const token = await acquireLease(gender);
    try {
        const selected = await featureOutfit(gender, outfitId, now);
        await finishDay(gender, token, indiaDayKey(now), selected._id);
        return selected;
    } finally {
        await releaseLease(gender, token);
    }
}

export async function rotateBothGenders(now = new Date()) {
    return Promise.all([ensureDailyOOTD("men", now), ensureDailyOOTD("women", now)]);
}

import test from "node:test";
import assert from "node:assert/strict";
import Outfit from "../models/Outfit.js";
import OOTDRotationState from "../models/OOTDRotationState.js";
import {
    chooseNextOOTD, ensureDailyOOTD, indiaDayKey,
    millisecondsUntilNextIndiaMidnight, setManualOOTD,
} from "../services/ootdRotationService.js";

test("India day changes at 18:30 UTC and the local timer targets midnight", () => {
    const before = new Date("2026-10-29T18:29:59.000Z");
    const after = new Date("2026-10-29T18:30:00.000Z");
    assert.equal(indiaDayKey(before), "2026-10-29");
    assert.equal(indiaDayKey(after), "2026-10-30");
    assert.equal(millisecondsUntilNextIndiaMidnight(before), 1000);
    assert.equal(millisecondsUntilNextIndiaMidnight(after), 86_400_000);
});

test("never featured outfits go first, then the least recently featured", () => {
    const outfits = [
        { _id: "a", createdAt: "2026-01-01", lastOOTDAt: "2026-10-01" },
        { _id: "b", createdAt: "2026-01-02", lastOOTDAt: null },
        { _id: "c", createdAt: "2026-01-03", lastOOTDAt: null },
    ];
    assert.equal(chooseNextOOTD(outfits, "a")._id, "b");
    outfits[1].lastOOTDAt = "2026-10-02";
    assert.equal(chooseNextOOTD(outfits, "b")._id, "c");
    outfits[2].lastOOTDAt = "2026-10-03";
    assert.equal(chooseNextOOTD(outfits, "c")._id, "a");
    assert.equal(chooseNextOOTD([outfits[0]], "a")._id, "a");
    assert.equal(chooseNextOOTD([]), null);
});

function fakeDatabase(t) {
    const outfits = [
        { _id: "men-a", gender: "men", isActive: true, isOOTD: false, createdAt: new Date("2026-01-01"), lastOOTDAt: null },
        { _id: "men-b", gender: "men", isActive: true, isOOTD: false, createdAt: new Date("2026-01-02"), lastOOTDAt: null },
        { _id: "men-c", gender: "men", isActive: true, isOOTD: false, createdAt: new Date("2026-01-03"), lastOOTDAt: null },
        { _id: "women-a", gender: "women", isActive: true, isOOTD: false, createdAt: new Date("2026-01-01"), lastOOTDAt: null },
    ];
    const states = new Map();

    t.mock.method(Outfit, "findOne", (filter) => ({ select: async () => outfits.find((outfit) =>
        (filter._id === undefined || outfit._id === filter._id) &&
        (filter.gender === undefined || outfit.gender === filter.gender) &&
        (filter.isActive === undefined || outfit.isActive === filter.isActive) &&
        (filter.isOOTD === undefined || outfit.isOOTD === filter.isOOTD)
    ) || null }));
    t.mock.method(Outfit, "find", (filter) => ({ select: () => {
        const found = outfits.filter((outfit) => outfit.gender === filter.gender &&
            (filter.isActive === undefined || outfit.isActive === filter.isActive) &&
            (filter.isOOTD === undefined || outfit.isOOTD === filter.isOOTD));
        if (filter.isOOTD) return Promise.resolve(found);
        return { sort: () => ({ lean: async () => found.map((outfit) => ({ ...outfit })) }) };
    } }));
    t.mock.method(Outfit, "updateOne", async (filter, update) => {
        const outfit = outfits.find((candidate) => candidate._id === filter._id);
        if (outfit && !outfit.lastOOTDAt) Object.assign(outfit, update.$set);
        return { matchedCount: outfit ? 1 : 0 };
    });
    t.mock.method(Outfit, "updateMany", async (filter, update) => {
        for (const outfit of outfits.filter((candidate) => candidate.gender === filter.gender && candidate.isOOTD)) {
            Object.assign(outfit, update.$set);
            if (update.$unset?.ootdDate !== undefined) delete outfit.ootdDate;
        }
        return { acknowledged: true };
    });
    t.mock.method(Outfit, "findOneAndUpdate", async (filter, update) => {
        const outfit = outfits.find((candidate) => candidate._id === filter._id && candidate.gender === filter.gender && candidate.isActive);
        if (outfit) Object.assign(outfit, update.$set);
        return outfit || null;
    });

    t.mock.method(OOTDRotationState, "findById", async (gender) => states.get(gender) ? { ...states.get(gender) } : null);
    t.mock.method(OOTDRotationState, "findOneAndUpdate", async (filter, update) => {
        const state = states.get(filter._id);
        if (state.leaseUntil && state.leaseUntil > new Date()) return null;
        Object.assign(state, update.$set);
        return { ...state };
    });
    t.mock.method(OOTDRotationState, "updateOne", async (filter, update) => {
        if (!states.has(filter._id) && update.$setOnInsert) states.set(filter._id, { _id: filter._id, dayKey: "", leaseToken: null, leaseUntil: null });
        const state = states.get(filter._id);
        if (!state || (filter.leaseToken && state.leaseToken !== filter.leaseToken)) return { matchedCount: 0 };
        if (update.$set) Object.assign(state, update.$set);
        return { matchedCount: 1 };
    });
    return { outfits, states };
}

test("daily rotation is idempotent, independent by gender, and respects manual choice until midnight", async (t) => {
    const db = fakeDatabase(t);
    const dayOne = new Date("2026-10-29T18:31:00.000Z");
    assert.equal((await ensureDailyOOTD("men", dayOne)).outfitId, "men-a");
    assert.equal((await ensureDailyOOTD("women", dayOne)).outfitId, "women-a");
    assert.equal((await ensureDailyOOTD("men", dayOne)).status, "current");
    assert.equal((await setManualOOTD("men-c", dayOne))._id, "men-c");
    assert.equal((await ensureDailyOOTD("men", dayOne)).outfitId, "men-c");
    assert.equal(db.outfits.filter((outfit) => outfit.gender === "men" && outfit.isOOTD).length, 1);

    const dayTwo = new Date("2026-10-30T18:31:00.000Z");
    assert.equal((await ensureDailyOOTD("men", dayTwo)).outfitId, "men-b");
    assert.equal(db.outfits.find((outfit) => outfit._id === "men-a").lastOOTDAt?.toISOString(), dayOne.toISOString());
    assert.equal(db.states.get("men").dayKey, "2026-10-31");
    assert.equal((await ensureDailyOOTD("women", dayTwo)).outfitId, "women-a");
});

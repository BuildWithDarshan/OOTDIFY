import test from "node:test";
import assert from "node:assert/strict";
import CommunityOutfit from "../models/CommunityOutfit.js";
import CommunitySave from "../models/CommunitySave.js";
import { getSavedCommunityOutfits } from "../controllers/communityInteractionController.js";

test("creator saved outfits paginate by upload date, newest first", async (t) => {
    const records = [
        { _id: "old", createdAt: new Date("2026-01-01"), isVisible: true },
        { _id: "new", createdAt: new Date("2026-03-01"), isVisible: true },
        { _id: "middle", createdAt: new Date("2026-02-01"), isVisible: true },
    ];
    t.mock.method(CommunitySave, "distinct", async (field, query) => {
        assert.equal(field, "outfit");
        assert.equal(query.user, "creator-id");
        return ["old", "new", "middle"];
    });
    t.mock.method(CommunityOutfit, "find", (query) => {
        assert.equal(query.isVisible, true);
        const matching = records.filter((record) => query._id.$in.includes(record._id));
        let skip = 0;
        let limit = matching.length;
        return {
            sort(order) {
                assert.deepEqual(order, { createdAt: -1, _id: -1 });
                matching.sort((left, right) => right.createdAt - left.createdAt ||
                    right._id.localeCompare(left._id));
                return this;
            },
            skip(value) { skip = value; return this; },
            limit(value) { limit = value; return this; },
            populate() { return Promise.resolve(matching.slice(skip, skip + limit)); },
        };
    });
    t.mock.method(CommunityOutfit, "countDocuments", async () => records.length);

    const requestPage = async (page) => {
        let response;
        const res = {
            status(code) { assert.equal(code, 200); return this; },
            json(body) { response = body; return this; },
        };
        await getSavedCommunityOutfits(
            { query: { order: "outfitLatest", page, limit: 2 }, user: { id: "creator-id" } },
            res,
            (error) => { throw error; },
        );
        return response;
    };

    const first = await requestPage(1);
    const second = await requestPage(2);
    assert.deepEqual(first.outfits.map((outfit) => outfit._id), ["new", "middle"]);
    assert.deepEqual(second.outfits.map((outfit) => outfit._id), ["old"]);
    assert.equal(first.pagination.hasMore, true);
    assert.equal(second.pagination.hasMore, false);
});

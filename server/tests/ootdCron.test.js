import test from "node:test";
import assert from "node:assert/strict";
import { rotateOOTDFromCron } from "../controllers/ootdCronController.js";

function response() {
    return {
        code: null,
        body: null,
        status(code) { this.code = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

test("OOTD cron refuses requests when its secret is not configured", async () => {
    const original = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    try {
        const res = response();
        await rotateOOTDFromCron({ get: () => "" }, res);
        assert.equal(res.code, 503);
    } finally {
        if (original === undefined) delete process.env.CRON_SECRET;
        else process.env.CRON_SECRET = original;
    }
});

test("OOTD cron rejects a missing or incorrect bearer token", async () => {
    const original = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "a-long-test-secret-for-cron";
    try {
        for (const token of ["", "Bearer wrong-secret"]) {
            const res = response();
            await rotateOOTDFromCron({ get: () => token }, res);
            assert.equal(res.code, 401);
        }
    } finally {
        if (original === undefined) delete process.env.CRON_SECRET;
        else process.env.CRON_SECRET = original;
    }
});

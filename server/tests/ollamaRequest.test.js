import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { requestOllamaAnalysis } from "../services/ollamaRequestService.js";

test("waits for delayed Ollama response headers", async () => {
    const server = createServer((_req, res) => {
        setTimeout(() => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ response: "{}", done_reason: "stop" }));
        }, 120);
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    try {
        const { port } = server.address();
        const result = await requestOllamaAnalysis(
            { model: "test", stream: false }, 500, `http://127.0.0.1:${port}/`
        );
        assert.equal(result.statusCode, 200);
        assert.equal(JSON.parse(result.body).response, "{}");
    } finally {
        server.close();
    }
});

test("reports the configured analysis deadline", async () => {
    const server = createServer((_req, res) => {
        setTimeout(() => res.end("late"), 200);
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    try {
        const { port } = server.address();
        await assert.rejects(
            requestOllamaAnalysis({}, 30, `http://127.0.0.1:${port}/`),
            { code: "OLLAMA_TIMEOUT" }
        );
    } finally {
        server.close();
    }
});

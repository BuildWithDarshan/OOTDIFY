import { request } from "node:http";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

export function requestOllamaAnalysis(payload, timeoutMs = 600_000, url = OLLAMA_URL) {
    const body = JSON.stringify(payload);
    return new Promise((resolve, reject) => {
        const req = request(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
            },
        }, (res) => {
            let responseBody = "";
            let responseBytes = 0;
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                responseBytes += Buffer.byteLength(chunk);
                if (responseBytes > MAX_RESPONSE_BYTES) {
                    req.destroy(Object.assign(new Error("Ollama response was too large."), {
                        code: "OLLAMA_RESPONSE_TOO_LARGE",
                    }));
                    return;
                }
                responseBody += chunk;
            });
            res.on("end", () => {
                clearTimeout(timer);
                resolve({ statusCode: res.statusCode, body: responseBody });
            });
            res.on("error", (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });

        const timer = setTimeout(() => {
            req.destroy(Object.assign(new Error("Ollama analysis timed out."), {
                code: "OLLAMA_TIMEOUT",
            }));
        }, timeoutMs);

        req.on("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });
        req.end(body);
    });
}

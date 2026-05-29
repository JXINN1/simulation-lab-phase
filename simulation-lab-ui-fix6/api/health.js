// /api/health.js — Health check & Gemini connectivity test
// GET /api/health → basic health
// GET /api/health?test=gemini → tests Gemini API key validity

import { GoogleGenAI } from "@google/genai";

const IS_DEV = process.env.NODE_ENV !== "production";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET only" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      GEMINI_API_KEY: apiKey ? `set (${apiKey.slice(0, 8)}…)` : "NOT SET ⚠️",
      GEMINI_MODEL: modelName,
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  };

  // Quick Gemini test if requested
  if (req.query.test === "gemini") {
    if (!apiKey) {
      return res.status(500).json({ ...health, geminiTest: { success: false, error: "GEMINI_API_KEY not set" } });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: 'Reply with exactly: {"status":"ok"}' }] }],
        config: { maxOutputTokens: 32, temperature: 0 },
      });

      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text
        || (typeof response?.text === "string" ? response.text : null);

      health.geminiTest = {
        success: true,
        model: modelName,
        response: text?.slice(0, 100) || "(empty)",
      };
    } catch (err) {
      health.geminiTest = {
        success: false,
        error: IS_DEV ? err.message : "Gemini API call failed",
      };
      return res.status(502).json(health);
    }
  }

  return res.status(200).json(health);
}

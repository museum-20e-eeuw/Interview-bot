import fs from "node:fs";
import path from "node:path";

export const handler = async () => {
  let mode = "web";
  try {
    const configPad = path.resolve(process.cwd(), "config.json");
    if (fs.existsSync(configPad)) {
      const data = JSON.parse(fs.readFileSync(configPad, "utf-8"));
      const raw = String(data.mode || data.modus || "web").trim().toLowerCase();
      mode = raw === "zuil" ? "zuil" : "web";
    }
  } catch {
    mode = "web";
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ mode }),
  };
};

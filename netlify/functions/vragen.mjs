import fs from "node:fs";
import path from "node:path";

const STANDAARD_VRAGEN = [
  "Is dit uw eerste bezoek aan ons?",
  "Wat is de reden van uw bezoek vandaag?",
  "Heeft u alles gevonden wat u zocht?",
  "Heeft u nog suggesties of opmerkingen voor ons?",
];

export const handler = async () => {
  let regels = [];
  try {
    const vragenPad = path.resolve(process.cwd(), "vragen.txt");
    const inhoud = fs.readFileSync(vragenPad, "utf-8");
    regels = inhoud.split(/\r?\n/);
  } catch {
    regels = [];
  }

  const vragen = regels
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && !r.startsWith("#"));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      vragen: vragen.length > 0 ? vragen : STANDAARD_VRAGEN,
    }),
  };
};


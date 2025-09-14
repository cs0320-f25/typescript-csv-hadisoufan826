// src/run-parser.ts
import { parseCSV } from "./basic-parser";
import { z } from "zod";

const DATA_FILE = "./data/people.csv"; // same file with "Bob,thirty"

async function main() {
  // 1) Old behavior (no schema) — just to show it still works
  const results = await parseCSV(DATA_FILE);
  console.log("RAW rows:");
  for (const record of results) console.log(record);

  // 2) Schema path — this should THROW because of "thirty"
  const PersonRow = z
    .tuple([z.string(), z.coerce.number()])        // "23" -> 23, "thirty" -> error
    .transform(([name, age]) => ({ name, age }));  // typed object

  try {
    const typed = await parseCSV(DATA_FILE, PersonRow); // header is skipped in your impl
    console.log("\nTYPED rows (should not reach here):", typed);
  } catch (e) {
    console.error("\nValidation error:");
    if (e instanceof Error) {
      console.error(e.message);
      const details = (e as any).details; // you attached this in parseCSV
      if (Array.isArray(details)) {
        for (const d of details) {
          console.error(`row ${d.row}: ${JSON.stringify(d.raw)} — ${d.issues}`);
        }
      }
    } else {
      console.error(e);
    }
  }
}

main();

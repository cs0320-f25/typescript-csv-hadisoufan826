import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const STUDENTS_CSV_PATH = path.join(__dirname, "../data/students.csv");
const FRUIT_CSV_PATH  = path.join(__dirname, "../data/fruits.csv");
const CHIPS_CSV_PATH  = path.join(__dirname, "../data/chips.csv");

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

test("parseCSV keeps commas inside quotes as part of one field", async () => {
  const results = await parseCSV(FRUIT_CSV_PATH)

  expect(results[0]).toEqual(["fruit", "color", "shape"])

  expect(results[1]).toEqual(["orange", "orange", "circle"]);
  expect(results[2]).toEqual(["apple", "red,yellow,green", "circle"]);
  expect(results[3]).toEqual(["grape", "purple,green", "oval"]);
});

test("parseCSV keeps empty fields as empty strings", async () => {
  const results = await parseCSV(STUDENTS_CSV_PATH)

  expect(results[0]).toEqual(["name", "score", "grade"])
  expect(results[1]).toEqual(["James", "93", "A"]);
  expect(results[2]).toEqual(["Bob", "71", "C"]);
  expect(results[3]).toEqual(["Sam", "", "F"]);
});

test("parseCSV ignores whitespace and trims", async () => {
  const results = await parseCSV(CHIPS_CSV_PATH)

  expect(results[0]).toEqual(["brand", "flavor"])
  expect(results[1]).toEqual(["lays", "bbq"]);
  expect(results[2]).toEqual(["ruffles", "cheddar"]);
});

test("parseCSV with schema returns typed objects (students.csv)", async () => {
  const GradeRow = z
    .tuple([z.string(), z.coerce.number(), z.string()])
    .transform(([name, score, grade]) => ({ name, score, grade }));

  const out = await parseCSV(STUDENTS_CSV_PATH, GradeRow);

  expect(out[0]).toEqual({ name: "James", score: 93, grade: "A" });
  expect(out[1]).toEqual({ name: "Bob",   score: 71, grade: "C" });
  expect(out[2]).toEqual({ name: "Sam",   score: 0,  grade: "F" });
});

test("parseCSV with schema throws on invalid data (people.csv)", async () => {
  const PersonRow = z
    .tuple([z.string(), z.coerce.number()])
    .transform(([name, age]) => ({ name, age }));

  await expect(parseCSV(PEOPLE_CSV_PATH, PersonRow))
    .rejects.toThrow(/CSV schema validation failed/);
});

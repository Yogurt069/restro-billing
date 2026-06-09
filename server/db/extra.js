import Database from "better-sqlite3";

const db = new Database("cafe.db");

const stmt = db.prepare("SELECT * FROM tables");
const rows = stmt.all();

console.log(rows);
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "..", "report.db");

const db = new DatabaseSync(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        created_at TEXT NOT NULL,
        report_date TEXT UNIQUE NOT NULL
    );
`);

console.log("Reports table ready.");

db.close();
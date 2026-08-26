const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.join(__dirname, "..", "report.db");
const booksPath = path.join(__dirname, "..", "data", "books.json");

const db = new DatabaseSync(dbPath);

db.exec(`
    DROP TABLE IF EXISTS books;

    CREATE TABLE books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        rating INTEGER NOT NULL,
        url TEXT NOT NULL
    );
`);

const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));

const ratingMap = {
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5
};

const insert = db.prepare(`
    INSERT INTO books (title, price, rating, url)
    VALUES (?, ?, ?, ?)
`);

for (const book of books) {
    insert.run(
        book.title,
        book.price_gbp,
        ratingMap[book.rating_text],
        book.product_url
    );
}

const result = db
    .prepare("SELECT COUNT(*) AS count FROM books")
    .get();

console.log(`Seeded ${result.count} books.`);

db.close();
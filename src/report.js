const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "..", "report.db");

function getReportData() {
    const db = new DatabaseSync(dbPath);

    const totalBooks = db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM books
        `)
        .get();

    const averagePrice = db
        .prepare(`
            SELECT AVG(price) AS average
            FROM books
        `)
        .get();

    const topBooks = db
        .prepare(`
            SELECT title, price, rating, url
            FROM books
            ORDER BY price DESC
            LIMIT 5
        `)
        .all();

    const booksByRating = db
        .prepare(`
            SELECT rating, COUNT(*) AS count
            FROM books
            GROUP BY rating
            ORDER BY rating
        `)
        .all();

    db.close();

    return {
        totalBooks: totalBooks.count,
        averagePrice: averagePrice.average,
        topBooks,
        booksByRating
    };
}

module.exports = { getReportData };
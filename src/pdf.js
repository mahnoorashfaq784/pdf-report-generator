const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function generateTestPdf(reportData) {
    const browser = await chromium.launch();

    const page = await browser.newPage();

    const today = new Date().toISOString().split("T")[0];

    const rows = reportData.topBooks
        .map(
            (book) => `
                <tr>
                    <td>${book.title}</td>
                    <td>£${book.price.toFixed(2)}</td>
                    <td>${book.rating}</td>
                </tr>
            `
        )
        .join("");

    const ratingRows = reportData.booksByRating
        .map(
            (item) => `
                <tr>
                    <td>${item.rating} stars</td>
                    <td>${item.count}</td>
                </tr>
            `
        )
        .join("");

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">

            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    color: #222;
                }

                h1 {
                    margin-bottom: 5px;
                }

                .date {
                    color: #666;
                    margin-bottom: 25px;
                }

                .summary {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 30px;
                }

                .card {
                    border: 1px solid #ddd;
                    padding: 15px;
                    width: 180px;
                }

                .number {
                    font-size: 24px;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    margin-bottom: 30px;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }

                thead {
                    display: table-header-group;
                }

                tr {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                h2 {
                    margin-top: 25px;
                }
            </style>
        </head>

        <body>
            <h1>Bookstore Report</h1>
            <div class="date">Generated: ${today}</div>

            <div class="summary">
                <div class="card">
                    <div>Total Books</div>
                    <div class="number">${reportData.totalBooks}</div>
                </div>

                <div class="card">
                    <div>Average Price</div>
                    <div class="number">
                        £${reportData.averagePrice.toFixed(2)}
                    </div>
                </div>
            </div>

            <h2>Top 5 Most Expensive Books</h2>

            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Rating</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>

            <h2>Books by Star Rating</h2>

            <table>
                <thead>
                    <tr>
                        <th>Rating</th>
                        <th>Number of Books</th>
                    </tr>
                </thead>

                <tbody>
                    ${ratingRows}
                </tbody>
            </table>

            <h2>All Books</h2>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Rating</th>
                    </tr>
                </thead>

                <tbody>
                    ${reportData.allBooks
                        .map(
                            (book, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${book.title}</td>
                                    <td>£${book.price.toFixed(2)}</td>
                                    <td>${book.rating}</td>
                                </tr>
                            `
                        )
                        .join("")}
                </tbody>
            </table>
        </body>
        </html>
    `;

    fs.mkdirSync(path.join(__dirname, "..", "reports"), {
        recursive: true
    });

    await page.setContent(html);

    await page.pdf({
        path: path.join(__dirname, "..", "reports", "test.pdf"),
        format: "A4",
        printBackground: true
    });

    await browser.close();

    console.log("PDF generated: reports/test.pdf");
}

module.exports = { generateTestPdf };
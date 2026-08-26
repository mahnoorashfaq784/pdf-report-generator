

````markdown
# PDF Report Generator

A Node.js backend that generates a daily PDF report from bookstore data stored in SQLite.

The application:

- Stores scraped book data in SQLite
- Calculates report statistics
- Generates an A4 PDF using Playwright
- Stores generated report metadata in SQLite
- Provides API endpoints to create, view, and download reports
- Prevents duplicate reports from being generated on the same day
- Returns appropriate errors for missing reports

---

## Features

### Book Data

The project uses bookstore data collected from Books to Scrape.

The dataset contains 60 books with information including:

- Title
- Price in GBP
- Star rating
- Product URL

The source data is stored in:

```text
data/books.json
````

---

## Report Contents

Each generated PDF contains:

### Summary

* Total number of books
* Average book price

### Top 5 Most Expensive Books

Displays:

* Book title
* Price
* Rating

### Books by Star Rating

Displays the number of books for each rating:

* 1 star
* 2 stars
* 3 stars
* 4 stars
* 5 stars

### All Books

Displays all books with:

* Number
* Title
* Price
* Rating

---

## Technology Stack

* Node.js
* Express
* SQLite
* Playwright
* JavaScript
* HTML/CSS
* PowerShell/cURL for API testing

---

## Project Structure

```text
pdf-report-generator/
│
├── data/
│   └── books.json
│
├── reports/
│   ├── generated PDF files
│   └── test.pdf
│
├── scripts/
│   ├── seed.js
│   ├── setup-reports.js
│   ├── test-pdf.js
│   └── test-report.js
│
├── src/
│   ├── pdf.js
│   ├── report.js
│   └── server.js
│
├── report.db
├── package.json
└── README.md
```

---

# Installation

## 1. Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd pdf-report-generator
```

## 2. Install dependencies

```bash
npm install
```

## 3. Install Playwright browser

If Playwright browsers have not already been installed:

```bash
npx playwright install chromium
```

---

# Database Setup

The project uses SQLite.

The database file is:

```text
report.db
```

The database contains two main tables:

### `books`

Stores the bookstore dataset.

Fields include:

* `id`
* `title`
* `price`
* `rating`
* `url`

### `reports`

Stores generated report metadata.

Fields include:

* `id`
* `path`
* `created_at`
* `report_date`

`report_date` is unique so that only one report can be generated per day.

---

## Initialize the Reports Table

Run:

```bash
node scripts/setup-reports.js
```

Expected output:

```text
Reports table ready.
```

---

## Seed the Books

Run:

```bash
node scripts/seed.js
```

Expected output:

```text
Seeded 60 books.
```

---

# Running the Server

Start the application with:

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

Expected output:

```text
Server running at http://localhost:3000
```

---

# API Endpoints

## Create a Report

### Request

```http
POST /reports
```

Example:

```bash
curl.exe -i -X POST http://localhost:3000/reports
```

### First request

A new report is generated.

Expected response:

```http
HTTP/1.1 201 Created
```

Example:

```json
{
  "id": 1,
  "file": "/reports/1/file"
}
```

The generated PDF is stored in the `reports` directory.

---

## Create Report Again on the Same Day

Calling:

```http
POST /reports
```

again on the same day does not generate another report.

Instead, the existing report is returned.

Expected response:

```http
HTTP/1.1 200 OK
```

Example:

```json
{
  "id": 1,
  "file": "/reports/1/file"
}
```

This provides daily idempotency.

---

# Get Report Metadata

### Request

```http
GET /reports/:id
```

Example:

```bash
curl.exe http://localhost:3000/reports/1
```

Example response:

```json
{
  "id": 1,
  "path": "/reports/1/file",
  "created_at": "2026-08-26T10:00:47.303Z"
}
```

---

# Download a Report PDF

### Request

```http
GET /reports/:id/file
```

Example:

```bash
curl.exe -o my-report.pdf http://localhost:3000/reports/1/file
```

The response is a PDF file.

Expected response headers include:

```text
HTTP/1.1 200 OK
Content-Type: application/pdf
```

---

# Error Handling

If a requested report does not exist:

```bash
curl.exe -i http://localhost:3000/reports/9999
```

the API returns:

```http
404 Not Found
```

The PDF endpoint also returns `404 Not Found` when the report does not exist:

```bash
curl.exe -i http://localhost:3000/reports/9999/file
```

The server should remain running after these requests.

---

# PDF Generation

PDF generation is handled by Playwright.

The report is rendered as HTML and converted to an A4 PDF.

The PDF includes:

* A4 page formatting
* Report generation date
* Summary cards
* Tables
* Repeating table headers
* Page-break protection for table rows

The main PDF generation logic is located in:

```text
src/pdf.js
```

---

# Report Data

Report calculations are handled in:

```text
src/report.js
```

The report data includes:

* Total number of books
* Average price
* Five most expensive books
* Books grouped by rating
* Complete book list

---

# Testing

## Test PDF Generation

The project includes a PDF generation test:

```bash
node scripts/test-pdf.js
```

A test PDF is generated in:

```text
reports/test.pdf
```

---

## Test Report Data

Run:

```bash
node scripts/test-report.js
```

This verifies the report data calculations.

---

# API Testing Example

A complete report workflow can be tested with:

### 1. Create report

```bash
curl.exe -i -X POST http://localhost:3000/reports
```

### 2. Get report metadata

```bash
curl.exe -i http://localhost:3000/reports/1
```

### 3. Download report

```bash
curl.exe -o my-report.pdf http://localhost:3000/reports/1/file
```

### 4. Request the same report again

```bash
curl.exe -i -X POST http://localhost:3000/reports
```

The second request on the same day should return the existing report rather than generating a duplicate.

### 5. Test missing report

```bash
curl.exe -i http://localhost:3000/reports/9999
```

Expected:

```text
404 Not Found
```

---

# Generated Files

Generated reports are stored in:

```text
reports/
```

For example:

```text
reports/
├── 1.pdf
├── 2.pdf
└── test.pdf
```

The report ID corresponds to the database record.

---

# Daily Idempotency

The application ensures that only one report is generated for a given date.

The `reports` table uses:

```sql
report_date TEXT UNIQUE NOT NULL
```

When a report is requested:

1. The current date is checked.
2. If a report already exists for that date, it is returned.
3. If no report exists, a new PDF is generated.
4. The report metadata is stored in SQLite.
5. The new report ID and file path are returned.

This prevents duplicate daily reports.

---

# Example Successful Workflow

```text
POST /reports
       │
       ▼
Check report_date
       │
       ├── Report exists ──────► Return existing report
       │
       └── Report does not exist
                    │
                    ▼
              Read book data
                    │
                    ▼
             Calculate statistics
                    │
                    ▼
              Generate PDF
                    │
                    ▼
             Save PDF file
                    │
                    ▼
            Save DB metadata
                    │
                    ▼
             Return report ID
```

---

# Requirements

* Node.js 24+
* npm
* Chromium browser installed through Playwright

---

# Author

Created as part of the backend internship assignment.

````

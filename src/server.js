const express = require("express");
const path = require("path");

const { getReportData } = require("./report");
const { generateTestPdf } = require("./pdf");

const { DatabaseSync } = require("node:sqlite");

const app = express();
const PORT = 3000;

app.use(express.json());

const dbPath = path.join(__dirname, "..", "report.db");

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
    try {
        const reportData = getReportData();

        const db = new DatabaseSync(dbPath);

        const reportId = db
            .prepare(`
                INSERT INTO reports (path, created_at)
                VALUES (?, ?)
            `)
            .run(
                "",
                new Date().toISOString()
            ).lastInsertRowid;

        const reportPath = path.join(
            __dirname,
            "..",
            "reports",
            `${reportId}.pdf`
        );

        await generateTestPdf(reportData, reportPath);

        const relativePath = `/reports/${reportId}/file`;

        db.prepare(`
            UPDATE reports
            SET path = ?
            WHERE id = ?
        `).run(relativePath, reportId);

        db.close();

        res.status(201).json({
            id: Number(reportId),
            file: relativePath
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to generate report"
        });
    }
});

app.get("/reports/:id", (req, res) => {
    const db = new DatabaseSync(dbPath);

    const report = db
        .prepare(`
            SELECT id, path, created_at
            FROM reports
            WHERE id = ?
        `)
        .get(Number(req.params.id));

    db.close();

    if (!report) {
        return res.status(404).json({
            error: "Report not found"
        });
    }

    res.json(report);
});

app.get("/reports/:id/file", (req, res) => {
    const db = new DatabaseSync(dbPath);

    const report = db
        .prepare(`
            SELECT id
            FROM reports
            WHERE id = ?
        `)
        .get(Number(req.params.id));

    db.close();

    if (!report) {
        return res.status(404).json({
            error: "Report not found"
        });
    }

    const filePath = path.join(
        __dirname,
        "..",
        "reports",
        `${report.id}.pdf`
    );

    res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
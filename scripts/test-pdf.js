const { getReportData } = require("../src/report");
const { generateTestPdf } = require("../src/pdf");

async function main() {
    const reportData = getReportData();

    await generateTestPdf(reportData);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
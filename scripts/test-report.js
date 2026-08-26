const { getReportData } = require("../src/report");

const report = getReportData();

console.log(JSON.stringify(report, null, 2));
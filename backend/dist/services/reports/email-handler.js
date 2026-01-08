"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailReportHandler = void 0;
const service_1 = require("./service");
const service_2 = require("../email/service");
const emailReportHandler = async (shopId, email, timeframe, date = new Date()) => {
    try {
        console.log(`Generating ${timeframe} report PDF for email to ${email}...`);
        // 1. Generate PDF Buffer using existing service
        const pdfBuffer = await (0, service_1.generatePDFReport)(shopId, { timeframe, date });
        // 2. Prepare Email Content
        const dateStr = date.toLocaleDateString();
        const subject = `Your ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Sales Report - ${dateStr}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Sales Report</h2>
                <p>Hello,</p>
                <p>Please find attached your sales report for <b>${dateStr}</b>.</p>
                <p>This report includes your sales summary and transaction details for the selected period.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The Kirata Team</strong></p>
            </div>
        `;
        // 3. Send Email
        await service_2.emailService.sendMail({
            to: email,
            subject,
            html,
            attachments: [{
                    filename: `report-${timeframe}-${dateStr.replace(/\//g, '-')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
        });
        console.log(`Report emailed successfully to ${email}`);
        return { success: true };
    }
    catch (error) {
        console.error('Failed to handle email report:', error);
        throw error;
    }
};
exports.emailReportHandler = emailReportHandler;

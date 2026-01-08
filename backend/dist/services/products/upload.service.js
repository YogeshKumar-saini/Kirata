"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBulkImport = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = require("csv-parse");
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
const processBulkImport = async (filePath, shopId) => {
    const result = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
    };
    const productsToCreate = [];
    let currentRow = 0;
    const parser = fs_1.default.createReadStream(filePath).pipe((0, csv_parse_1.parse)({
        columns: true,
        skip_empty_lines: true,
        trim: true
    }));
    for await (const row of parser) {
        currentRow++;
        try {
            // Basic Validation
            if (!row.name || !row.price || !row.stock) {
                throw new Error('Missing required fields: name, price, or stock');
            }
            const price = parseFloat(row.price);
            if (isNaN(price) || price < 0)
                throw new Error('Invalid price');
            const stock = parseInt(row.stock);
            if (isNaN(stock) || stock < 0)
                throw new Error('Invalid stock');
            const costPrice = row.costPrice ? parseFloat(row.costPrice) : undefined;
            const mrp = row.mrp ? parseFloat(row.mrp) : undefined;
            productsToCreate.push({
                shopId,
                name: row.name,
                category: row.category || null,
                price,
                stock,
                description: row.description || null,
                barcode: row.barcode || null,
                costPrice: costPrice || null,
                mrp: mrp || null,
                isActive: true
            });
        }
        catch (error) {
            result.failed++;
            result.errors.push({
                row: currentRow,
                error: error.message,
                data: row
            });
        }
    }
    result.total = currentRow;
    if (productsToCreate.length > 0) {
        // Batch Insert
        try {
            // Note: createMany is not supported by SQLite if we were using it, 
            // but for Postgres/MySQL it is.
            // Using transaction to ensure data integrity is better, but allow partial success for bulk is often preferred.
            // Here we do a single batch insert for performance.
            const created = await database_1.prisma.product.createMany({
                data: productsToCreate,
                skipDuplicates: true // Optional: skip if unique constraint violated (e.g. barcode)
            });
            result.success = created.count;
            // If skipDuplicates skipped some, we might want to know, but createMany validation is limited.
            // The difference between productsToCreate.length and created.count could indicate skipped dupes.
            if (created.count < productsToCreate.length) {
                // Approximate generic error for duplicates
                const skipped = productsToCreate.length - created.count;
                // We don't increment failure count here as they were technically valid rows but duplicates.
                logger_1.logger.info(`Skipped ${skipped} duplicate products during import.`);
            }
        }
        catch (error) {
            logger_1.logger.error('Bulk insert failed', error);
            // If the whole batch fails
            result.failed += productsToCreate.length;
            result.success = 0;
            result.errors.push({
                row: 0,
                error: 'Database batch insert failed: ' + error.message,
                data: {}
            });
        }
    }
    // Cleanup file
    try {
        fs_1.default.unlinkSync(filePath);
    }
    catch (e) {
        logger_1.logger.warn('Failed to delete temp upload file', e);
    }
    return result;
};
exports.processBulkImport = processBulkImport;

import fs from 'fs';
import { parse } from 'csv-parse';
import { prisma } from '../../shared/database';
import { ApiError } from '../../shared/errors/ApiError';
import { logger } from '../../shared/utils/logger';

interface ProductCSVRow {
    name: string;
    category?: string;
    price: string;
    stock: string;
    description?: string;
    barcode?: string;
    costPrice?: string;
    mrp?: string;
}

interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string; data: any }>;
}

export const processBulkImport = async (filePath: string, shopId: string): Promise<ImportResult> => {
    const result: ImportResult = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
    };

    const productsToCreate: any[] = [];
    let currentRow = 0;

    const parser = fs.createReadStream(filePath).pipe(
        parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        })
    );

    for await (const row of parser) {
        currentRow++;
        try {
            // Basic Validation
            if (!row.name || !row.price || !row.stock) {
                throw new Error('Missing required fields: name, price, or stock');
            }

            const price = parseFloat(row.price);
            if (isNaN(price) || price < 0) throw new Error('Invalid price');

            const stock = parseInt(row.stock);
            if (isNaN(stock) || stock < 0) throw new Error('Invalid stock');

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

        } catch (error: any) {
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
            const created = await prisma.product.createMany({
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
                logger.info(`Skipped ${skipped} duplicate products during import.`);
            }

        } catch (error: any) {
            logger.error('Bulk insert failed', error);
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
        fs.unlinkSync(filePath);
    } catch (e) {
        logger.warn('Failed to delete temp upload file', e);
    }

    return result;
};

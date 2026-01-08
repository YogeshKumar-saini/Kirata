"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../errors/ApiError");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            console.error('Validation Errors:', JSON.stringify(errors, null, 2));
            console.error('Request Body:', JSON.stringify(req.body, null, 2));
            next(new ApiError_1.ApiError(400, 'Validation Error', errors));
        }
        else {
            next(error);
        }
    }
};
exports.validate = validate;

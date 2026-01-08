"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../ingestion/controller");
const router = (0, express_1.Router)();
// --- WEBHOOK ROUTES ---
router.get('/webhook', controller_1.verifyWebhook);
router.post('/webhook', controller_1.handleWebhook);
exports.default = router;

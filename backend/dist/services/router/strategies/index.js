"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategies = void 0;
const ShopkeeperStrategies_1 = require("./ShopkeeperStrategies");
const CustomerStrategies_1 = require("./CustomerStrategies");
exports.strategies = [
    new ShopkeeperStrategies_1.SaleStrategy(),
    new ShopkeeperStrategies_1.UdhaarStrategy(),
    new CustomerStrategies_1.OrderStrategy(),
    new CustomerStrategies_1.OrderStatusStrategy()
];

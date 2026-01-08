import { SaleStrategy, UdhaarStrategy } from './ShopkeeperStrategies';
import { OrderStrategy, OrderStatusStrategy } from './CustomerStrategies';

export const strategies = [
    new SaleStrategy(),
    new UdhaarStrategy(),
    new OrderStrategy(),
    new OrderStatusStrategy()
];

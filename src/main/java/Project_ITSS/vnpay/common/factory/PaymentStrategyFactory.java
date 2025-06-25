package Project_ITSS.vnpay.common.factory;

import Project_ITSS.vnpay.common.strategy.PaymentStrategy;

/**
 * Factory Pattern cho Payment Strategy Creation
 * Tạo payment strategy dựa trên provider type
 */
public interface PaymentStrategyFactory {
    PaymentStrategy createStrategy(String providerType);
} 
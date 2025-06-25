package Project_ITSS.vnpay.common.factory;

import Project_ITSS.vnpay.common.strategy.PaymentStrategy;
import Project_ITSS.vnpay.common.strategy.VNPayStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Implementation của PaymentStrategyFactory
 * Tạo payment strategy dựa trên provider type
 */
@Component
public class PaymentStrategyFactoryImpl implements PaymentStrategyFactory {

    @Autowired
    private VNPayStrategy vnPayStrategy;

    @Override
    public PaymentStrategy createStrategy(String providerType) {
        switch (providerType.toLowerCase()) {
            case "vnpay":
                return vnPayStrategy;
            case "momo":
                // TODO: Implement MoMo strategy
                throw new IllegalArgumentException("MoMo payment provider not implemented yet");
            case "zalopay":
                // TODO: Implement ZaloPay strategy
                throw new IllegalArgumentException("ZaloPay payment provider not implemented yet");
            default:
                throw new IllegalArgumentException("Unsupported payment provider: " + providerType);
        }
    }
} 
package Project_ITSS.PlaceOrder.Factory;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy;
import Project_ITSS.PlaceOrder.Strategy.VNPayPaymentStrategy;
import Project_ITSS.PlaceOrder.Strategy.CreditCardPaymentStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Factory class to select the appropriate payment strategy
 * Implements Factory Pattern along with Strategy Pattern
 */
@Service
public class PaymentStrategyFactory {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentStrategyFactory.class);
    
    @Autowired
    private List<PaymentStrategy> paymentStrategies;

    @Autowired
    private IOrderRepository orderRepository;
    
    /**
     * Get the appropriate payment strategy based on order
     */
    public PaymentStrategy getStrategy(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        
        // Try to find strategy that can handle this order
        for (PaymentStrategy strategy : paymentStrategies) {
            if (strategy.canHandleOrder(order.getOrder_id())) {
                logger.info("Selected payment strategy: {} for order: {}", 
                    strategy.getPaymentMethodName(), order.getOrder_id());
                return strategy;
            }
        }
        
        // Default to VNPay if no strategy can handle
        logger.warn("No specific strategy found for order: {}, defaulting to VNPay", order.getOrder_id());
        return paymentStrategies.stream()
            .filter(strategy -> strategy instanceof VNPayPaymentStrategy)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No VNPay strategy available"));
    }
    
    /**
     * Get the appropriate payment strategy based on order ID
     */
    public PaymentStrategy getStrategy(long orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        return getStrategy(order);
    }
    
    /**
     * Get all available payment strategies
     */
    public List<PaymentStrategy> getAllStrategies() {
        return paymentStrategies;
    }
    
    /**
     * Get strategy by name
     */
    public PaymentStrategy getStrategyByName(String strategyName) {
        return paymentStrategies.stream()
            .filter(strategy -> strategy.getPaymentMethodName().equalsIgnoreCase(strategyName))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Strategy not found: " + strategyName));
    }
} 
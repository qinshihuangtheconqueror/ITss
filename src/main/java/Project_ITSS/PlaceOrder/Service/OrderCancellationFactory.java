package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.PlaceOrder.Command.CommandResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

/**
 * Factory class to select the appropriate cancellation service based on payment method
 * Implements Factory Pattern with dynamic registration - no hardcoded switch-case
 * Implements Open/Closed Principle - easy to extend without modifying existing code
 */
@Service
public class OrderCancellationFactory {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderCancellationFactory.class);
    
    private final Map<String, OrderCancellationTemplate> cancellationServices = new HashMap<>();
    private final IOrderRepository orderRepository;
    
    @Autowired
    public OrderCancellationFactory(List<OrderCancellationTemplate> services, IOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
        
        // Dynamically register all cancellation services
        for (OrderCancellationTemplate service : services) {
            String paymentType = service.getPaymentMethodName().toLowerCase();
            cancellationServices.put(paymentType, service);
            logger.info("Registered cancellation service for payment type: {}", paymentType);
        }
        
        // Set default service (VNPay as fallback)
        if (cancellationServices.containsKey("vnpay")) {
            cancellationServices.put("default", cancellationServices.get("vnpay"));
        }
    }
    
    /**
     * Get the appropriate cancellation service based on order's payment method
     * @param orderId The order ID
     * @return The appropriate cancellation service
     */
    public OrderCancellationTemplate getCancellationService(long orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        
        // Determine payment method from order or transaction
        String paymentMethod = determinePaymentMethod(order);
        
        // Get service from map, fallback to default if not found
        OrderCancellationTemplate service = cancellationServices.get(paymentMethod.toLowerCase());
        if (service == null) {
            logger.warn("No cancellation service found for payment method: {}. Using default.", paymentMethod);
            service = cancellationServices.get("default");
        }
        
        if (service == null) {
            throw new IllegalStateException("No cancellation service available for payment method: " + paymentMethod);
        }
        
        logger.info("Selected cancellation service: {} for order: {} with payment method: {}", 
            service.getClass().getSimpleName(), orderId, paymentMethod);
        
        return service;
    }
    
    /**
     * Determine payment method from order information
     * In real implementation, this would check transaction details
     * @param order The order to check
     * @return The payment method
     */
    private String determinePaymentMethod(Order order) {
        // This is a simplified implementation
        // In real scenario, you would check the transaction table or order metadata
        
        // For demo purposes, assume orders with ID > 10000 are credit card
        if (order.getOrder_id() > 10000) {
            return "credit_card";
        } else {
            return "vnpay";
        }
    }
    
    /**
     * Convenience method to execute cancellation with automatic service selection
     * @param orderId The order ID
     * @param request The HTTP request
     * @return The cancellation result
     */
    public CommandResult executeCancellation(long orderId, jakarta.servlet.http.HttpServletRequest request) {
        OrderCancellationTemplate service = getCancellationService(orderId);
        return service.executeCancellation(orderId, request);
    }
    
    /**
     * Get all registered payment types
     * @return Set of registered payment types
     */
    public Set<String> getRegisteredPaymentTypes() {
        return new HashSet<>(cancellationServices.keySet());
    }
} 
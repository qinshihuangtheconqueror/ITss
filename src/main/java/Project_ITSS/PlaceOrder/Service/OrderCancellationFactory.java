package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Repository.OrderRepository_PlaceOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Factory class to select the appropriate cancellation service based on payment method
 * Implements Factory Pattern along with Template Method Pattern
 */
@Service
public class OrderCancellationFactory {
    
    @Autowired
    private VNPayOrderCancellationService vnPayCancellationService;
    
    @Autowired
    private CreditCardOrderCancellationService creditCardCancellationService;
    
    @Autowired
    private OrderRepository_PlaceOrder orderRepository;
    
    /**
     * Get the appropriate cancellation service based on order's payment method
     */
    public OrderCancellationTemplate getCancellationService(long orderId) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        
        // Determine payment method from order or transaction
        String paymentMethod = determinePaymentMethod(order);
        
        switch (paymentMethod.toLowerCase()) {
            case "vnpay":
            case "bank_transfer":
                return vnPayCancellationService;
            case "credit_card":
            case "card":
                return creditCardCancellationService;
            default:
                // Default to VNPay for backward compatibility
                return vnPayCancellationService;
        }
    }
    
    /**
     * Determine payment method from order information
     * In real implementation, this would check transaction details
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
     */
    public OrderCancellationTemplate.CancellationResult executeCancellation(long orderId, jakarta.servlet.http.HttpServletRequest request) {
        OrderCancellationTemplate service = getCancellationService(orderId);
        return service.executeCancellation(orderId, request);
    }
} 
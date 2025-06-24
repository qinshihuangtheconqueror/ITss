package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.PlaceOrder.Exception.OrderNotFoundException;
import Project_ITSS.PlaceOrder.Exception.OrderCancellationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service responsible for order validation operations
 * Implements Single Responsibility Principle - only handles validation
 */
@Service
public class OrderValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderValidationService.class);
    
    private final IOrderRepository orderRepository;
    
    @Autowired
    public OrderValidationService(IOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    
    /**
     * Validate order before cancellation
     * @param orderId The order ID to validate
     * @return Validated order
     * @throws OrderNotFoundException if order not found
     * @throws OrderCancellationException if order cannot be cancelled
     */
    public Order validateOrder(long orderId) {
        logger.info("Validating order: {}", orderId);
        
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderNotFoundException("Order not found", orderId);
        }
        
        if (!canCancelOrder(order)) {
            throw new OrderCancellationException(
                "Order cannot be cancelled. Only pending orders can be cancelled.", 
                orderId, 
                "INVALID_STATUS"
            );
        }
        
        logger.info("Order validation successful for order: {}", orderId);
        return order;
    }
    
    /**
     * Check if order can be cancelled
     * @param order The order to check
     * @return true if order can be cancelled
     */
    public boolean canCancelOrder(Order order) {
        return "pending".equalsIgnoreCase(order.getStatus());
    }
} 
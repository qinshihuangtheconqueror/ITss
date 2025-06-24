package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service responsible for order status operations
 * Implements Single Responsibility Principle - only handles status updates
 */
@Service
public class OrderStatusService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderStatusService.class);
    
    private final IOrderRepository orderRepository;
    
    @Autowired
    public OrderStatusService(IOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    
    /**
     * Update order status
     * @param orderId The order ID
     * @param status The new status
     */
    public void updateStatus(long orderId, String status) {
        logger.info("Updating order {} status to: {}", orderId, status);
        orderRepository.updateStatus(orderId, status);
    }
    
    /**
     * Get order status
     * @param orderId The order ID
     * @return The current status
     */
    public String getStatus(long orderId) {
        return orderRepository.getOrderStatus(orderId);
    }
} 
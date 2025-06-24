package Project_ITSS.PlaceOrder.Repository;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;

/**
 * Interface for Order Repository operations
 * Implements Interface Segregation Principle
 */
public interface IOrderRepository {
    
    /**
     * Find order by ID
     */
    Order findById(long orderId);
    
    /**
     * Update order status
     */
    void updateStatus(long orderId, String status);
    
    /**
     * Get delivery information by ID
     */
    DeliveryInformation getDeliveryInfo(long deliveryId);
    
    /**
     * Check if order exists
     */
    boolean existsById(long orderId);
    
    /**
     * Get order status
     */
    String getOrderStatus(long orderId);
} 
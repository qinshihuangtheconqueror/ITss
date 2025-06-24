package Project_ITSS.PlaceOrder.Repository.Implementation;

import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.PlaceOrder.Repository.OrderRepository_PlaceOrder;
import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation of IOrderRepository interface
 * Wraps the existing OrderRepository_PlaceOrder
 */
@Repository
public class OrderRepositoryImpl implements IOrderRepository {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderRepositoryImpl.class);
    
    private final OrderRepository_PlaceOrder orderRepository;
    
    @Autowired
    public OrderRepositoryImpl(OrderRepository_PlaceOrder orderRepository) {
        this.orderRepository = orderRepository;
    }
    
    @Override
    public Order findById(long orderId) {
        logger.debug("Finding order by ID: {}", orderId);
        return orderRepository.getOrderById(orderId);
    }
    
    @Override
    public void updateStatus(long orderId, String status) {
        logger.debug("Updating order {} status to: {}", orderId, status);
        orderRepository.updateOrderStatus(orderId, status);
    }
    
    @Override
    public DeliveryInformation getDeliveryInfo(long deliveryId) {
        logger.debug("Getting delivery info for ID: {}", deliveryId);
        return orderRepository.getDeliveryInformationById(deliveryId);
    }
    
    @Override
    public boolean existsById(long orderId) {
        logger.debug("Checking if order exists: {}", orderId);
        Order order = orderRepository.getOrderById(orderId);
        return order != null;
    }
    
    @Override
    public String getOrderStatus(long orderId) {
        logger.debug("Getting order status for ID: {}", orderId);
        Order order = orderRepository.getOrderById(orderId);
        return order != null ? order.getStatus() : null;
    }
} 
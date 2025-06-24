package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.OrderRepository_PlaceOrder;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Concrete implementation of OrderCancellationTemplate for Credit Card payment method
 * Demonstrates how different payment methods can have different cancellation logic
 */
@Service
public class CreditCardOrderCancellationService extends OrderCancellationTemplate {
    
    private static final Logger logger = LoggerFactory.getLogger(CreditCardOrderCancellationService.class);
    
    @Autowired
    private OrderRepository_PlaceOrder orderRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Override
    protected Order validateOrder(long orderId) {
        logger.info("Validating credit card order: {}", orderId);
        return orderRepository.getOrderById(orderId);
    }
    
    @Override
    protected void updateOrderStatus(long orderId, String status) {
        logger.info("Updating credit card order {} status to: {}", orderId, status);
        orderRepository.updateOrderStatus(orderId, status);
    }
    
    @Override
    protected RefundResult processRefund(long orderId, HttpServletRequest request) {
        logger.info("Processing credit card refund for order: {}", orderId);
        
        RefundResult result = new RefundResult();
        
        try {
            // Find transaction
            TransactionInfo transaction = transactionRepository.findByOrderId(String.valueOf(orderId));
            if (transaction == null) {
                result.setSuccess(false);
                result.setMessage("No transaction found for this order. Cannot refund.");
                return result;
            }
            
            // Credit card refund logic (different from VNPay)
            // In real implementation, this would call credit card gateway API
            boolean refundSuccess = processCreditCardRefund(transaction);
            
            if (refundSuccess) {
                result.setSuccess(true);
                result.setMessage("Credit card refund processed successfully");
                result.setAmount(transaction.getAmount().doubleValue() / 100);
                result.setMethod("Credit Card Refund");
                logger.info("Credit card refund successful for order: {}", orderId);
            } else {
                result.setSuccess(false);
                result.setMessage("Credit card refund failed");
                logger.error("Credit card refund failed for order: {}", orderId);
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing credit card refund: " + e.getMessage());
            logger.error("Error processing credit card refund for order {}: {}", orderId, e.getMessage());
        }
        
        return result;
    }
    
    @Override
    protected void sendNotification(long orderId) {
        logger.info("Sending credit card cancellation notification for order: {}", orderId);
        
        try {
            Order order = orderRepository.getOrderById(orderId);
            if (order != null) {
                DeliveryInformation deliveryInfo = orderRepository.getDeliveryInformationById(order.getDelivery_id());
                if (deliveryInfo != null && deliveryInfo.getEmail() != null) {
                    // Credit card specific notification
                    String subject = "Credit Card Order Cancellation";
                    String content = "Your credit card order #" + orderId + " has been cancelled. " +
                                   "Refund will be processed to your credit card within 5-7 business days.";
                    // mailService.SendSuccessEmail(deliveryInfo.getEmail(), subject, content);
                    logger.info("Credit card cancellation notification sent to: {}", deliveryInfo.getEmail());
                }
            }
        } catch (Exception e) {
            logger.error("Error sending credit card notification for order {}: {}", orderId, e.getMessage());
        }
    }
    
    @Override
    protected void logCancellation(long orderId, String message) {
        logger.info("Credit card order cancellation log - Order: {}, Message: {}", orderId, message);
        // Could save to specific credit card audit log
    }
    
    /**
     * Hook method override - credit card specific validation
     */
    @Override
    protected boolean canCancelOrder(Order order) {
        boolean canCancel = super.canCancelOrder(order);
        if (canCancel) {
            // Additional credit card specific validation
            // e.g., check if order is within cancellation window
            logger.info("Credit card order {} can be cancelled", order.getOrder_id());
        } else {
            logger.warn("Credit card order {} cannot be cancelled. Status: {}", order.getOrder_id(), order.getStatus());
        }
        return canCancel;
    }
    
    /**
     * Credit card specific refund processing
     */
    private boolean processCreditCardRefund(TransactionInfo transaction) {
        // Mock implementation - in real scenario would call credit card gateway
        logger.info("Processing credit card refund for transaction: {}", transaction.getTransactionNo());
        
        // Simulate credit card refund processing
        try {
            Thread.sleep(1000); // Simulate API call delay
            return true; // Mock success
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
} 
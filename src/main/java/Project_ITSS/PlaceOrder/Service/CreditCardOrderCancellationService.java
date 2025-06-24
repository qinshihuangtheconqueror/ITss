package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Concrete implementation of OrderCancellationTemplate for Credit Card payment method
 * Demonstrates how different payment methods can have different cancellation logic
 * Implements Template Method Pattern - overrides specific steps for Credit Card
 */
@Service
public class CreditCardOrderCancellationService extends OrderCancellationTemplate {
    
    private static final Logger logger = LoggerFactory.getLogger(CreditCardOrderCancellationService.class);
    
    @Autowired
    private IOrderRepository orderRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private INotificationService notificationService;
    
    @Override
    protected Order validateOrder(long orderId) {
        logger.info("Validating credit card order: {}", orderId);
        return orderRepository.findById(orderId);
    }
    
    @Override
    protected void updateOrderStatus(long orderId, String status) {
        logger.info("Updating credit card order {} status to: {}", orderId, status);
        orderRepository.updateStatus(orderId, status);
    }
    
    @Override
    protected boolean validateTransaction(long orderId) {
        logger.info("Validating credit card transaction for order: {}", orderId);
        TransactionInfo transaction = transactionRepository.findByOrderId(String.valueOf(orderId));
        return transaction != null;
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
            
            // Process credit card refund
            boolean refundSuccess = processCreditCardRefund(transaction);
            
            if (refundSuccess) {
                result.setSuccess(true);
                result.setMessage("Credit card refund processed successfully");
                result.setAmount(transaction.getAmount().doubleValue());
                result.setMethod("Credit Card");
                result.setTransactionId(transaction.getTransactionNo());
            } else {
                result.setSuccess(false);
                result.setMessage("Credit card refund failed");
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing credit card refund: " + e.getMessage());
            logger.error("Error processing credit card refund for order {}: {}", orderId, e.getMessage());
        }
        
        return result;
    }
    
    @Override
    protected void sendNotification(long orderId, RefundResult refundResult) {
        logger.info("Sending credit card cancellation notification for order: {}", orderId);
        
        try {
            Order order = orderRepository.findById(orderId);
            if (order != null) {
                notificationService.sendCancellationNotification(order, refundResult);
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
    
    @Override
    protected String getPaymentMethodName() {
        return "Credit Card";
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
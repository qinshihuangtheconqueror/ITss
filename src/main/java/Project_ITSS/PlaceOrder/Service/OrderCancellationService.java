package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Factory.PaymentStrategyFactory;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import Project_ITSS.PlaceOrder.Command.CommandResult;
import Project_ITSS.PlaceOrder.Exception.OrderNotFoundException;
import Project_ITSS.PlaceOrder.Exception.OrderCancellationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service layer for order cancellation operations - ORCHESTRATION ONLY
 * Implements improved design patterns with low coupling and high cohesion
 * Single Responsibility: Only orchestrates the cancellation process
 */
@Service
@Transactional
public class OrderCancellationService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderCancellationService.class);
    
    // Inject small, focused services instead of doing everything
    private final OrderValidationService validationService;
    private final OrderStatusService statusService;
    private final RefundService refundService;
    private final INotificationService notificationService;
    private final PaymentStrategyFactory paymentStrategyFactory;
    
    @Autowired
    public OrderCancellationService(
        OrderValidationService validationService,
        OrderStatusService statusService,
        RefundService refundService,
        INotificationService notificationService,
        PaymentStrategyFactory paymentStrategyFactory
    ) {
        this.validationService = validationService;
        this.statusService = statusService;
        this.refundService = refundService;
        this.notificationService = notificationService;
        this.paymentStrategyFactory = paymentStrategyFactory;
    }
    
    /**
     * Cancel order with improved design patterns - ORCHESTRATION ONLY
     * This method only coordinates the process, delegates actual work to specialized services
     */
    public CommandResult cancelOrder(long orderId, HttpServletRequest request) {
        logger.info("Starting order cancellation orchestration for order: {}", orderId);
        
        try {
            // Step 1: Validate order (delegated to validation service)
            Order order = validationService.validateOrder(orderId);
            
            // Step 2: Get payment strategy (delegated to factory)
            PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(order);
            logger.info("Selected payment strategy: {} for order: {}", 
                paymentStrategy.getPaymentMethodName(), orderId);
            
            // Step 3: Update order status to cancelled (delegated to status service)
            statusService.updateStatus(orderId, "cancelled");
            
            // Step 4: Validate transaction (delegated to strategy)
            boolean valid = paymentStrategy.validateTransaction(String.valueOf(orderId), null);
            if (!valid) {
                // Rollback order status if validate transaction fail (delegated to status service)
                statusService.updateStatus(orderId, order.getStatus());
                return CommandResult.failure("Transaction validation failed. Cannot cancel/refund.", "TRANSACTION_INVALID");
            }
            
            // Step 5: Process refund (delegated to refund service)
            RefundResult refundResult = refundService.processRefund(order, paymentStrategy, request);
            if (!refundResult.isSuccess()) {
                // Rollback order status if refund fails (delegated to status service)
                statusService.updateStatus(orderId, order.getStatus());
                return CommandResult.failure(refundResult.getMessage(), "REFUND_FAILED");
            }
            
            // Step 6: Send notification if successful (delegated to notification service)
            notificationService.sendCancellationNotification(order, refundResult);
            
            // Step 7: Create success result
            CancellationData cancellationData = new CancellationData();
            cancellationData.setOrderId(order.getOrder_id());
            cancellationData.setRefundAmount(refundResult.getAmount());
            cancellationData.setRefundMethod(refundResult.getMethod());
            cancellationData.setTransactionId(refundResult.getTransactionId());
            cancellationData.setPaymentMethod(paymentStrategy.getPaymentMethodName());
            
            logger.info("Order cancellation orchestration completed successfully for order: {}", orderId);
            return CommandResult.success("Order cancelled successfully", cancellationData);
            
        } catch (OrderNotFoundException e) {
            logger.error("Order not found: {}", orderId);
            return CommandResult.failure("Order not found: " + orderId, "ORDER_NOT_FOUND");
        } catch (OrderCancellationException e) {
            logger.error("Order cancellation failed: {}", e.getMessage());
            return CommandResult.failure(e.getMessage(), "CANCELLATION_FAILED");
        } catch (Exception e) {
            logger.error("Unexpected error during order cancellation: {}", e.getMessage(), e);
            return CommandResult.failure("Internal error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }
    
    /**
     * Data class for cancellation result
     */
    public static class CancellationData {
        private long orderId;
        private double refundAmount;
        private String refundMethod;
        private String transactionId;
        private String paymentMethod;
        
        // Getters and setters
        public long getOrderId() { return orderId; }
        public void setOrderId(long orderId) { this.orderId = orderId; }
        
        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }
        
        public String getRefundMethod() { return refundMethod; }
        public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
} 
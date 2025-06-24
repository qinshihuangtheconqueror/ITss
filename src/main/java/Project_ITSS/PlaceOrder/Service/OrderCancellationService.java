package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.PlaceOrder.Factory.PaymentStrategyFactory;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import Project_ITSS.PlaceOrder.Command.CommandResult;
import Project_ITSS.PlaceOrder.Exception.OrderNotFoundException;
import Project_ITSS.PlaceOrder.Exception.OrderCancellationException;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service layer for order cancellation operations
 * Implements improved design patterns with low coupling and high cohesion
 */
@Service
@Transactional
public class OrderCancellationService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderCancellationService.class);
    
    private final IOrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final NonDBService_PlaceOrder notificationService;
    
    @Autowired
    public OrderCancellationService(
        IOrderRepository orderRepository,
        TransactionRepository transactionRepository,
        PaymentStrategyFactory paymentStrategyFactory,
        NonDBService_PlaceOrder notificationService
    ) {
        this.orderRepository = orderRepository;
        this.transactionRepository = transactionRepository;
        this.paymentStrategyFactory = paymentStrategyFactory;
        this.notificationService = notificationService;
    }
    
    /**
     * Cancel order with improved design patterns
     */
    public CommandResult cancelOrder(long orderId, HttpServletRequest request) {
        logger.info("Starting order cancellation process for order: {}", orderId);
        
        try {
            // Step 1: Validate order
            Order order = validateOrder(orderId);
            
            // Step 2: Get payment strategy
            PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(order);
            logger.info("Selected payment strategy: {} for order: {}", 
                paymentStrategy.getPaymentMethodName(), orderId);
            
            // Step 3: Execute cancellation
            CommandResult result = executeCancellation(order, paymentStrategy, request);
            
            // Step 4: Send notification if successful
            if (result.isSuccess()) {
                sendCancellationNotification(order, result);
            }
            
            return result;
            
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
     * Validate order before cancellation
     */
    private Order validateOrder(long orderId) {
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
     */
    private boolean canCancelOrder(Order order) {
        return "pending".equalsIgnoreCase(order.getStatus());
    }
    
    /**
     * Execute the cancellation process
     */
    private CommandResult executeCancellation(Order order, PaymentStrategy paymentStrategy, 
                                            HttpServletRequest request) {
        logger.info("Executing cancellation for order: {}", order.getOrder_id());
        try {
            // Step 1: Update order status to cancelled
            updateOrderStatus(order.getOrder_id(), "cancelled");

            // Step 1.5: Validate transaction qua strategy
            boolean valid = paymentStrategy.validateTransaction(String.valueOf(order.getOrder_id()), transactionRepository);
            if (!valid) {
                // Rollback order status nếu validate transaction fail
                updateOrderStatus(order.getOrder_id(), order.getStatus());
                return CommandResult.failure("Transaction validation failed. Cannot cancel/refund.", "TRANSACTION_INVALID");
            }

            // Step 2: Process refund
            RefundResult refundResult = processRefund(order, paymentStrategy, request);
            if (!refundResult.isSuccess()) {
                // Rollback order status if refund fails
                updateOrderStatus(order.getOrder_id(), order.getStatus());
                return CommandResult.failure(refundResult.getMessage(), "REFUND_FAILED");
            }

            // Step 3: Create success result
            CancellationData cancellationData = new CancellationData();
            cancellationData.setOrderId(order.getOrder_id());
            cancellationData.setRefundAmount(refundResult.getAmount());
            cancellationData.setRefundMethod(refundResult.getMethod());
            cancellationData.setTransactionId(refundResult.getTransactionId());
            cancellationData.setPaymentMethod(paymentStrategy.getPaymentMethodName());
            return CommandResult.success("Order cancelled successfully", cancellationData);
        } catch (Exception e) {
            logger.error("Error during cancellation execution: {}", e.getMessage(), e);
            // Rollback order status
            updateOrderStatus(order.getOrder_id(), order.getStatus());
            throw new OrderCancellationException("Cancellation execution failed", order.getOrder_id(), "EXECUTION_ERROR", e);
        }
    }
    
    /**
     * Update order status
     */
    private void updateOrderStatus(long orderId, String status) {
        logger.info("Updating order {} status to: {}", orderId, status);
        orderRepository.updateStatus(orderId, status);
    }
    
    /**
     * Process refund using payment strategy
     */
    private RefundResult processRefund(Order order, PaymentStrategy paymentStrategy, 
                                     HttpServletRequest request) {
        logger.info("Processing refund for order: {} using {}", 
            order.getOrder_id(), paymentStrategy.getPaymentMethodName());
        
        // Find transaction
        TransactionInfo transaction = transactionRepository.findByOrderId(String.valueOf(order.getOrder_id()));
        if (transaction == null) {
            RefundResult result = new RefundResult();
            result.setSuccess(false);
            result.setMessage("No transaction found for this order. Cannot refund.");
            return result;
        }
        
        // Create refund request
        RefundRequest refundRequest = new RefundRequest();
        refundRequest.setOrderId(transaction.getOrderId());
        refundRequest.setAmount(transaction.getAmount().intValue());
        refundRequest.setTransDate(transaction.getPayDate());
        refundRequest.setTranType("02"); // 02: Hoàn toàn bộ giao dịch
        refundRequest.setUser("admin");
        
        // Process refund through payment strategy
        return paymentStrategy.processRefund(refundRequest, request);
    }
    
    /**
     * Send cancellation notification
     */
    private void sendCancellationNotification(Order order, CommandResult result) {
        logger.info("Sending cancellation notification for order: {}", order.getOrder_id());
        
        try {
            DeliveryInformation deliveryInfo = orderRepository.getDeliveryInfo(order.getDelivery_id());
            if (deliveryInfo != null && deliveryInfo.getEmail() != null) {
                String subject = "Thông báo hủy đơn hàng";
                String content = String.format(
                    "Đơn hàng #%d của bạn đã được hủy thành công. " +
                    "Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc.",
                    order.getOrder_id()
                );
                
                notificationService.SendSuccessEmail(deliveryInfo.getEmail(), subject, content);
                logger.info("Cancellation notification sent to: {}", deliveryInfo.getEmail());
            }
        } catch (Exception e) {
            logger.error("Error sending cancellation notification: {}", e.getMessage());
            // Don't fail the entire cancellation process if notification fails
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
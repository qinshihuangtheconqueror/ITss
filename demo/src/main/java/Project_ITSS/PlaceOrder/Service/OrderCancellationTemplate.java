package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Command.CommandResult;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

/**
 * Template Method Pattern for Order Cancellation
 * Defines the skeleton of the cancellation algorithm, letting subclasses override specific steps
 * Implements Template Method Pattern for better extensibility
 */
@Service
public abstract class OrderCancellationTemplate {
    
    /**
     * Template method - defines the algorithm structure
     * This is the main algorithm that cannot be overridden (final)
     */
    public final CommandResult executeCancellation(long orderId, HttpServletRequest request) {
        try {
            // Step 1: Validate order
            Order order = validateOrder(orderId);
            if (order == null) {
                return CommandResult.failure("Order not found", "ORDER_NOT_FOUND");
            }
            
            // Step 2: Check if order can be cancelled
            if (!canCancelOrder(order)) {
                return CommandResult.failure("Order cannot be cancelled. Only pending orders can be cancelled.", "INVALID_STATUS");
            }
            
            // Step 3: Update order status to cancelled
            updateOrderStatus(orderId, "cancelled");
            
            // Step 4: Validate transaction
            if (!validateTransaction(orderId)) {
                // Rollback order status if validate transaction fail
                updateOrderStatus(orderId, order.getStatus());
                return CommandResult.failure("Transaction validation failed. Cannot cancel/refund.", "TRANSACTION_INVALID");
            }
            
            // Step 5: Process refund
            RefundResult refundResult = processRefund(orderId, request);
            if (!refundResult.isSuccess()) {
                // Rollback order status if refund fails
                updateOrderStatus(orderId, order.getStatus());
                return CommandResult.failure(refundResult.getMessage(), "REFUND_FAILED");
            }
            
            // Step 6: Send notification
            sendNotification(orderId, refundResult);
            
            // Step 7: Log cancellation
            logCancellation(orderId, "Order cancelled successfully");
            
            // Step 8: Create success result
            CancellationData cancellationData = new CancellationData();
            cancellationData.setOrderId(orderId);
            cancellationData.setRefundAmount(refundResult.getAmount());
            cancellationData.setRefundMethod(refundResult.getMethod());
            cancellationData.setTransactionId(refundResult.getTransactionId());
            cancellationData.setPaymentMethod(getPaymentMethodName());
            
            return CommandResult.success("Order cancelled successfully", cancellationData);
            
        } catch (Exception e) {
            logCancellation(orderId, "Cancellation failed: " + e.getMessage());
            return CommandResult.failure("Internal error: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }
    
    // Abstract methods - must be implemented by subclasses
    protected abstract Order validateOrder(long orderId);
    protected abstract void updateOrderStatus(long orderId, String status);
    protected abstract boolean validateTransaction(long orderId);
    protected abstract RefundResult processRefund(long orderId, HttpServletRequest request);
    protected abstract void sendNotification(long orderId, RefundResult refundResult);
    protected abstract void logCancellation(long orderId, String message);
    protected abstract String getPaymentMethodName();
    
    // Hook method - can be overridden by subclasses
    protected boolean canCancelOrder(Order order) {
        return "pending".equalsIgnoreCase(order.getStatus());
    }
    
    // Helper classes
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
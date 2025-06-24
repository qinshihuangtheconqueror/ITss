package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

/**
 * Template Method Pattern for Order Cancellation
 * Defines the skeleton of the cancellation algorithm, letting subclasses override specific steps
 */
@Service
public abstract class OrderCancellationTemplate {
    
    /**
     * Template method - defines the algorithm structure
     */
    public final CancellationResult executeCancellation(long orderId, HttpServletRequest request) {
        CancellationResult result = new CancellationResult();
        
        try {
            // Step 1: Validate order
            Order order = validateOrder(orderId);
            if (order == null) {
                result.setSuccess(false);
                result.setMessage("Order not found");
                return result;
            }
            
            // Step 2: Check if order can be cancelled
            if (!canCancelOrder(order)) {
                result.setSuccess(false);
                result.setMessage("Order cannot be cancelled. Only pending orders can be cancelled.");
                return result;
            }
            
            // Step 3: Update order status
            updateOrderStatus(orderId, "cancelled");
            
            // Step 4: Process refund
            RefundResult refundResult = processRefund(orderId, request);
            if (!refundResult.isSuccess()) {
                // Rollback order status if refund fails
                updateOrderStatus(orderId, order.getStatus());
                result.setSuccess(false);
                result.setMessage(refundResult.getMessage());
                return result;
            }
            
            // Step 5: Send notification
            sendNotification(orderId);
            
            // Step 6: Log cancellation
            logCancellation(orderId, "Order cancelled successfully");
            
            result.setSuccess(true);
            result.setMessage("Order cancelled successfully");
            result.setRefundAmount(refundResult.getAmount());
            result.setRefundMethod(refundResult.getMethod());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Internal error: " + e.getMessage());
            logCancellation(orderId, "Cancellation failed: " + e.getMessage());
        }
        
        return result;
    }
    
    // Abstract methods - must be implemented by subclasses
    protected abstract Order validateOrder(long orderId);
    protected abstract void updateOrderStatus(long orderId, String status);
    protected abstract RefundResult processRefund(long orderId, HttpServletRequest request);
    protected abstract void sendNotification(long orderId);
    protected abstract void logCancellation(long orderId, String message);
    
    // Hook method - can be overridden by subclasses
    protected boolean canCancelOrder(Order order) {
        return "pending".equalsIgnoreCase(order.getStatus());
    }
    
    // Helper classes
    public static class CancellationResult {
        private boolean success;
        private String message;
        private double refundAmount;
        private String refundMethod;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }
        public String getRefundMethod() { return refundMethod; }
        public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }
    }
    
    public static class RefundResult {
        private boolean success;
        private String message;
        private double amount;
        private String method;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
    }
} 
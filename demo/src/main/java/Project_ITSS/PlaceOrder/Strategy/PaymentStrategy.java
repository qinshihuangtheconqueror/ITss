package Project_ITSS.PlaceOrder.Strategy;

import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Strategy interface for different payment methods
 * Implements Strategy Pattern
 */
public interface PaymentStrategy {
    
    /**
     * Process refund for the payment method
     */
    RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest);
    
    /**
     * Validate transaction for the payment method
     */
    boolean validateTransaction(String orderId, Project_ITSS.vnpay.common.repository.TransactionRepository transactionRepository);
    
    /**
     * Get payment method name
     */
    String getPaymentMethodName();
    
    /**
     * Check if this strategy can handle the given order
     */
    boolean canHandleOrder(long orderId);
    
    /**
     * Result class for refund operations
     */
    class RefundResult {
        private boolean success;
        private String message;
        private double amount;
        private String method;
        private String transactionId;
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
} 
package Project_ITSS.PlaceOrder.Strategy;

import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import Project_ITSS.vnpay.common.repository.TransactionRepository;

/**
 * Credit Card payment strategy implementation
 * Implements Strategy Pattern for Credit Card payment method
 */
@Service
public class CreditCardPaymentStrategy implements PaymentStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(CreditCardPaymentStrategy.class);
    
    @Override
    public RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest) {
        logger.info("Processing Credit Card refund for order: {}", request.getOrderId());
        
        RefundResult result = new RefundResult();
        
        try {
            // Credit card refund logic (different from VNPay)
            // In real implementation, this would call credit card gateway API
            boolean refundSuccess = processCreditCardRefund(request);
            
            if (refundSuccess) {
                result.setSuccess(true);
                result.setMessage("Credit card refund processed successfully");
                result.setAmount(request.getAmount() / 100.0); // Convert from cents
                result.setMethod("Credit Card Refund");
                result.setTransactionId("CC_" + System.currentTimeMillis()); // Mock transaction ID
                logger.info("Credit card refund successful for order: {}", request.getOrderId());
            } else {
                result.setSuccess(false);
                result.setMessage("Credit card refund failed");
                logger.error("Credit card refund failed for order: {}", request.getOrderId());
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing credit card refund: " + e.getMessage());
            logger.error("Error processing credit card refund for order {}: {}", request.getOrderId(), e.getMessage());
        }
        
        return result;
    }
    
    @Override
    public boolean validateTransaction(String orderId, TransactionRepository transactionRepository) {
        logger.info("Validating CreditCard transaction for order: {}", orderId);
        try {
            TransactionInfo transaction = transactionRepository.findByOrderId(orderId);
            if (transaction == null) {
                logger.warn("No CreditCard transaction found for order: {}", orderId);
                return false;
            }
            logger.info("CreditCard transaction validated for order: {}", orderId);
            return true;
        } catch (Exception e) {
            logger.error("Error validating CreditCard transaction for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }
    
    @Override
    public String getPaymentMethodName() {
        return "CreditCard";
    }
    
    @Override
    public boolean canHandleOrder(long orderId) {
        // Credit Card can handle orders with ID > 10000 (for demo purposes)
        // In real implementation, this would check the actual payment method used
        return orderId > 10000;
    }
    
    /**
     * Credit card specific refund processing
     * Mock implementation - in real scenario would call credit card gateway
     */
    private boolean processCreditCardRefund(RefundRequest request) {
        logger.info("Processing credit card refund for order: {}", request.getOrderId());
        
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
package Project_ITSS.PlaceOrder.Strategy;

import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import Project_ITSS.vnpay.common.repository.TransactionRepository;

/**
 * VNPay payment strategy implementation
 * Implements Strategy Pattern for VNPay payment method
 */
@Service
public class VNPayPaymentStrategy implements PaymentStrategy {
    
    private static final Logger logger = LoggerFactory.getLogger(VNPayPaymentStrategy.class);
    
    @Autowired
    private VNPayService vnPayService;

    @Override
    public RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest) {
        logger.info("Processing VNPay refund for order: {}", request.getOrderId());
        
        RefundResult result = new RefundResult();
        
        try {
            // Process refund through VNPay service
            VNPayService.RefundResponse refundResponse = vnPayService.refundTransaction(request, httpRequest);
            
            // Check VNPay response
            if (refundResponse != null && "00".equals(refundResponse.getVnp_ResponseCode())) {
                result.setSuccess(true);
                result.setMessage("VNPay refund processed successfully");
                result.setAmount(request.getAmount() / 100.0); // Convert from VND * 100
                result.setMethod("VNPay Refund");
                result.setTransactionId(refundResponse.getVnp_TransactionNo());
                logger.info("VNPay refund successful for order: {}", request.getOrderId());
            } else {
                result.setSuccess(false);
                result.setMessage(refundResponse != null ? 
                    refundResponse.getVnp_Message() : "VNPay refund failed");
                logger.error("VNPay refund failed for order: {}", request.getOrderId());
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing VNPay refund: " + e.getMessage());
            logger.error("Error processing VNPay refund for order {}: {}", request.getOrderId(), e.getMessage());
        }
        
        return result;
    }
    
    @Override
    public boolean validateTransaction(String orderId, TransactionRepository transactionRepository) {
        logger.info("Validating VNPay transaction for order: {}", orderId);
        try {
            TransactionInfo transaction = transactionRepository.findByOrderId(orderId);
            if (transaction == null) {
                logger.warn("No VNPay transaction found for order: {}", orderId);
                return false;
            }
            logger.info("VNPay transaction validated for order: {}", orderId);
            return true;
        } catch (Exception e) {
            logger.error("Error validating VNPay transaction for order {}: {}", orderId, e.getMessage());
            return false;
        }
    }
    
    @Override
    public String getPaymentMethodName() {
        return "VNPay";
    }
    
    @Override
    public boolean canHandleOrder(long orderId) {
        // VNPay can handle orders with ID <= 10000 (for demo purposes)
        // In real implementation, this would check the actual payment method used
        return orderId <= 10000;
    }
} 
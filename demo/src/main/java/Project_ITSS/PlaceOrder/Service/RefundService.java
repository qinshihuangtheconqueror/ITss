package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service responsible for refund operations
 * Implements Single Responsibility Principle - only handles refund processing
 */
@Service
public class RefundService {
    
    private static final Logger logger = LoggerFactory.getLogger(RefundService.class);
    
    private final TransactionRepository transactionRepository;
    
    @Autowired
    public RefundService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    
    /**
     * Process refund using payment strategy
     * @param order The order to refund
     * @param paymentStrategy The payment strategy to use
     * @param request The HTTP request
     * @return Refund result
     */
    public RefundResult processRefund(Order order, PaymentStrategy paymentStrategy, 
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
} 
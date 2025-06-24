package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.service.VNPayService;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import Project_ITSS.PlaceOrder.Event.OrderCancellationEvent;

/**
 * Concrete implementation of OrderCancellationTemplate for VNPay payment method
 * Implements Template Method Pattern - overrides specific steps for VNPay
 */
@Service
public class VNPayOrderCancellationService extends OrderCancellationTemplate {
    
    private static final Logger logger = LoggerFactory.getLogger(VNPayOrderCancellationService.class);
    
    @Autowired
    private IOrderRepository orderRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private VNPayService vnPayService;
    
    @Autowired
    private INotificationService notificationService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Override
    protected Order validateOrder(long orderId) {
        logger.info("Validating VNPay order: {}", orderId);
        return orderRepository.findById(orderId);
    }
    
    @Override
    protected void updateOrderStatus(long orderId, String status) {
        logger.info("Updating VNPay order {} status to: {}", orderId, status);
        orderRepository.updateStatus(orderId, status);
    }
    
    @Override
    protected boolean validateTransaction(long orderId) {
        logger.info("Validating VNPay transaction for order: {}", orderId);
        TransactionInfo transaction = transactionRepository.findByOrderId(String.valueOf(orderId));
        return transaction != null;
    }
    
    @Override
    protected RefundResult processRefund(long orderId, HttpServletRequest request) {
        logger.info("Processing VNPay refund for order: {}", orderId);
        
        RefundResult result = new RefundResult();
        
        try {
            // Find transaction
            TransactionInfo transaction = transactionRepository.findByOrderId(String.valueOf(orderId));
            if (transaction == null) {
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
            
            // Process refund through VNPay service
            VNPayService.RefundResponse refundResponse = vnPayService.refundTransaction(refundRequest, request);
            
            // Parse response and set result
            if (refundResponse != null && "00".equals(refundResponse.getVnp_ResponseCode())) {
                result.setSuccess(true);
                result.setMessage("Refund processed successfully");
                result.setAmount(transaction.getAmount().doubleValue());
                result.setMethod("VNPay");
                result.setTransactionId(transaction.getTransactionNo());
            } else {
                result.setSuccess(false);
                result.setMessage("Refund failed: " + (refundResponse != null ? refundResponse.getVnp_Message() : "Unknown error"));
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing refund: " + e.getMessage());
            logger.error("Error processing VNPay refund for order {}: {}", orderId, e.getMessage());
        }
        
        return result;
    }
    
    @Override
    protected void sendNotification(long orderId, RefundResult refundResult) {
        logger.info("Publishing event for cancelled order: {}", orderId);
        try {
            Order order = orderRepository.findById(orderId);
            if (order != null) {
                eventPublisher.publishEvent(new OrderCancellationEvent(order, refundResult));
            }
        } catch (Exception e) {
            logger.error("Error publishing event for order {}: {}", orderId, e.getMessage());
        }
    }
    
    @Override
    protected void logCancellation(long orderId, String message) {
        logger.info("VNPay order cancellation log - Order: {}, Message: {}", orderId, message);
        // Here you could also save to database audit log
    }
    
    @Override
    protected String getPaymentMethodName() {
        return "VNPay";
    }
    
    /**
     * Hook method override - can add VNPay specific validation
     */
    @Override
    protected boolean canCancelOrder(Order order) {
        boolean canCancel = super.canCancelOrder(order);
        if (canCancel) {
            // Additional VNPay specific validation could be added here
            logger.info("VNPay order {} can be cancelled", order.getOrder_id());
        } else {
            logger.warn("VNPay order {} cannot be cancelled. Status: {}", order.getOrder_id(), order.getStatus());
        }
        return canCancel;
    }
} 
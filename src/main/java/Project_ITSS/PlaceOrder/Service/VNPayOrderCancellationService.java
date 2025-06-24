package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.OrderRepository_PlaceOrder;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.service.VNPayService;
import Project_ITSS.PlaceOrder.Service.NonDBService_PlaceOrder;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Concrete implementation of OrderCancellationTemplate for VNPay payment method
 */
@Service
public class VNPayOrderCancellationService extends OrderCancellationTemplate {
    
    private static final Logger logger = LoggerFactory.getLogger(VNPayOrderCancellationService.class);
    
    @Autowired
    private OrderRepository_PlaceOrder orderRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private VNPayService vnPayService;
    
    @Autowired
    private NonDBService_PlaceOrder mailService;
    
    @Override
    protected Order validateOrder(long orderId) {
        logger.info("Validating order: {}", orderId);
        return orderRepository.getOrderById(orderId);
    }
    
    @Override
    protected void updateOrderStatus(long orderId, String status) {
        logger.info("Updating order {} status to: {}", orderId, status);
        orderRepository.updateOrderStatus(orderId, status);
    }
    
    @Override
    protected RefundResult processRefund(long orderId, HttpServletRequest request) {
        logger.info("Processing refund for order: {}", orderId);
        
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
            
            // Process refund through VNPay
            var refundResponse = vnPayService.refundTransaction(refundRequest, request);
            
            // Check VNPay response
            if (refundResponse != null && "00".equals(refundResponse.getVnp_ResponseCode())) {
                result.setSuccess(true);
                result.setMessage("Refund processed successfully");
                result.setAmount(transaction.getAmount().doubleValue() / 100); // Convert from VND * 100
                result.setMethod("VNPay Refund");
                logger.info("Refund successful for order: {}", orderId);
            } else {
                result.setSuccess(false);
                result.setMessage(refundResponse != null ? 
                    refundResponse.getVnp_Message() : "Refund failed");
                logger.error("Refund failed for order: {}", orderId);
            }
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Error processing refund: " + e.getMessage());
            logger.error("Error processing refund for order {}: {}", orderId, e.getMessage());
        }
        
        return result;
    }
    
    @Override
    protected void sendNotification(long orderId) {
        logger.info("Sending notification for cancelled order: {}", orderId);
        
        try {
            Order order = orderRepository.getOrderById(orderId);
            if (order != null) {
                DeliveryInformation deliveryInfo = orderRepository.getDeliveryInformationById(order.getDelivery_id());
                if (deliveryInfo != null && deliveryInfo.getEmail() != null) {
                    String subject = "Thông báo hủy đơn hàng";
                    String content = "Đơn hàng #" + orderId + " của bạn đã được hủy và sẽ được hoàn tiền trong thời gian sớm nhất.";
                    mailService.SendSuccessEmail(deliveryInfo.getEmail(), subject, content);
                    logger.info("Notification sent to: {}", deliveryInfo.getEmail());
                }
            }
        } catch (Exception e) {
            logger.error("Error sending notification for order {}: {}", orderId, e.getMessage());
            // Don't fail the entire cancellation process if notification fails
        }
    }
    
    @Override
    protected void logCancellation(long orderId, String message) {
        logger.info("Order cancellation log - Order: {}, Message: {}", orderId, message);
        // Here you could also save to database audit log
    }
    
    /**
     * Hook method override - can add VNPay specific validation
     */
    @Override
    protected boolean canCancelOrder(Order order) {
        boolean canCancel = super.canCancelOrder(order);
        if (canCancel) {
            // Additional VNPay specific validation could be added here
            logger.info("Order {} can be cancelled", order.getOrder_id());
        } else {
            logger.warn("Order {} cannot be cancelled. Status: {}", order.getOrder_id(), order.getStatus());
        }
        return canCancel;
    }
} 
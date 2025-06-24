package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Repository.IOrderRepository;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation of notification service
 * Implements Single Responsibility Principle - only handles notifications
 */
@Service
public class NotificationService implements INotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    private final IOrderRepository orderRepository;
    private final NonDBService_PlaceOrder emailService;
    
    @Autowired
    public NotificationService(IOrderRepository orderRepository, NonDBService_PlaceOrder emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }
    
    @Override
    public void sendCancellationNotification(Order order, RefundResult refundResult) {
        logger.info("Sending cancellation notification for order: {}", order.getOrder_id());
        
        try {
            DeliveryInformation deliveryInfo = orderRepository.getDeliveryInfo(order.getDelivery_id());
            if (deliveryInfo != null && deliveryInfo.getEmail() != null) {
                String subject = "Thông báo hủy đơn hàng";
                String content = String.format(
                    "Đơn hàng #%d của bạn đã được hủy thành công. " +
                    "Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc. " +
                    "Số tiền hoàn: %,.0f VND",
                    order.getOrder_id(),
                    refundResult.getAmount()
                );
                
                emailService.SendSuccessEmail(deliveryInfo.getEmail(), subject, content);
                logger.info("Cancellation notification sent to: {}", deliveryInfo.getEmail());
            }
        } catch (Exception e) {
            logger.error("Error sending cancellation notification: {}", e.getMessage());
            // Don't fail the entire cancellation process if notification fails
        }
    }
    
    @Override
    public void sendSuccessEmail(String email, String subject, String content) {
        try {
            emailService.SendSuccessEmail(email, subject, content);
            logger.info("Success email sent to: {}", email);
        } catch (Exception e) {
            logger.error("Error sending success email to {}: {}", email, e.getMessage());
        }
    }
} 
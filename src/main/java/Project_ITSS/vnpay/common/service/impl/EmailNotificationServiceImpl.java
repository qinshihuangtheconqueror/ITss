package Project_ITSS.vnpay.common.service.impl;

import Project_ITSS.vnpay.common.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation của NotificationService cho Email
 * Giải quyết vấn đề tight coupling với JavaMailSender
 */
@Service("emailNotificationService")
public class EmailNotificationServiceImpl implements NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);
    
    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendNotification(String orderId, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo("customer@example.com"); // TODO: Get actual customer email from order
            mailMessage.setSubject("Payment Notification - Order " + orderId);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            logger.info("Email notification sent for order {}: {}", orderId, message);
        } catch (Exception e) {
            logger.error("Error sending email notification for order {}: {}", orderId, e.getMessage());
        }
    }

    @Override
    public void sendPaymentSuccessNotification(String orderId, String transactionId) {
        String message = String.format(
            "Thanh toán thành công!\n" +
            "Mã đơn hàng: %s\n" +
            "Mã giao dịch: %s\n" +
            "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.",
            orderId, transactionId
        );
        sendNotification(orderId, message);
    }

    @Override
    public void sendPaymentFailedNotification(String orderId, String error) {
        String message = String.format(
            "Thanh toán thất bại!\n" +
            "Mã đơn hàng: %s\n" +
            "Lỗi: %s\n" +
            "Vui lòng thử lại hoặc liên hệ hỗ trợ.",
            orderId, error
        );
        sendNotification(orderId, message);
    }
} 
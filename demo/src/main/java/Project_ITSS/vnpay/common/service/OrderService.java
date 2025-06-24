package Project_ITSS.vnpay.common.service;

import Project_ITSS.vnpay.common.entity.TransactionInfo;
import Project_ITSS.vnpay.common.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public void updateOrderStatus(String orderId, String status) {
        try {
            // TODO: Implement actual order status update logic
            logger.info("Order {} status updated to {}", orderId, status);
        } catch (Exception e) {
            logger.error("Error updating order status for order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void saveTransactionInfo(String orderId, Map<String, String> fields) {
        try {
            TransactionInfo transaction = new TransactionInfo();
            transaction.setOrderId(orderId);
            transaction.setTransactionNo(fields.get("vnp_TransactionNo"));
            transaction.setAmount(Long.parseLong(fields.getOrDefault("vnp_Amount", "0")));
            transaction.setBankCode(fields.get("vnp_BankCode"));
            transaction.setResponseCode(fields.get("vnp_ResponseCode"));
            transaction.setTransactionStatus(fields.get("vnp_TransactionStatus"));
            transaction.setPayDate(fields.get("vnp_PayDate"));
            transactionRepository.save(transaction);
            logger.info("Transaction info saved for order {}", orderId);
        } catch (Exception e) {
            logger.error("Error saving transaction info for order {}: {}", orderId, e.getMessage());
            throw e;
        }
    }

    public void sendNotification(String orderId, String message) {
        try {
            // TODO: Implement actual email sending logic
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo("customer@example.com"); // TODO: Get actual customer email
            mailMessage.setSubject("Payment Notification - Order " + orderId);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            logger.info("Notification sent for order {}: {}", orderId, message);
        } catch (Exception e) {
            logger.error("Error sending notification for order {}: {}", orderId, e.getMessage());
        }
    }
} 


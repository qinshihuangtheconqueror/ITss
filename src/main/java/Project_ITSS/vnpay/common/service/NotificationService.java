package Project_ITSS.vnpay.common.service;

/**
 * Interface cho notification service - giải quyết tight coupling
 * Cho phép thay đổi phương thức thông báo (Email, SMS, Push notification...)
 */
public interface NotificationService {
    void sendNotification(String orderId, String message);
    void sendPaymentSuccessNotification(String orderId, String transactionId);
    void sendPaymentFailedNotification(String orderId, String error);
} 
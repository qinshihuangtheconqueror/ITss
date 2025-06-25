package Project_ITSS.vnpay.common.observer;

import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;

/**
 * Observer Pattern cho Payment Notifications
 * Thông báo cho nhiều observers khi payment status thay đổi
 */
public interface PaymentObserver {
    void onPaymentSuccess(String orderId, PaymentResponse response);
    void onPaymentFailed(String orderId, String error);
} 
package Project_ITSS.vnpay.common.observer;

import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Subject trong Observer Pattern
 * Quản lý danh sách observers và thông báo cho họ
 */
@Component
public class PaymentSubject {
    private List<PaymentObserver> observers = new ArrayList<>();
    
    public void addObserver(PaymentObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    public void removeObserver(PaymentObserver observer) {
        observers.remove(observer);
    }
    
    public void notifyPaymentSuccess(String orderId, PaymentResponse response) {
        for (PaymentObserver observer : observers) {
            try {
                observer.onPaymentSuccess(orderId, response);
            } catch (Exception e) {
                // Log error but don't stop other observers
                System.err.println("Error notifying observer: " + e.getMessage());
            }
        }
    }
    
    public void notifyPaymentFailed(String orderId, String error) {
        for (PaymentObserver observer : observers) {
            try {
                observer.onPaymentFailed(orderId, error);
            } catch (Exception e) {
                // Log error but don't stop other observers
                System.err.println("Error notifying observer: " + e.getMessage());
            }
        }
    }
} 
package Project_ITSS.PlaceOrder.Service;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    @EventListener
    public void handleOrderCancelledEvent(OrderCancellationEvent event) {
        Order order = event.getOrder();
        RefundResult refundResult = event.getRefundResult();
        sendCancellationNotification(order, refundResult);
    }

    public void sendCancellationNotification(Order order, RefundResult refundResult) {
        // TODO: Thêm logic gửi thông báo thực tế ở đây
    }
} 
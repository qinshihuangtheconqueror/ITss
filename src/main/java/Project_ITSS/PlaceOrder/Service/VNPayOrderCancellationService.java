package Project_ITSS.PlaceOrder.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VNPayOrderCancellationService {

    private static final Logger logger = LoggerFactory.getLogger(VNPayOrderCancellationService.class);

    @Autowired
    private OrderEventPublisher orderEventPublisher;

    @Override
    protected void sendNotification(long orderId, RefundResult refundResult) {
        logger.info("Sending VNPay notification for cancelled order: {}", orderId);
        try {
            Order order = orderRepository.findById(orderId);
            if (order != null) {
                orderEventPublisher.publishOrderCancelled(
                    new OrderCancellationEvent(order, refundResult, getPaymentMethodName())
                );
            }
        } catch (Exception e) {
            logger.error("Error sending VNPay notification for order {}: {}", orderId, e.getMessage());
        }
    }
} 
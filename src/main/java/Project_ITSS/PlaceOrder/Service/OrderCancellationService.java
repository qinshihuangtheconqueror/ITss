package Project_ITSS.PlaceOrder.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderCancellationService {

    private final OrderValidationService validationService;
    private final OrderStatusService statusService;
    private final RefundService refundService;
    private final OrderEventPublisher orderEventPublisher;
    private final PaymentStrategyFactory paymentStrategyFactory;

    @Autowired
    public OrderCancellationService(
        OrderValidationService validationService,
        OrderStatusService statusService,
        RefundService refundService,
        OrderEventPublisher orderEventPublisher,
        PaymentStrategyFactory paymentStrategyFactory
    ) {
        this.validationService = validationService;
        this.statusService = statusService;
        this.refundService = refundService;
        this.orderEventPublisher = orderEventPublisher;
        this.paymentStrategyFactory = paymentStrategyFactory;
    }

    public void cancelOrder(Order order) {
        // Step 1: Validate order
        validationService.validateOrder(order);

        // Step 2: Update order status
        statusService.updateOrderStatus(order, OrderStatus.CANCELLED);

        // Step 3: Refund payment
        PaymentStrategy paymentStrategy = paymentStrategyFactory.getPaymentStrategy(order.getPaymentMethod());
        RefundResult refundResult = refundService.refund(order, paymentStrategy);

        // Step 4: Publish event
        orderEventPublisher.publishOrderCancelled(
            new OrderCancellationEvent(order, refundResult, paymentStrategy.getPaymentMethodName())
        );
    }
} 
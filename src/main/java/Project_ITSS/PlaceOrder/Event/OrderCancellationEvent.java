package Project_ITSS.PlaceOrder.Event;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;

public class OrderCancellationEvent {
    private final Order order;
    private final RefundResult refundResult;

    public OrderCancellationEvent(Order order, RefundResult refundResult) {
        this.order = order;
        this.refundResult = refundResult;
    }

    public Order getOrder() { return order; }
    public RefundResult getRefundResult() { return refundResult; }
} 
package Project_ITSS.PlaceOrder.Service;

import Project_ITSS.PlaceOrder.Entity.Order;
import Project_ITSS.PlaceOrder.Strategy.PaymentStrategy.RefundResult;

/**
 * Event class for order cancellation
 * Implements Observer Pattern - allows loose coupling between cancellation service and notification
 */
public class OrderCancellationEvent {
    
    private final Order order;
    private final RefundResult refundResult;
    private final long orderId;
    private final String paymentMethod;
    
    public OrderCancellationEvent(Order order, RefundResult refundResult, String paymentMethod) {
        this.order = order;
        this.refundResult = refundResult;
        this.orderId = order.getOrder_id();
        this.paymentMethod = paymentMethod;
    }
    
    // Getters
    public Order getOrder() {
        return order;
    }
    
    public RefundResult getRefundResult() {
        return refundResult;
    }
    
    public long getOrderId() {
        return orderId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    @Override
    public String toString() {
        return "OrderCancellationEvent{" +
                "orderId=" + orderId +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", refundAmount=" + refundResult.getAmount() +
                '}';
    }
} 
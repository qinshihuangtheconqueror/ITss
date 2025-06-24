package Project_ITSS.PlaceOrder.Exception;

/**
 * Exception thrown when order cancellation fails
 */
public class OrderCancellationException extends RuntimeException {
    
    private final long orderId;
    private final String reason;
    
    public OrderCancellationException(String message) {
        super(message);
        this.orderId = -1;
        this.reason = "Unknown";
    }
    
    public OrderCancellationException(String message, long orderId) {
        super(message);
        this.orderId = orderId;
        this.reason = "Unknown";
    }
    
    public OrderCancellationException(String message, long orderId, String reason) {
        super(message);
        this.orderId = orderId;
        this.reason = reason;
    }
    
    public OrderCancellationException(String message, Throwable cause) {
        super(message, cause);
        this.orderId = -1;
        this.reason = "Unknown";
    }
    
    public OrderCancellationException(String message, long orderId, String reason, Throwable cause) {
        super(message, cause);
        this.orderId = orderId;
        this.reason = reason;
    }
    
    public long getOrderId() {
        return orderId;
    }
    
    public String getReason() {
        return reason;
    }
} 
package Project_ITSS.PlaceOrder.Exception;

/**
 * Exception thrown when order is not found
 */
public class OrderNotFoundException extends RuntimeException {
    
    private final long orderId;
    
    public OrderNotFoundException(String message) {
        super(message);
        this.orderId = -1;
    }
    
    public OrderNotFoundException(String message, long orderId) {
        super(message);
        this.orderId = orderId;
    }
    
    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
        this.orderId = -1;
    }
    
    public OrderNotFoundException(String message, long orderId, Throwable cause) {
        super(message, cause);
        this.orderId = orderId;
    }
    
    public long getOrderId() {
        return orderId;
    }
} 
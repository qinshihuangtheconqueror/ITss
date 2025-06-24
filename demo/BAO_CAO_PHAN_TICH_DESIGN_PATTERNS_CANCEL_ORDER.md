# BÁO CÁO PHÂN TÍCH THIẾT KẾ BACKEND CANCEL ORDER
## Phân Tích Design Patterns Hiện Tại và Đề Xuất Cải Thiện

---

## 1. PHÂN TÍCH THIẾT KẾ HIỆN TẠI

### 1.1. Cấu Trúc Hiện Tại
```
CancelOrderController (Controller Layer)
├── OrderRepository_PlaceOrder (Data Access)
├── TransactionRepository (Data Access)  
├── VNPayService (Payment Service)
└── NonDBService_PlaceOrder (Email Service)

OrderCancellationTemplate (Abstract Template)
├── VNPayOrderCancellationService (Concrete Implementation)
└── CreditCardOrderCancellationService (Concrete Implementation)

OrderCancellationFactory (Factory Pattern)
```

### 1.2. Design Patterns Đã Áp Dụng
✅ **Template Method Pattern**: `OrderCancellationTemplate`
✅ **Factory Pattern**: `OrderCancellationFactory`  
✅ **Strategy Pattern**: Multiple cancellation services
✅ **Dependency Injection**: Spring Autowired

### 1.3. Vấn Đề Hiện Tại

#### 1.3.1. Tight Coupling trong Controller
```java
// CancelOrderController.java - VẤN ĐỀ
@Autowired
private OrderRepository_PlaceOrder orderRepository;
@Autowired
private TransactionRepository transactionRepository;
@Autowired
private VNPayService vnPayService;
@Autowired
private NonDBService_PlaceOrder mailService;
```

**Vấn đề:**
- Controller phụ thuộc trực tiếp vào concrete classes
- Khó thay thế implementation (VD: đổi từ VNPay sang PayPal)
- Khó test unit test (phải mock nhiều dependencies)
- Vi phạm Dependency Inversion Principle

#### 1.3.2. Business Logic trong Controller
```java
// CancelOrderController.java - VẤN ĐỀ
@PostMapping("/cancel")
public ResponseEntity<?> cancelOrder(@RequestParam("order_id") long orderId, HttpServletRequest request) {
    // Business logic trực tiếp trong controller
    Order order = orderRepository.getOrderById(orderId);
    if (order == null) { /* validation logic */ }
    if (!"pending".equalsIgnoreCase(order.getStatus())) { /* business rule */ }
    orderRepository.updateOrderStatus(orderId, "cancelled");
    // Payment processing logic
    // Email notification logic
}
```

**Vấn đề:**
- Controller chứa quá nhiều business logic
- Vi phạm Single Responsibility Principle
- Business logic bị hard-code trong controller
- Khó tái sử dụng logic cho các use case khác

#### 1.3.3. Thiếu Interface Abstractions
- Không có interface cho OrderRepository
- Không có interface cho PaymentService
- Không có interface cho NotificationService

---

## 2. ĐỀ XUẤT CẢI THIỆN DESIGN PATTERNS

### 2.1. Áp Dụng Interface Segregation Principle (ISP)

#### 2.1.1. Tạo Repository Interfaces
```java
// IOrderRepository.java
public interface IOrderRepository {
    Order findById(long orderId);
    void updateStatus(long orderId, String status);
    DeliveryInformation getDeliveryInfo(long deliveryId);
}

// ITransactionRepository.java  
public interface ITransactionRepository {
    TransactionInfo findByOrderId(String orderId);
    void saveTransaction(TransactionInfo transaction);
}
```

#### 2.1.2. Tạo Service Interfaces
```java
// IPaymentService.java
public interface IPaymentService {
    RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest);
    boolean validateTransaction(String orderId);
}

// INotificationService.java
public interface INotificationService {
    void sendCancellationNotification(long orderId, String email, String message);
    void sendRefundNotification(long orderId, String email, double amount);
}
```

### 2.2. Áp Dụng Strategy Pattern cho Payment Methods

#### 2.2.1. Payment Strategy Interface
```java
// PaymentStrategy.java
public interface PaymentStrategy {
    RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest);
    boolean validateTransaction(String orderId);
    String getPaymentMethodName();
}
```

#### 2.2.2. Concrete Payment Strategies
```java
// VNPayPaymentStrategy.java
@Service
public class VNPayPaymentStrategy implements PaymentStrategy {
    @Override
    public RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest) {
        // VNPay specific refund logic
    }
    
    @Override
    public String getPaymentMethodName() {
        return "VNPay";
    }
}

// CreditCardPaymentStrategy.java
@Service  
public class CreditCardPaymentStrategy implements PaymentStrategy {
    @Override
    public RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest) {
        // Credit card specific refund logic
    }
    
    @Override
    public String getPaymentMethodName() {
        return "CreditCard";
    }
}
```

### 2.3. Áp Dụng Command Pattern cho Order Operations

#### 2.3.1. Command Interface
```java
// OrderCommand.java
public interface OrderCommand {
    CommandResult execute();
    void undo();
}

// CommandResult.java
public class CommandResult {
    private boolean success;
    private String message;
    private Object data;
    // getters and setters
}
```

#### 2.3.2. Cancel Order Command
```java
// CancelOrderCommand.java
public class CancelOrderCommand implements OrderCommand {
    private final long orderId;
    private final HttpServletRequest request;
    private final OrderCancellationService cancellationService;
    private String originalStatus;
    
    public CancelOrderCommand(long orderId, HttpServletRequest request, 
                            OrderCancellationService cancellationService) {
        this.orderId = orderId;
        this.request = request;
        this.cancellationService = cancellationService;
    }
    
    @Override
    public CommandResult execute() {
        return cancellationService.cancelOrder(orderId, request);
    }
    
    @Override
    public void undo() {
        if (originalStatus != null) {
            cancellationService.updateOrderStatus(orderId, originalStatus);
        }
    }
}
```

### 2.4. Áp Dụng Observer Pattern cho Notifications

#### 2.4.1. Event System
```java
// OrderCancelledEvent.java
public class OrderCancelledEvent {
    private final long orderId;
    private final String customerEmail;
    private final double refundAmount;
    private final String paymentMethod;
    
    // constructor and getters
}

// OrderEventPublisher.java
@Component
public class OrderEventPublisher {
    private final ApplicationEventPublisher eventPublisher;
    
    public void publishOrderCancelled(OrderCancelledEvent event) {
        eventPublisher.publishEvent(event);
    }
}
```

#### 2.4.2. Event Listeners
```java
// EmailNotificationListener.java
@Component
public class EmailNotificationListener {
    
    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        // Send email notification
    }
}

// AuditLogListener.java
@Component
public class AuditLogListener {
    
    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        // Log to audit system
    }
}
```

### 2.5. Cải Thiện Controller với Service Layer

#### 2.5.1. Order Cancellation Service
```java
// OrderCancellationService.java
@Service
@Transactional
public class OrderCancellationService {
    
    private final IOrderRepository orderRepository;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final OrderEventPublisher eventPublisher;
    
    public CommandResult cancelOrder(long orderId, HttpServletRequest request) {
        // 1. Validate order
        Order order = validateOrder(orderId);
        
        // 2. Get payment strategy
        PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(order);
        
        // 3. Execute cancellation
        CommandResult result = executeCancellation(order, paymentStrategy, request);
        
        // 4. Publish event if successful
        if (result.isSuccess()) {
            publishCancellationEvent(order, result);
        }
        
        return result;
    }
    
    private Order validateOrder(long orderId) {
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderNotFoundException("Order not found: " + orderId);
        }
        if (!canCancelOrder(order)) {
            throw new OrderCancellationException("Order cannot be cancelled");
        }
        return order;
    }
    
    private boolean canCancelOrder(Order order) {
        return "pending".equalsIgnoreCase(order.getStatus());
    }
}
```

#### 2.5.2. Cải Thiện Controller
```java
// CancelOrderController.java - CẢI THIỆN
@RestController
@RequestMapping("/api/order")
public class CancelOrderController {
    
    private final OrderCancellationService cancellationService;
    
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelOrder(@RequestParam("order_id") long orderId, 
                                       HttpServletRequest request) {
        try {
            CommandResult result = cancellationService.cancelOrder(orderId, request);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result.getData());
            } else {
                return ResponseEntity.badRequest().body(result.getMessage());
            }
            
        } catch (OrderNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (OrderCancellationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal error: " + e.getMessage());
        }
    }
}
```

---

## 3. KIẾN TRÚC MỚI ĐỀ XUẤT

### 3.1. Cấu Trúc Thư Mục
```
src/main/java/Project_ITSS/PlaceOrder/
├── Controller/
│   └── CancelOrderController.java
├── Service/
│   ├── OrderCancellationService.java
│   ├── OrderCancellationTemplate.java
│   ├── VNPayOrderCancellationService.java
│   └── CreditCardOrderCancellationService.java
├── Command/
│   ├── OrderCommand.java
│   ├── CancelOrderCommand.java
│   └── CommandResult.java
├── Strategy/
│   ├── PaymentStrategy.java
│   ├── VNPayPaymentStrategy.java
│   └── CreditCardPaymentStrategy.java
├── Factory/
│   ├── PaymentStrategyFactory.java
│   └── OrderCancellationFactory.java
├── Event/
│   ├── OrderCancelledEvent.java
│   ├── OrderEventPublisher.java
│   └── Listeners/
│       ├── EmailNotificationListener.java
│       └── AuditLogListener.java
├── Repository/
│   ├── IOrderRepository.java
│   ├── ITransactionRepository.java
│   └── Implementation/
│       ├── OrderRepositoryImpl.java
│       └── TransactionRepositoryImpl.java
└── Exception/
    ├── OrderNotFoundException.java
    ├── OrderCancellationException.java
    └── PaymentProcessingException.java
```

### 3.2. Dependency Flow
```
Controller → Service → Command → Strategy → Repository
                ↓
            Event Publisher → Event Listeners
```

---

## 4. LỢI ÍCH CỦA THIẾT KẾ MỚI

### 4.1. Low Coupling
- Controller chỉ phụ thuộc vào Service interface
- Service phụ thuộc vào Strategy interface
- Dễ thay thế implementation

### 4.2. High Cohesion  
- Mỗi class có trách nhiệm rõ ràng
- Business logic tách biệt khỏi controller
- Dễ maintain và debug

### 4.3. Extensibility
- Dễ thêm payment method mới
- Dễ thêm notification channel mới
- Dễ thêm audit log type mới

### 4.4. Testability
- Dễ mock dependencies
- Dễ test từng component riêng biệt
- Dễ test business logic

### 4.5. Maintainability
- Code sạch và dễ đọc
- Dễ thêm tính năng mới
- Dễ sửa lỗi

---

## 5. KẾT LUẬN

Thiết kế hiện tại đã có một số design patterns tốt (Template Method, Factory) nhưng vẫn còn nhiều vấn đề về coupling và cohesion. Bằng cách áp dụng thêm các design patterns (Strategy, Command, Observer) và tạo interface abstractions, chúng ta có thể tạo ra một hệ thống:

✅ **Low Coupling**: Các component ít phụ thuộc lẫn nhau  
✅ **High Cohesion**: Mỗi class có trách nhiệm rõ ràng  
✅ **Extensible**: Dễ thêm payment method mới  
✅ **Testable**: Dễ viết unit test  
✅ **Maintainable**: Dễ maintain và debug  

Việc refactor này sẽ tạo ra một codebase sạch, dễ mở rộng và tuân thủ các nguyên tắc thiết kế tốt. 
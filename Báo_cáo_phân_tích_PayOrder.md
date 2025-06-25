# BÁO CÁO PHÂN TÍCH LUỒNG PAY ORDER - AIMS PROJECT

## Tổng quan
Báo cáo này phân tích luồng thanh toán (Pay Order) trong dự án AIMS theo các tiêu chí:
- Lab 11: Coupling & Cohesion
- Lab 12: SOLID Principles  
- Lab 13-14: Design Patterns

## 1. PHÂN TÍCH LUỒNG PAY ORDER HIỆN TẠI

### 1.1 Kiến trúc tổng quan
```
PayOrderController → VNPayService → VNPayConfig
                    ↓
                OrderService → TransactionRepository
```

### 1.2 Các thành phần chính:
- **PayOrderController**: Xử lý request thanh toán từ frontend
- **VNPayController**: Xử lý callback và IPN từ VNPay
- **VNPayService**: Logic nghiệp vụ thanh toán VNPay
- **OrderService**: Quản lý trạng thái đơn hàng và thông báo
- **VNPayConfig**: Cấu hình và utility methods
- **TransactionInfo**: Entity lưu thông tin giao dịch

---

## 2. LAB 11: PHÂN TÍCH COUPLING & COHESION

### 2.1 Vấn đề về COUPLING (High Coupling)

#### 2.1.1 VNPayController - Tight Coupling với VNPayService
**Đoạn mã vi phạm:**
```java
// VNPayController.java lines 35-40
@Autowired
public VNPayController(VNPayService vnPayService, OrderService orderService) {
    this.vnPayService = vnPayService;
    this.orderService = orderService;
}
```

**Vấn đề:** 
- Controller phụ thuộc trực tiếp vào VNPayService cụ thể
- Khó thay đổi provider thanh toán (từ VNPay sang MoMo, ZaloPay...)
- Vi phạm Dependency Inversion Principle

**Định hướng giải pháp:**
- Tạo interface `PaymentService` 
- VNPayService implement PaymentService
- Controller inject PaymentService thay vì VNPayService

#### 2.1.2 VNPayService - Tight Coupling với VNPayConfig
**Đoạn mã vi phạm:**
```java
// VNPayService.java lines 30-35
@Autowired
public VNPayService(VNPayConfig vnPayConfig) {
    this.vnPayConfig = vnPayConfig;
    this.restTemplate = new RestTemplate();
}
```

**Vấn đề:**
- Service phụ thuộc trực tiếp vào VNPayConfig
- Khó test (cần mock VNPayConfig)
- Khó mở rộng cho nhiều provider

**Định hướng giải pháp:**
- Tạo interface `PaymentConfig`
- Inject configuration thông qua interface

#### 2.1.3 OrderService - Tight Coupling với JavaMailSender
**Đoạn mã vi phạm:**
```java
// OrderService.java lines 15-16
@Autowired
private JavaMailSender mailSender;
```

**Vấn đề:**
- Phụ thuộc trực tiếp vào JavaMailSender
- Khó thay đổi phương thức thông báo (SMS, Push notification...)

**Định hướng giải pháp:**
- Tạo interface `NotificationService`
- EmailNotificationService implement NotificationService

### 2.2 Vấn đề về COHESION (Low Cohesion)

#### 2.2.1 VNPayService - Violation of Single Responsibility
**Đoạn mã vi phạm:**
```java
// VNPayService.java - Class có quá nhiều trách nhiệm
public class VNPayService {
    // Tạo payment
    public PaymentResponse createPayment(...) { ... }
    
    // Query transaction  
    public QueryResponse queryTransaction(...) { ... }
    
    // Refund transaction
    public RefundResponse refundTransaction(...) { ... }
    
    // Handle IPN
    public IPNResponse handleIpnRequest(...) { ... }
    
    // Hash generation
    public String hashAllFields(...) { ... }
    
    // HTTP calls
    private <T> T callVnpayApi(...) { ... }
}
```

**Vấn đề:**
- Class có quá nhiều trách nhiệm khác nhau
- Khó maintain và test
- Vi phạm Single Responsibility Principle

**Định hướng giải pháp:**
- Tách thành các service riêng biệt:
  - `PaymentCreationService`
  - `PaymentQueryService` 
  - `PaymentRefundService`
  - `IPNHandlerService`
  - `HashService`
  - `HttpClientService`

#### 2.2.2 VNPayController - Mixed Concerns
**Đoạn mã vi phạm:**
```java
// VNPayController.java lines 70-120
@GetMapping("/return")
public ResponseEntity<Map<String, Object>> returnPage(...) {
    // Validation logic
    String signValue = vnPayService.hashAllFields(fields);
    boolean isValidHash = signValue.equals(vnp_SecureHash);
    
    // Business logic
    if (isValidHash) {
        updateOrderStatus(orderId, "PAID");
        saveTransactionInfo(orderId, fields);
        sendNotification(orderId, "Payment successful");
    }
    
    // Response formatting
    result.put("status", "SUCCESS");
    result.put("message", "Payment completed successfully");
}
```

**Vấn đề:**
- Controller chứa logic validation, business logic và response formatting
- Khó test từng phần riêng biệt
- Vi phạm Single Responsibility Principle

**Định hướng giải pháp:**
- Tách validation logic ra `PaymentValidator`
- Tách business logic ra `PaymentProcessor`
- Controller chỉ handle HTTP concerns

#### 2.2.3 VNPayConfig - Mixed Responsibilities
**Đoạn mã vi phạm:**
```java
// VNPayConfig.java - Class có nhiều trách nhiệm
public class VNPayConfig {
    // Configuration properties
    @Value("${vnpay.pay-url}")
    private String payUrl;
    
    // Hash generation
    public String hashAllFields(Map fields) { ... }
    public String hmacSHA512(String key, String data) { ... }
    
    // IP address extraction
    public String getIpAddress(HttpServletRequest request) { ... }
    
    // Random number generation
    public String getRandomNumber(int len) { ... }
}
```

**Vấn đề:**
- Class vừa chứa config vừa chứa utility methods
- Khó tái sử dụng utility methods
- Vi phạm Single Responsibility Principle

**Định hướng giải pháp:**
- Tách utility methods ra các class riêng:
  - `HashUtils`
  - `NetworkUtils`
  - `RandomUtils`

---

## 3. LAB 12: PHÂN TÍCH SOLID PRINCIPLES

### 3.1 Single Responsibility Principle (SRP) - VI PHẠM

#### 3.1.1 VNPayService vi phạm SRP
**Đoạn mã vi phạm:**
```java
// VNPayService.java - Class có quá nhiều trách nhiệm
public class VNPayService {
    // Trách nhiệm 1: Tạo payment
    public PaymentResponse createPayment(...) { ... }
    
    // Trách nhiệm 2: Query transaction
    public QueryResponse queryTransaction(...) { ... }
    
    // Trách nhiệm 3: Refund transaction  
    public RefundResponse refundTransaction(...) { ... }
    
    // Trách nhiệm 4: Handle IPN
    public IPNResponse handleIpnRequest(...) { ... }
    
    // Trách nhiệm 5: Hash generation
    public String hashAllFields(...) { ... }
    
    // Trách nhiệm 6: HTTP communication
    private <T> T callVnpayApi(...) { ... }
}
```

**Vì sao vi phạm:**
- Khi thêm tính năng mới (ví dụ: hỗ trợ MoMo), cần sửa class này
- Khi thay đổi logic hash, ảnh hưởng toàn bộ payment operations
- Khó test từng chức năng riêng biệt

**Định hướng giải pháp:**
```java
// Tách thành các interface riêng biệt
public interface PaymentCreationService {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
}

public interface PaymentQueryService {
    QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest);
}

public interface PaymentRefundService {
    RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest);
}

public interface IPNHandlerService {
    IPNResponse handleIpnRequest(Map<String, String> params);
}

public interface HashService {
    String hashAllFields(Map<String, String> fields);
    String hmacSHA512(String key, String data);
}

public interface HttpClientService {
    <T> T callApi(String url, Map<String, String> params, Class<T> responseType);
}
```

### 3.2 Open/Closed Principle (OCP) - VI PHẠM

#### 3.2.1 PayOrderController vi phạm OCP
**Đoạn mã vi phạm:**
```java
// PayOrderController.java lines 20-30
@Autowired
private VNPayService vnPayService;

@PostMapping("/payment")
public ResponseEntity<?> createVNPayPayment(...) {
    // Hard-coded cho VNPay
    PaymentRequest paymentRequest = new PaymentRequest();
    // ...
    var response = vnPayService.createPayment(paymentRequest, request);
    return ResponseEntity.ok(response);
}
```

**Vì sao vi phạm:**
- Khi thêm provider thanh toán mới (MoMo, ZaloPay), cần sửa controller
- Không thể mở rộng mà không sửa đổi code hiện tại

**Định hướng giải pháp:**
```java
// Sử dụng Strategy Pattern
public interface PaymentProvider {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
}

public class VNPayProvider implements PaymentProvider { ... }
public class MoMoProvider implements PaymentProvider { ... }

@Autowired
private Map<String, PaymentProvider> paymentProviders;

@PostMapping("/payment")
public ResponseEntity<?> createPayment(@RequestParam String provider, ...) {
    PaymentProvider paymentProvider = paymentProviders.get(provider);
    return ResponseEntity.ok(paymentProvider.createPayment(paymentRequest, request));
}
```

### 3.3 Liskov Substitution Principle (LSP) - TUÂN THỦ

#### 3.3.1 TransactionRepository tuân thủ LSP
**Đoạn mã tuân thủ:**
```java
// TransactionRepository.java
public interface TransactionRepository extends JpaRepository<TransactionInfo, Long> {
    TransactionInfo findByOrderId(String orderId);
}
```

**Vì sao tuân thủ:**
- Extends JpaRepository đảm bảo có thể thay thế bằng bất kỳ implementation nào
- Không vi phạm contract của JpaRepository

### 3.4 Interface Segregation Principle (ISP) - VI PHẠM

#### 3.4.1 VNPayService vi phạm ISP
**Đoạn mã vi phạm:**
```java
// VNPayService.java - Interface quá lớn
public class VNPayService {
    // Methods cho payment creation
    public PaymentResponse createPayment(...) { ... }
    
    // Methods cho payment querying  
    public QueryResponse queryTransaction(...) { ... }
    
    // Methods cho payment refunding
    public RefundResponse refundTransaction(...) { ... }
    
    // Methods cho IPN handling
    public IPNResponse handleIpnRequest(...) { ... }
}
```

**Vì sao vi phạm:**
- Client phải implement tất cả methods ngay cả khi chỉ cần một số
- Khó tạo mock cho testing

**Định hướng giải pháp:**
```java
// Tách thành các interface nhỏ
public interface PaymentCreator {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
}

public interface PaymentQuerier {
    QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest);
}

public interface PaymentRefunder {
    RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest);
}

public interface IPNHandler {
    IPNResponse handleIpnRequest(Map<String, String> params);
}
```

### 3.5 Dependency Inversion Principle (DIP) - VI PHẠM

#### 3.5.1 PayOrderController vi phạm DIP
**Đoạn mã vi phạm:**
```java
// PayOrderController.java lines 20-21
@Autowired
private VNPayService vnPayService;
```

**Vì sao vi phạm:**
- Controller phụ thuộc vào concrete class VNPayService
- Không phụ thuộc vào abstraction

**Định hướng giải pháp:**
```java
// Sử dụng abstraction
public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
}

@Autowired
private PaymentService paymentService;
```

---

## 4. LAB 13-14: DESIGN PATTERNS ĐỀ XUẤT

### 4.1 Strategy Pattern - Cho Payment Providers

**Mục đích:** Cho phép thay đổi payment provider mà không sửa code hiện tại

**Thiết kế:**
```java
// Strategy Interface
public interface PaymentStrategy {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
    QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest);
    RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest);
}

// Concrete Strategies
public class VNPayStrategy implements PaymentStrategy {
    private final VNPayConfig config;
    private final HashService hashService;
    private final HttpClientService httpClient;
    
    @Override
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        // VNPay specific implementation
    }
}

public class MoMoStrategy implements PaymentStrategy {
    // MoMo specific implementation
}

// Context
public class PaymentContext {
    private PaymentStrategy strategy;
    
    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }
    
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        return strategy.createPayment(request, servletRequest);
    }
}
```

### 4.2 Factory Pattern - Cho Payment Strategy Creation

**Mục đích:** Tạo payment strategy dựa trên provider type

**Thiết kế:**
```java
public interface PaymentStrategyFactory {
    PaymentStrategy createStrategy(String providerType);
}

public class PaymentStrategyFactoryImpl implements PaymentStrategyFactory {
    @Autowired
    private VNPayConfig vnPayConfig;
    @Autowired
    private HashService hashService;
    @Autowired
    private HttpClientService httpClient;
    
    @Override
    public PaymentStrategy createStrategy(String providerType) {
        switch (providerType.toLowerCase()) {
            case "vnpay":
                return new VNPayStrategy(vnPayConfig, hashService, httpClient);
            case "momo":
                return new MoMoStrategy();
            default:
                throw new IllegalArgumentException("Unsupported payment provider: " + providerType);
        }
    }
}
```

### 4.3 Template Method Pattern - Cho Payment Processing

**Mục đích:** Định nghĩa skeleton của payment process, cho phép subclasses override specific steps

**Thiết kế:**
```java
public abstract class AbstractPaymentProcessor {
    
    // Template method
    public final PaymentResponse processPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        validateRequest(request);
        PaymentResponse response = createPayment(request, servletRequest);
        logTransaction(request, response);
        return response;
    }
    
    // Abstract methods - must be implemented by subclasses
    protected abstract PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
    protected abstract void validateRequest(PaymentRequest request);
    
    // Concrete methods - common implementation
    protected void logTransaction(PaymentRequest request, PaymentResponse response) {
        // Common logging logic
    }
}

public class VNPayProcessor extends AbstractPaymentProcessor {
    @Override
    protected PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        // VNPay specific implementation
    }
    
    @Override
    protected void validateRequest(PaymentRequest request) {
        // VNPay specific validation
    }
}
```

### 4.4 Observer Pattern - Cho Payment Notifications

**Mục đích:** Thông báo cho nhiều observers khi payment status thay đổi

**Thiết kế:**
```java
public interface PaymentObserver {
    void onPaymentSuccess(String orderId, PaymentResponse response);
    void onPaymentFailed(String orderId, String error);
}

public class EmailNotificationObserver implements PaymentObserver {
    @Override
    public void onPaymentSuccess(String orderId, PaymentResponse response) {
        // Send email notification
    }
    
    @Override
    public void onPaymentFailed(String orderId, String error) {
        // Send failure email
    }
}

public class SMSPaymentObserver implements PaymentObserver {
    @Override
    public void onPaymentSuccess(String orderId, PaymentResponse response) {
        // Send SMS notification
    }
    
    @Override
    public void onPaymentFailed(String orderId, String error) {
        // Send failure SMS
    }
}

public class PaymentSubject {
    private List<PaymentObserver> observers = new ArrayList<>();
    
    public void addObserver(PaymentObserver observer) {
        observers.add(observer);
    }
    
    public void notifyPaymentSuccess(String orderId, PaymentResponse response) {
        for (PaymentObserver observer : observers) {
            observer.onPaymentSuccess(orderId, response);
        }
    }
}
```

### 4.5 Command Pattern - Cho Payment Operations

**Mục đích:** Encapsulate payment operations thành objects, cho phép queue, log, undo operations

**Thiết kế:**
```java
public interface PaymentCommand {
    PaymentResponse execute();
    void undo();
}

public class CreatePaymentCommand implements PaymentCommand {
    private final PaymentRequest request;
    private final HttpServletRequest servletRequest;
    private final PaymentStrategy strategy;
    private PaymentResponse result;
    
    public CreatePaymentCommand(PaymentRequest request, HttpServletRequest servletRequest, PaymentStrategy strategy) {
        this.request = request;
        this.servletRequest = servletRequest;
        this.strategy = strategy;
    }
    
    @Override
    public PaymentResponse execute() {
        result = strategy.createPayment(request, servletRequest);
        return result;
    }
    
    @Override
    public void undo() {
        // Implement rollback logic if needed
    }
}

public class PaymentCommandInvoker {
    private final Queue<PaymentCommand> commandQueue = new LinkedList<>();
    
    public void addCommand(PaymentCommand command) {
        commandQueue.add(command);
    }
    
    public PaymentResponse executeNext() {
        PaymentCommand command = commandQueue.poll();
        return command != null ? command.execute() : null;
    }
}
```

---

## 5. KẾT LUẬN VÀ KHUYẾN NGHỊ

### 5.1 Tóm tắt vấn đề chính:
1. **High Coupling**: Các component phụ thuộc trực tiếp vào concrete classes
2. **Low Cohesion**: Các class có quá nhiều trách nhiệm
3. **Vi phạm SOLID**: Đặc biệt là SRP, OCP, ISP, DIP

### 5.2 Lộ trình cải tiến:
1. **Phase 1**: Tách interfaces và áp dụng Strategy Pattern
2. **Phase 2**: Implement Factory Pattern cho payment providers
3. **Phase 3**: Áp dụng Observer Pattern cho notifications
4. **Phase 4**: Refactor để tuân thủ Template Method Pattern

### 5.3 Lợi ích sau khi cải tiến:
- **Dễ mở rộng**: Thêm payment provider mới không cần sửa code hiện tại
- **Dễ test**: Có thể mock từng component riêng biệt
- **Dễ maintain**: Mỗi class có trách nhiệm rõ ràng
- **Tuân thủ SOLID**: Code sạch và có thể tái sử dụng cao

---

## 6. TÀI LIỆU THAM KHẢO
- Spring Framework Documentation
- VNPay Integration Guide
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Clean Code by Robert C. Martin
- SOLID Principles by Robert C. Martin 
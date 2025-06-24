# BÁO CÁO PHÂN TÍCH BACKEND CANCEL ORDER

## 1. PHÂN TÍCH COUPLING/COHESION

### 1.1 Các vấn đề về Coupling (High Coupling)

#### 1.1.1 CancelOrderController - Tight Coupling với nhiều dependencies

**Đoạn code vi phạm:**
```java
@RestController
@RequestMapping("/api/order")
public class CancelOrderController {
    @Autowired
    private OrderRepository_PlaceOrder orderRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private NonDBService_PlaceOrder mailService;
}
```

**Vấn đề:**
- Controller phụ thuộc trực tiếp vào 4 service/repository khác nhau
- Khi thêm payment method mới (Momo, ZaloPay), cần sửa đổi controller
- Khó test vì phải mock nhiều dependencies
- Vi phạm Dependency Inversion Principle

**Định hướng giải pháp:**
- Tạo interface `OrderCancellationService` 
- Sử dụng Factory Pattern để chọn service phù hợp
- Controller chỉ phụ thuộc vào interface

#### 1.1.2 VNPayService - Tight Coupling với VNPay API

**Đoạn code vi phạm:**
```java
public RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest) {
    // Hard-coded VNPay specific parameters
    String vnp_Version = "2.1.0";
    String vnp_Command = "refund";
    String vnp_TmnCode = vnPayConfig.getTmnCode();
    // ... nhiều VNPay specific logic
}
```

**Vấn đề:**
- Service chứa logic cụ thể cho VNPay
- Khó mở rộng cho payment gateway khác
- Vi phạm Open/Closed Principle

**Định hướng giải pháp:**
- Tạo interface `PaymentGatewayService`
- Implement `VNPayGatewayService`, `MomoGatewayService`
- Sử dụng Strategy Pattern

#### 1.1.3 OrderRepository - Tight Coupling với Database Schema

**Đoạn code vi phạm:**
```java
public void saveOrder(Order order, DeliveryInformation dI){
    String sqlDelivery = "INSERT INTO DeliveryInformation (Name, Phone, Email, Address, Province, Shipping_message, shipping_fee) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING delivery_id";
    // Hard-coded SQL queries
}
```

**Vấn đề:**
- SQL queries hard-coded trong repository
- Thay đổi database schema cần sửa code
- Khó chuyển đổi database

**Định hướng giải pháp:**
- Sử dụng JPA/Hibernate
- Tạo abstract base repository
- Sử dụng Query DSL

### 1.2 Các vấn đề về Cohesion (Low Cohesion)

#### 1.2.1 NonDBService_PlaceOrder - Mixed Responsibilities

**Đoạn code vi phạm:**
```java
@Service
public class NonDBService_PlaceOrder {
    // Email service
    public void SendSuccessEmail(String toEmail,String subject,String content)
    
    // Validation service  
    public boolean CheckInfoValidity(String name, String phone, String email, String address, String province,String paymentMethod)
    
    // Notification service
    public void sendSuccessNotification(String customer, String message)
}
```

**Vấn đề:**
- Class có nhiều trách nhiệm khác nhau
- Email, validation, notification logic trong cùng class
- Vi phạm Single Responsibility Principle

**Định hướng giải pháp:**
- Tách thành `EmailService`, `ValidationService`, `NotificationService`
- Mỗi class chỉ có một trách nhiệm

#### 1.2.2 Order Entity - Business Logic trong Entity

**Đoạn code vi phạm:**
```java
public class Order {
    public void createOrder(Cart cart){
        for(CartItem Cartproduct  : cart.getProducts()){
            Product product = Cartproduct.getProduct();
            int quantity = Cartproduct.getQuantity();
            this.Total_before_VAT += quantity * product.getPrice();
            this.Total_after_VAT += (quantity * product.getPrice()) + ((quantity * product.getPrice()) * this.VAT)/100;
            // Business logic trong entity
        }
    }
}
```

**Vấn đề:**
- Entity chứa business logic
- Khó test và maintain
- Vi phạm Single Responsibility Principle

**Định hướng giải pháp:**
- Chuyển business logic sang `OrderService`
- Entity chỉ chứa data và basic getters/setters

## 2. PHÂN TÍCH VI PHẠM SOLID PRINCIPLES

### 2.1 Single Responsibility Principle (SRP)

#### 2.1.1 CancelOrderController vi phạm SRP

**Đoạn code vi phạm:**
```java
@PostMapping("/cancel")
public ResponseEntity<?> cancelOrder(@RequestParam("order_id") long orderId, HttpServletRequest request) {
    // Validation logic
    // Business logic
    // Payment processing
    // Email notification
    // Database operations
}
```

**Vấn đề:**
- Controller xử lý quá nhiều trách nhiệm
- Khó test từng phần riêng biệt
- Khó maintain và extend

**Định hướng giải pháp:**
- Tách thành các service riêng biệt
- Controller chỉ handle HTTP request/response
- Sử dụng Facade Pattern

#### 2.1.2 VNPayService vi phạm SRP

**Đoạn code vi phạm:**
```java
public class VNPayService {
    // Payment creation
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest)
    
    // Transaction query
    public QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest)
    
    // Refund processing
    public RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest)
    
    // IPN handling
    public IPNResponse handleIpnRequest(Map<String, String> params)
}
```

**Vấn đề:**
- Service xử lý nhiều loại operation khác nhau
- Khó maintain và test

**Định hướng giải pháp:**
- Tách thành `VNPayPaymentService`, `VNPayQueryService`, `VNPayRefundService`
- Mỗi service chỉ handle một loại operation

### 2.2 Open/Closed Principle (OCP)

#### 2.2.1 CancelOrderController vi phạm OCP

**Đoạn code vi phạm:**
```java
// Hard-coded VNPay logic
RefundRequest refundRequest = new RefundRequest();
refundRequest.setTranType("02"); // 02: Hoàn toàn bộ giao dịch
var refundResponse = vnPayService.refundTransaction(refundRequest, request);
```

**Vấn đề:**
- Code hard-coded cho VNPay
- Thêm payment method mới cần sửa code hiện tại

**Định hướng giải pháp:**
- Sử dụng Strategy Pattern
- Tạo interface `PaymentRefundStrategy`
- Implement cho từng payment method

### 2.3 Liskov Substitution Principle (LSP)

#### 2.3.1 Không có vi phạm LSP rõ ràng

Codebase hiện tại không có inheritance hierarchy phức tạp để vi phạm LSP.

### 2.4 Interface Segregation Principle (ISP)

#### 2.4.1 VNPayService vi phạm ISP

**Đoạn code vi phạm:**
```java
public class VNPayService {
    // Client phải implement tất cả methods dù chỉ cần một số
    public PaymentResponse createPayment(...)
    public QueryResponse queryTransaction(...)
    public RefundResponse refundTransaction(...)
    public IPNResponse handleIpnRequest(...)
}
```

**Vấn đề:**
- Client phải depend on interface có nhiều methods không cần thiết
- Khó test và maintain

**Định hướng giải pháp:**
- Tách thành các interface nhỏ: `PaymentCreator`, `TransactionQuerier`, `RefundProcessor`
- Client chỉ implement interface cần thiết

### 2.5 Dependency Inversion Principle (DIP)

#### 2.5.1 CancelOrderController vi phạm DIP

**Đoạn code vi phạm:**
```java
@Autowired
private OrderRepository_PlaceOrder orderRepository;
@Autowired
private VNPayService vnPayService;
```

**Vấn đề:**
- Controller phụ thuộc vào concrete classes
- Khó test và thay đổi implementation

**Định hướng giải pháp:**
- Tạo interfaces: `OrderRepository`, `PaymentService`
- Controller phụ thuộc vào abstractions
- Sử dụng Dependency Injection

## 3. ĐÁNH GIÁ DESIGN PATTERNS ĐÃ ÁP DỤNG

### 3.1 Template Method Pattern (Tốt)

**File:** `OrderCancellationTemplate.java`

**Điểm tốt:**
- Tách biệt algorithm structure và implementation
- Dễ extend cho payment method mới
- Code reuse tốt

**Cải tiến:**
- Thêm error handling strategy
- Sử dụng Strategy Pattern kết hợp

### 3.2 Factory Pattern (Tốt)

**File:** `OrderCancellationFactory.java`

**Điểm tốt:**
- Encapsulate object creation
- Dễ thêm payment method mới

**Cải tiến:**
- Sử dụng enum cho payment methods
- Thêm validation cho factory input

## 4. KẾT LUẬN VÀ KHUYẾN NGHỊ

### 4.1 Vấn đề chính cần giải quyết:
1. **High Coupling:** Controller phụ thuộc quá nhiều concrete classes
2. **Low Cohesion:** Services có nhiều trách nhiệm
3. **Vi phạm SRP:** Business logic phân tán
4. **Vi phạm OCP:** Hard-coded payment logic
5. **Vi phạm DIP:** Phụ thuộc concrete classes

### 4.2 Hướng cải tiến:
1. **Áp dụng Clean Architecture**
2. **Sử dụng Strategy Pattern** cho payment methods
3. **Tách business logic** ra khỏi entities
4. **Tạo interfaces** cho tất cả dependencies
5. **Sử dụng Facade Pattern** cho complex operations

### 4.3 Ưu tiên refactoring:
1. Tách `NonDBService_PlaceOrder` thành các service riêng biệt
2. Tạo `PaymentService` interface
3. Refactor `CancelOrderController` sử dụng Facade
4. Tách business logic ra khỏi `Order` entity 
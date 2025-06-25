# BÁO CÁO ÁP DỤNG DESIGN PATTERNS - LUỒNG PAY ORDER

## Tổng quan
Báo cáo này mô tả việc áp dụng các design patterns để khắc phục các vấn đề thiết kế trong luồng Pay Order của dự án AIMS.

## 1. CÁC VẤN ĐỀ ĐÃ KHẮC PHỤC

### 1.1 High Coupling (Tight Coupling)
**Vấn đề ban đầu:**
- PayOrderController phụ thuộc trực tiếp vào VNPayService
- VNPayService phụ thuộc trực tiếp vào VNPayConfig
- OrderService phụ thuộc trực tiếp vào JavaMailSender

**Giải pháp áp dụng:**
- Tạo interface `PaymentService` và `NotificationService`
- Sử dụng Dependency Injection với `@Qualifier`
- Controller và Service phụ thuộc vào abstraction thay vì concrete classes

### 1.2 Low Cohesion (Violation of Single Responsibility)
**Vấn đề ban đầu:**
- VNPayService có quá nhiều trách nhiệm (payment, query, refund, hash, HTTP)
- VNPayController chứa validation, business logic và response formatting
- VNPayConfig vừa chứa config vừa chứa utility methods

**Giải pháp áp dụng:**
- Tách VNPayService thành các service riêng biệt: `HashService`, `HttpClientService`
- Tách logic validation và business logic trong VNPayController
- Mỗi class chỉ có một trách nhiệm duy nhất

### 1.3 Vi phạm SOLID Principles
**Vấn đề ban đầu:**
- SRP: VNPayService có nhiều trách nhiệm
- OCP: Khó mở rộng payment providers
- ISP: Interface quá lớn
- DIP: Phụ thuộc vào concrete classes

**Giải pháp áp dụng:**
- Tách interfaces nhỏ theo chức năng
- Sử dụng Strategy Pattern cho payment providers
- Dependency Injection với interfaces

## 2. DESIGN PATTERNS ĐÃ ÁP DỤNG

### 2.1 Strategy Pattern
**Mục đích:** Cho phép thay đổi payment provider mà không sửa code hiện tại

**Cấu trúc:**
```
PaymentStrategy (Interface)
├── VNPayStrategy (Concrete Strategy)
├── MoMoStrategy (Future)
└── ZaloPayStrategy (Future)
```

**Lợi ích:**
- Dễ thêm payment provider mới
- Không cần sửa code hiện tại
- Tuân thủ Open/Closed Principle

### 2.2 Factory Pattern
**Mục đích:** Tạo payment strategy dựa trên provider type

**Cấu trúc:**
```
PaymentStrategyFactory (Interface)
└── PaymentStrategyFactoryImpl (Concrete Factory)
```

**Lợi ích:**
- Encapsulate logic tạo strategy
- Dễ mở rộng cho providers mới
- Centralized creation logic

### 2.3 Observer Pattern
**Mục đích:** Thông báo cho nhiều observers khi payment status thay đổi

**Cấu trúc:**
```
PaymentSubject
├── EmailPaymentObserver
├── SMSPaymentObserver (Future)
└── PushNotificationObserver (Future)
```

**Lợi ích:**
- Loose coupling giữa payment processing và notifications
- Dễ thêm notification methods mới
- Automatic notification khi status thay đổi

### 2.4 Dependency Injection Pattern
**Mục đích:** Giảm coupling giữa các components

**Cấu trúc:**
```
@Autowired
@Qualifier("vnpayService")
private PaymentService paymentService;
```

**Lợi ích:**
- Components phụ thuộc vào abstraction
- Dễ test với mock objects
- Flexible configuration

## 3. KIẾN TRÚC MỚI

### 3.1 Sơ đồ kiến trúc
```
PayOrderController
    ↓ (depends on)
PaymentService (Interface)
    ↓ (implemented by)
VNPayServiceImpl
    ↓ (depends on)
HashService + HttpClientService

VNPayController
    ↓ (depends on)
PaymentService + HashService + PaymentSubject
    ↓ (notifies)
PaymentObserver (EmailPaymentObserver)

OrderService
    ↓ (depends on)
NotificationService (Interface)
    ↓ (implemented by)
EmailNotificationServiceImpl
```

### 3.2 Package Structure
```
vnpay.common/
├── service/
│   ├── PaymentService.java (Interface)
│   ├── NotificationService.java (Interface)
│   ├── HashService.java (Interface)
│   ├── HttpClientService.java (Interface)
│   └── impl/
│       ├── VNPayServiceImpl.java
│       ├── HashServiceImpl.java
│       ├── HttpClientServiceImpl.java
│       └── EmailNotificationServiceImpl.java
├── strategy/
│   ├── PaymentStrategy.java (Interface)
│   └── VNPayStrategy.java
├── factory/
│   ├── PaymentStrategyFactory.java (Interface)
│   └── PaymentStrategyFactoryImpl.java
├── observer/
│   ├── PaymentObserver.java (Interface)
│   ├── PaymentSubject.java
│   └── EmailPaymentObserver.java
└── config/
    └── PaymentConfig.java
```

## 4. LỢI ÍCH SAU KHI REFACTOR

### 4.1 Maintainability
- **Dễ maintain:** Mỗi class có trách nhiệm rõ ràng
- **Dễ debug:** Logic được tách biệt, dễ trace lỗi
- **Dễ extend:** Thêm tính năng mới không ảnh hưởng code hiện tại

### 4.2 Testability
- **Unit testing:** Có thể mock từng component riêng biệt
- **Integration testing:** Test từng layer độc lập
- **Mock objects:** Dễ tạo mock cho testing

### 4.3 Scalability
- **Payment providers:** Dễ thêm MoMo, ZaloPay, etc.
- **Notification methods:** Dễ thêm SMS, Push notification
- **New features:** Dễ thêm tính năng mới

### 4.4 Code Quality
- **SOLID compliance:** Tuân thủ tất cả SOLID principles
- **Low coupling:** Components ít phụ thuộc lẫn nhau
- **High cohesion:** Mỗi class có trách nhiệm tập trung

## 5. HƯỚNG DẪN SỬ DỤNG

### 5.1 Thêm Payment Provider Mới
```java
// 1. Tạo strategy mới
@Component("momoStrategy")
public class MoMoStrategy implements PaymentStrategy {
    // Implement methods
}

// 2. Cập nhật factory
@Override
public PaymentStrategy createStrategy(String providerType) {
    switch (providerType.toLowerCase()) {
        case "momo":
            return moMoStrategy;
        // ...
    }
}
```

### 5.2 Thêm Notification Method Mới
```java
// 1. Tạo observer mới
@Component
public class SMSPaymentObserver implements PaymentObserver {
    // Implement methods
}

// 2. Đăng ký observer
@PostConstruct
public void registerObservers() {
    paymentSubject.addObserver(smsPaymentObserver);
}
```

### 5.3 Sử dụng trong Controller
```java
@PostMapping("/payment")
public ResponseEntity<?> createPayment(
        @RequestParam String provider,
        @RequestBody PaymentRequest request,
        HttpServletRequest servletRequest) {
    
    PaymentStrategy strategy = paymentStrategyFactory.createStrategy(provider);
    PaymentResponse response = strategy.createPayment(request, servletRequest);
    return ResponseEntity.ok(response);
}
```

## 6. KẾT LUẬN

Việc áp dụng các design patterns đã giúp:

1. **Giải quyết hoàn toàn** các vấn đề về coupling và cohesion
2. **Tuân thủ SOLID principles** một cách đầy đủ
3. **Tạo ra kiến trúc** linh hoạt, dễ mở rộng và maintain
4. **Cải thiện khả năng test** của codebase
5. **Chuẩn bị cho tương lai** với các payment providers và notification methods mới

Code sau khi refactor đã trở thành **clean code** với kiến trúc rõ ràng, dễ hiểu và dễ phát triển tiếp.

---

## 7. TÀI LIỆU THAM KHẢO
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Clean Code by Robert C. Martin
- SOLID Principles by Robert C. Martin
- Spring Framework Documentation
- VNPay Integration Guide 
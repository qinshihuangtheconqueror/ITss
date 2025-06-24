# HƯỚNG DẪN SỬ DỤNG CANCEL ORDER API
## Với Design Patterns Đã Cải Thiện

---

## 1. TỔNG QUAN

Cancel Order API đã được refactor với các design patterns hiện đại để cải thiện:
- **Low Coupling**: Giảm sự phụ thuộc giữa các component
- **High Cohesion**: Mỗi class có trách nhiệm rõ ràng
- **Extensibility**: Dễ thêm payment method mới
- **Testability**: Dễ viết unit test
- **Maintainability**: Dễ maintain và debug

---

## 2. KIẾN TRÚC MỚI

### 2.1. Dependency Flow
```
Controller → Service → Strategy → Repository
                ↓
            Factory → Payment Strategies
```

### 2.2. Design Patterns Sử Dụng
- **Strategy Pattern**: Cho payment methods
- **Factory Pattern**: Chọn payment strategy
- **Command Pattern**: Encapsulate business logic
- **Service Layer Pattern**: Tách business logic
- **Interface Segregation**: Tách interfaces

---

## 3. API ENDPOINTS

### 3.1. Cancel Order
```http
POST /api/order/cancel?order_id={orderId}
```

**Request:**
- `order_id` (required): ID của đơn hàng cần hủy

**Response Success (200):**
```json
{
  "orderId": 12345,
  "refundAmount": 500000.0,
  "refundMethod": "VNPay Refund",
  "transactionId": "VNPAY123456",
  "paymentMethod": "VNPay"
}
```

**Response Error (400):**
```json
{
  "message": "Order cannot be cancelled. Only pending orders can be cancelled."
}
```

**Response Error (404):**
```json
{
  "message": "Order not found: 12345"
}
```

### 3.2. Test Endpoint
```http
GET /api/order/test
```

**Response:**
```
Cancel Order Controller is working!
```

---

## 4. PAYMENT STRATEGIES

### 4.1. VNPay Strategy
- **Order ID Range**: ≤ 10000
- **Refund Method**: VNPay API
- **Processing Time**: Real-time

### 4.2. Credit Card Strategy
- **Order ID Range**: > 10000
- **Refund Method**: Credit Card Gateway
- **Processing Time**: 3-5 business days

---

## 5. CÁCH THÊM PAYMENT METHOD MỚI

### 5.1. Tạo Strategy Mới
```java
@Service
public class PayPalPaymentStrategy implements PaymentStrategy {
    
    @Override
    public RefundResult processRefund(RefundRequest request, HttpServletRequest httpRequest) {
        // PayPal specific refund logic
        RefundResult result = new RefundResult();
        // Implementation...
        return result;
    }
    
    @Override
    public boolean canHandleOrder(long orderId) {
        // Logic to determine if this strategy can handle the order
        return orderId > 20000; // Example logic
    }
    
    @Override
    public String getPaymentMethodName() {
        return "PayPal";
    }
    
    @Override
    public boolean validateTransaction(String orderId) {
        // PayPal specific validation
        return true;
    }
}
```

### 5.2. Strategy Sẽ Tự Động Được Đăng Ký
- Spring sẽ tự động inject strategy mới vào `PaymentStrategyFactory`
- Không cần thay đổi code khác

---

## 6. TESTING

### 6.1. Unit Testing
```java
@ExtendWith(MockitoExtension.class)
class OrderCancellationServiceTest {
    
    @Mock
    private IOrderRepository orderRepository;
    
    @Mock
    private PaymentStrategyFactory strategyFactory;
    
    @Mock
    private PaymentStrategy paymentStrategy;
    
    @InjectMocks
    private OrderCancellationService service;
    
    @Test
    void testCancelOrder_Success() {
        // Given
        long orderId = 12345L;
        Order order = new Order();
        order.setOrder_id(orderId);
        order.setStatus("pending");
        
        when(orderRepository.findById(orderId)).thenReturn(order);
        when(strategyFactory.getStrategy(order)).thenReturn(paymentStrategy);
        when(paymentStrategy.processRefund(any(), any())).thenReturn(createSuccessRefundResult());
        
        // When
        CommandResult result = service.cancelOrder(orderId, mock(HttpServletRequest.class));
        
        // Then
        assertTrue(result.isSuccess());
        verify(orderRepository).updateStatus(orderId, "cancelled");
    }
}
```

### 6.2. Integration Testing
```java
@SpringBootTest
@AutoConfigureTestDatabase
class CancelOrderIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testCancelOrderEndpoint() {
        // Given
        long orderId = 12345L;
        
        // When
        ResponseEntity<String> response = restTemplate.postForEntity(
            "/api/order/cancel?order_id=" + orderId, 
            null, 
            String.class
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
```

---

## 7. LOGGING

### 7.1. Log Levels
- **INFO**: Business operations (order cancellation, payment processing)
- **DEBUG**: Detailed operations (repository calls, strategy selection)
- **WARN**: Non-critical issues (fallback to default strategy)
- **ERROR**: Critical errors (payment failures, exceptions)

### 7.2. Log Examples
```
INFO  - Starting order cancellation process for order: 12345
INFO  - Selected payment strategy: VNPay for order: 12345
INFO  - VNPay refund successful for order: 12345
INFO  - Order cancellation successful for order: 12345
```

---

## 8. ERROR HANDLING

### 8.1. Custom Exceptions
- `OrderNotFoundException`: Khi không tìm thấy đơn hàng
- `OrderCancellationException`: Khi không thể hủy đơn hàng

### 8.2. Error Codes
- `ORDER_NOT_FOUND`: Đơn hàng không tồn tại
- `CANCELLATION_FAILED`: Lỗi khi hủy đơn hàng
- `REFUND_FAILED`: Lỗi khi hoàn tiền
- `INVALID_STATUS`: Trạng thái đơn hàng không hợp lệ

---

## 9. CONFIGURATION

### 9.1. Application Properties
```properties
# Logging configuration
logging.level.Project_ITSS.PlaceOrder=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# Payment strategy configuration
payment.strategy.default=VNPay
payment.strategy.vnpay.enabled=true
payment.strategy.creditcard.enabled=true
```

### 9.2. Database Configuration
```properties
# Database connection
spring.datasource.url=jdbc:mysql://localhost:3306/aims_db
spring.datasource.username=root
spring.datasource.password=password
```

---

## 10. DEPLOYMENT

### 10.1. Build Project
```bash
mvn clean package
```

### 10.2. Run Application
```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 10.3. Docker (Optional)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## 11. MONITORING

### 11.1. Health Check
```http
GET /actuator/health
```

### 11.2. Metrics
- Order cancellation success rate
- Payment processing time
- Error rates by payment method

---

## 12. TROUBLESHOOTING

### 12.1. Common Issues

#### Issue: Payment Strategy Not Found
**Solution:** Check if strategy is properly annotated with `@Service`

#### Issue: Order Status Not Updated
**Solution:** Check database connection and transaction configuration

#### Issue: Refund Processing Fails
**Solution:** Check payment gateway configuration and network connectivity

### 12.2. Debug Mode
Enable debug logging:
```properties
logging.level.Project_ITSS.PlaceOrder=DEBUG
```

---

## 13. FUTURE ENHANCEMENTS

### 13.1. Planned Features
- **Observer Pattern**: Event-driven notifications
- **Circuit Breaker**: Fault tolerance for payment gateways
- **Caching**: Redis cache for order data
- **Async Processing**: Background refund processing

### 13.2. Performance Optimizations
- **Connection Pooling**: Database connection optimization
- **Batch Processing**: Multiple order cancellation
- **Caching**: Frequently accessed data

---

## 14. SUPPORT

### 14.1. Documentation
- API Documentation: `/swagger-ui.html`
- Code Documentation: JavaDoc comments

### 14.2. Contact
- Technical Issues: Check logs and error messages
- Feature Requests: Create enhancement tickets
- Bug Reports: Include error logs and steps to reproduce 
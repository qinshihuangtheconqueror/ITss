/**
 * Controller handling VNPAY payment integration endpoints
 * Provides REST APIs for payment creation, confirmation, query and refund operations
 */
package Project_ITSS.vnpay.common.controller;

import Project_ITSS.vnpay.common.service.PaymentService;
import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;
import Project_ITSS.vnpay.common.service.VNPayService.QueryResponse;
import Project_ITSS.vnpay.common.service.VNPayService.RefundResponse;
import Project_ITSS.vnpay.common.dto.IPNResponse;
import Project_ITSS.vnpay.common.dto.PaymentRequest;
import Project_ITSS.vnpay.common.dto.PaymentReturnResponse;
import Project_ITSS.vnpay.common.service.OrderService;
import Project_ITSS.vnpay.common.dto.QueryRequest;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.observer.PaymentSubject;
import Project_ITSS.vnpay.common.service.HashService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Refactored VNPayController - sử dụng các service đã tách và Observer Pattern
 * Giải quyết vấn đề mixed concerns và low cohesion
 */
@Controller
@CrossOrigin(origins = "http://localhost:3000")
public class VNPayController {

    private static final Logger logger = LoggerFactory.getLogger(VNPayController.class);
    
    private final PaymentService paymentService;
    private final OrderService orderService;
    private final HashService hashService;
    private final PaymentSubject paymentSubject;

    @Autowired
    public VNPayController(
            @Qualifier("vnpayService") PaymentService paymentService, 
            OrderService orderService,
            HashService hashService,
            PaymentSubject paymentSubject) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.hashService = hashService;
        this.paymentSubject = paymentSubject;
    }

    /**
     * API endpoint for application info
     * @return application information
     */
    @GetMapping("/")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> index() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "AIMS VNPay Integration API");
        info.put("status", "running");
        info.put("endpoints", Map.of(
            "payment", "/api/payment",
            "query", "/api/payment/query",
            "refund", "/api/payment/refund",
            "ipn", "/ipn",
            "return", "/return"
        ));
        return ResponseEntity.ok(info);
    }

    /**
     * Handles the return URL from VNPAY after payment
     * Refactored để tách validation logic và business logic
     */
    @GetMapping("/return")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> returnPage(
            @RequestParam Map<String, String> requestParams,
            HttpServletRequest request) {
        
        Map<String, Object> result = new HashMap<>();
        
        // Create copy of params for hash calculation
        Map<String, String> fields = new HashMap<>(requestParams);
        
        // Get and remove hash from param map before recalculating
        String vnp_SecureHash = fields.get("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Validate hash using HashService
        String signValue = hashService.hashAllFields(fields);
        boolean isValidHash = signValue.equals(vnp_SecureHash);
        
        result.put("validHash", isValidHash);
        result.put("receivedParams", requestParams);

        if (isValidHash) {
            // Parse and validate required fields
            try {
                String orderId = fields.get("vnp_TxnRef");
                result.put("transactionId", orderId);
                result.put("amount", Long.parseLong(fields.getOrDefault("vnp_Amount", "0")));
                result.put("orderInfo", fields.get("vnp_OrderInfo"));
                result.put("responseCode", fields.get("vnp_ResponseCode"));
                result.put("vnpayTransactionId", fields.get("vnp_TransactionNo"));
                result.put("bankCode", fields.get("vnp_BankCode"));
                result.put("transactionStatus", fields.get("vnp_TransactionStatus"));
                result.put("payDate", fields.get("vnp_PayDate"));
                
                // Determine payment status
                String responseCode = fields.get("vnp_ResponseCode");
                if ("00".equals(responseCode)) {
                    result.put("status", "SUCCESS");
                    result.put("message", "Payment completed successfully");
                    
                    // Process successful payment
                    processSuccessfulPayment(orderId, fields);
                    
                } else {
                    result.put("status", "FAILED");
                    result.put("message", "Payment failed with code: " + responseCode);
                    
                    // Process failed payment
                    processFailedPayment(orderId, responseCode);
                }

            } catch (Exception e) {
                // Log the error
                logger.error("Error processing return URL parameters", e);
                result.put("status", "ERROR");
                result.put("message", "Error processing payment information");
                result.put("validHash", false);
            }
        } else {
            result.put("status", "INVALID");
            result.put("message", "Invalid signature");
        }

        // Log transaction details
        logger.info("Payment return - TxnId: {}, Amount: {}, Status: {}, ResponseCode: {}",
            result.get("transactionId"),
            result.get("amount"),
            result.get("transactionStatus"),
            result.get("responseCode")
        );

        return ResponseEntity.ok(result);
    }

    /**
     * Process successful payment using Observer Pattern
     */
    private void processSuccessfulPayment(String orderId, Map<String, String> fields) {
        // Log toàn bộ fields để debug key thực tế
        logger.info("[DEBUG] processSuccessfulPayment - orderId: {}, fields: {}", orderId, fields);
        // Kiểm tra các trường quan trọng
        if (fields.get("vnp_TransactionNo") == null || fields.get("vnp_Amount") == null) {
            logger.warn("[DEBUG] Các trường quan trọng bị null. Danh sách key thực tế: {}", fields.keySet());
        }
        // Update order status
        orderService.updateOrderStatus(orderId, "PAID");
        // Save transaction info
        orderService.saveTransactionInfo(orderId, fields);
        // Notify observers using Observer Pattern
        PaymentResponse response = PaymentResponse.builder()
                .code("00")
                .message("success")
                .paymentUrl("")
                .ipAddress("")
                .build();
        paymentSubject.notifyPaymentSuccess(orderId, response);
    }

    /**
     * Process failed payment using Observer Pattern
     */
    private void processFailedPayment(String orderId, String errorCode) {
        // Update order status
        orderService.updateOrderStatus(orderId, "FAILED");
        
        // Notify observers using Observer Pattern
        paymentSubject.notifyPaymentFailed(orderId, "Payment failed with code: " + errorCode);
    }

    /**
     * Handles the VNPay return URL (alternative path)
     * Redirects VNPay return calls to the main return handler
     */
    @GetMapping("/vnpay/return")
    public RedirectView vnpayReturnPage(
            @RequestParam Map<String, String> requestParams,
            HttpServletRequest request) {

        Map<String, Object> result = new HashMap<>();
        Map<String, String> fields = new HashMap<>(requestParams);

        String vnp_SecureHash = fields.get("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Validate hash using HashService
        String signValue = hashService.hashAllFields(fields);
        boolean isValidHash = signValue.equals(vnp_SecureHash);

        result.put("validHash", isValidHash);
        result.put("receivedParams", requestParams);

        // Thêm log debug toàn bộ fields key-value
        logger.info("[DEBUG] /vnpay/return fields: {}", fields);
        for (String key : fields.keySet()) {
            logger.info("[DEBUG] field key: '{}', value: '{}'", key, fields.get(key));
        }

        if (isValidHash) {
            // Parse and validate required fields
            try {
                String orderId = fields.get("vnp_TxnRef");
                result.put("transactionId", orderId);
                result.put("amount", Long.parseLong(fields.getOrDefault("vnp_Amount", "0")));
                result.put("orderInfo", fields.get("vnp_OrderInfo"));
                result.put("responseCode", fields.get("vnp_ResponseCode"));
                result.put("vnpayTransactionId", fields.get("vnp_TransactionNo"));
                result.put("bankCode", fields.get("vnp_BankCode"));
                result.put("transactionStatus", fields.get("vnp_TransactionStatus"));
                result.put("payDate", fields.get("vnp_PayDate"));
                
                // Determine payment status
                String responseCode = fields.get("vnp_ResponseCode");
                if ("00".equals(responseCode)) {
                    result.put("status", "SUCCESS");
                    result.put("message", "Payment completed successfully");
                    processSuccessfulPayment(orderId, fields);
                } else {
                    result.put("status", "FAILED");
                    result.put("message", "Payment failed with code: " + responseCode);
                    processFailedPayment(orderId, responseCode);
                }

            } catch (Exception e) {
                logger.error("Error processing return URL parameters", e);
                result.put("status", "ERROR");
                result.put("message", "Error processing payment information");
                result.put("validHash", false);
            }
        } else {
            result.put("status", "INVALID");
            result.put("message", "Invalid signature");
        }

        // Log transaction details
        logger.info("Payment return - TxnId: {}, Amount: {}, Status: {}, ResponseCode: {}",
            result.get("transactionId"),
            result.get("amount"),
            result.get("transactionStatus"),
            result.get("responseCode")
        );

        return new RedirectView("http://localhost:3000/order-confirmation/");
    }

    /**
     * Creates a new payment using PaymentService
     */
    @PostMapping("/api/payment")
    @ResponseBody
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody PaymentRequest request,
            HttpServletRequest servletRequest) {
        
        PaymentResponse response = paymentService.createPayment(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Queries a transaction using PaymentService
     */
    @PostMapping("/api/payment/query")
    @ResponseBody
    public ResponseEntity<QueryResponse> queryTransaction(
            @RequestBody QueryRequest request,
            HttpServletRequest servletRequest) {
        
        QueryResponse response = paymentService.queryTransaction(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Refunds a transaction using PaymentService
     */
    @PostMapping("/api/payment/refund")
    @ResponseBody
    public ResponseEntity<RefundResponse> refundTransaction(
            @RequestBody RefundRequest request,
            HttpServletRequest servletRequest) {
        
        RefundResponse response = paymentService.refundTransaction(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Handles IPN notification
     */
    @PostMapping("/ipn")
    @ResponseBody
    public ResponseEntity<IPNResponse> handleIpnNotification(
            @RequestParam MultiValueMap<String, String> requestParams) {
        
        // Convert MultiValueMap to regular Map
        Map<String, String> params = new HashMap<>();
        requestParams.forEach((key, values) -> {
            if (!values.isEmpty()) {
                params.put(key, values.get(0));
            }
        });
        
        // TODO: Implement IPN handling logic
        IPNResponse response = new IPNResponse();
        response.setRspCode("00");
        response.setMessage("Success");
        
        return ResponseEntity.ok(response);
    }
}
/**
 * Controller handling VNPAY payment integration endpoints
 * Provides REST APIs for payment creation, confirmation, query and refund operations
 */
package Project_ITSS.vnpay.common.controller;

import Project_ITSS.vnpay.common.service.VNPayService;
import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;
import Project_ITSS.vnpay.common.service.VNPayService.QueryResponse;
import Project_ITSS.vnpay.common.service.VNPayService.RefundResponse;
import Project_ITSS.vnpay.common.dto.IPNResponse;
import Project_ITSS.vnpay.common.dto.PaymentRequest;
import Project_ITSS.vnpay.common.dto.PaymentReturnResponse;
import Project_ITSS.vnpay.common.service.OrderService;
import Project_ITSS.vnpay.common.dto.QueryRequest;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
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

@Controller
@CrossOrigin(origins = "http://localhost:3000")
public class VNPayController {

    private static final Logger logger = LoggerFactory.getLogger(VNPayController.class);
    private final VNPayService vnPayService;
    private final OrderService orderService;

    @Autowired
    public VNPayController(VNPayService vnPayService, OrderService orderService) {
        this.vnPayService = vnPayService;
        this.orderService = orderService;
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
     * Validates the payment response signature and returns JSON result
     *
     * @param requestParams Parameters returned from VNPAY
     * @param request HTTP request
     * @return JSON response with payment validation result
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

        // Validate hash
        String signValue = vnPayService.hashAllFields(fields);
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
                    // Cập nhật trạng thái đơn hàng, lưu TransactionInfo, gửi thông báo
                    updateOrderStatus(orderId, "PAID");
                    saveTransactionInfo(orderId, fields);
                    sendNotification(orderId, "Payment successful");
                } else {
                    result.put("status", "FAILED");
                    result.put("message", "Payment failed with code: " + responseCode);
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

    // Cập nhật trạng thái đơn hàng
    private void updateOrderStatus(String orderId, String status) {
        orderService.updateOrderStatus(orderId, status);
    }

    // Lưu thông tin giao dịch
    private void saveTransactionInfo(String orderId, Map<String, String> fields) {
        orderService.saveTransactionInfo(orderId, fields);
    }

    // Gửi thông báo cho khách hàng
    private void sendNotification(String orderId, String message) {
        orderService.sendNotification(orderId, message);
    }

    /**
     * Handles the VNPay return URL (alternative path)
     * Redirects VNPay return calls to the main return handler
     *
     * @param requestParams Parameters returned from VNPAY
     * @param request HTTP request
     * @return JSON response with payment validation result
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

        // Validate hash
        String signValue = vnPayService.hashAllFields(fields);
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
                    // Cập nhật trạng thái đơn hàng, lưu TransactionInfo, gửi thông báo
                    // updateOrderStatus(orderId, "PAID");
                    saveTransactionInfo(orderId, fields);
                    // sendNotification(orderId, "Payment successful");
                } else {
                    result.put("status", "FAILED");
                    result.put("message", "Payment failed with code: " + responseCode);
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
        // Log the transaction for tracking
        logger.info("VNPay return received, redirecting to Google.com - TxnRef: {}",
            requestParams.get("vnp_TxnRef"));
        
        String orderId = requestParams.get("vnp_TxnRef");
        // Create redirect view to Google.com
        RedirectView redirectView = new RedirectView("http://localhost:3000/order-confirmation/" + orderId);
        redirectView.setStatusCode(org.springframework.http.HttpStatus.FOUND);
        
        return redirectView;
    }

    /**
     * REST API Controllers for VNPAY integration
     */
    /**
     * API endpoint for creating a new payment
     * Generates payment URL with VNPAY signature
     *
     * @param request Payment request with amount and other details
     * @param servletRequest HTTP request for client IP
     * @return ResponseEntity with payment URL and status
     */
    @PostMapping("/api/payment")
    @ResponseBody
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody PaymentRequest request,
            HttpServletRequest servletRequest) {
        PaymentResponse response = vnPayService.createPayment(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * API endpoint for querying transaction status
     *
     * @param request Query parameters with order ID
     * @param servletRequest HTTP request for client IP
     * @return ResponseEntity with transaction details
     */
    @PostMapping("/api/payment/query")
    @ResponseBody
    public ResponseEntity<QueryResponse> queryTransaction(
            @RequestBody QueryRequest request,
            HttpServletRequest servletRequest) {
        QueryResponse response = vnPayService.queryTransaction(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * API endpoint for refund requests
     *
     * @param request Refund details including amount
     * @param servletRequest HTTP request for client IP
     * @return ResponseEntity with refund status
     */
    @PostMapping("/api/payment/refund")
    @ResponseBody
    public ResponseEntity<RefundResponse> refundTransaction(
            @RequestBody RefundRequest request,
            HttpServletRequest servletRequest) {
        RefundResponse response = vnPayService.refundTransaction(request, servletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Handles IPN (Instant Payment Notification) from VNPAY
     * Validates signature and processes payment confirmation
     *
     * @param requestParams Parameters sent by VNPAY
     * @return ResponseEntity with processing status
     */
    @PostMapping("/ipn")
    @ResponseBody
    public ResponseEntity<IPNResponse> handleIpnNotification(
            @RequestParam MultiValueMap<String, String> requestParams) {
        
        // Convert MultiValueMap to Map<String, String> for VNPay service
        Map<String, String> vnpParams = new HashMap<>();
        requestParams.forEach((key, value) -> {
            if (value != null && !value.isEmpty()) {
                vnpParams.put(key, value.get(0));
            }
        });

        IPNResponse response = vnPayService.handleIpnRequest(vnpParams);
        return ResponseEntity.ok(response);
    }
}
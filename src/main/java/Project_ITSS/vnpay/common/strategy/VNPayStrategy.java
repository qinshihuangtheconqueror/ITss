package Project_ITSS.vnpay.common.strategy;

import Project_ITSS.vnpay.common.config.VNPayConfig;
import Project_ITSS.vnpay.common.dto.PaymentRequest;
import Project_ITSS.vnpay.common.dto.QueryRequest;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.service.HashService;
import Project_ITSS.vnpay.common.service.HttpClientService;
import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;
import Project_ITSS.vnpay.common.service.VNPayService.QueryResponse;
import Project_ITSS.vnpay.common.service.VNPayService.RefundResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

/**
 * VNPay Strategy implementation
 * Concrete strategy cho VNPay payment provider
 */
@Component("vnpayStrategy")
public class VNPayStrategy implements PaymentStrategy {

    private final VNPayConfig vnPayConfig;
    private final HashService hashService;
    private final HttpClientService httpClientService;

    @Autowired
    public VNPayStrategy(VNPayConfig vnPayConfig, HashService hashService, HttpClientService httpClientService) {
        this.vnPayConfig = vnPayConfig;
        this.hashService = hashService;
        this.httpClientService = httpClientService;
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = Long.parseLong(request.getAmount()) * 100;
        String bankCode = request.getBankCode();
        
        String vnp_TxnRef = vnPayConfig.getRandomNumber(8);
        String vnp_IpAddr = vnPayConfig.getIpAddress(servletRequest);
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        
        LinkedHashMap<String, String> vnp_Params = new LinkedHashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        
        String locate = request.getLanguage();
        vnp_Params.put("vnp_Locale", locate != null && !locate.isEmpty() ? locate : "vn");
        
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        
        // Add timestamps
        java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(java.util.Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        // Remove null/empty values
        vnp_Params.values().removeIf(value -> value == null || value.trim().isEmpty());

        String query = generatePaymentQuery(vnp_Params);
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + query;
        
        return PaymentResponse.builder()
                .code("00")
                .message("success")
                .paymentUrl(paymentUrl)
                .ipAddress(vnp_IpAddr)
                .build();
    }

    @Override
    public QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest) {
        String vnp_RequestId = vnPayConfig.getRandomNumber(8);
        String vnp_Version = "2.1.0";
        String vnp_Command = "querydr";
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        String vnp_TxnRef = request.getOrderId();
        String vnp_OrderInfo = "Kiem tra ket qua GD OrderId:" + vnp_TxnRef;
        String vnp_TransDate = request.getTransDate();
        
        java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr = vnPayConfig.getIpAddress(servletRequest);

        Map<String, String> vnp_Params = new java.util.HashMap<>();
        vnp_Params.put("vnp_RequestId", vnp_RequestId);
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_TransactionDate", vnp_TransDate);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        String hashData = String.join("|", vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                vnp_TxnRef, vnp_TransDate, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);
        String vnp_SecureHash = hashService.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);

        return httpClientService.callApi(vnPayConfig.getApiUrl(), vnp_Params, QueryResponse.class);
    }

    @Override
    public RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest) {
        String vnp_RequestId = vnPayConfig.getRandomNumber(8);
        String vnp_Version = "2.1.0";
        String vnp_Command = "refund";
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        String vnp_TransactionType = request.getTranType();
        String vnp_TxnRef = request.getOrderId();
        long amount = request.getAmount() * 100;
        String vnp_Amount = String.valueOf(amount);
        String vnp_OrderInfo = "Hoan tien GD OrderId:" + vnp_TxnRef;
        String vnp_TransactionDate = request.getTransDate();
        String vnp_CreateBy = request.getUser();

        java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_IpAddr = vnPayConfig.getIpAddress(servletRequest);

        Map<String, String> vnp_Params = new java.util.HashMap<>();
        vnp_Params.put("vnp_RequestId", vnp_RequestId);
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_TransactionType", vnp_TransactionType);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_TransactionNo", "");
        vnp_Params.put("vnp_TransactionDate", vnp_TransactionDate);
        vnp_Params.put("vnp_CreateBy", vnp_CreateBy);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        String hashData = String.join("|", vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                vnp_TransactionType, vnp_TxnRef, vnp_Amount, "", vnp_TransactionDate,
                vnp_CreateBy, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);
        String vnp_SecureHash = hashService.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);

        return httpClientService.callApi(vnPayConfig.getApiUrl(), vnp_Params, RefundResponse.class);
    }

    @Override
    public String getProviderName() {
        return "VNPAY";
    }

    private String generatePaymentQuery(Map<String, String> vnp_Params) {
        try {
            // 1. Sắp xếp key
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            // 2. Tạo chuỗi dữ liệu ký (KHÔNG encode)
            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String key = fieldNames.get(i);
                String value = vnp_Params.get(key);
                if (value != null && value.length() > 0) {
                    hashData.append(key).append("=").append(value);
                    if (i < fieldNames.size() - 1) hashData.append("&");
                }
            }
            String hashDataStr = hashData.toString();
            String vnp_SecureHash = hashService.hmacSHA512(vnPayConfig.getSecretKey(), hashDataStr);

            // 3. Tạo query string (CÓ encode)
            StringBuilder query = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String key = fieldNames.get(i);
                String value = vnp_Params.get(key);
                if (value != null && value.length() > 0) {
                    query.append(java.net.URLEncoder.encode(key, "UTF-8"))
                         .append("=")
                         .append(java.net.URLEncoder.encode(value, "UTF-8"));
                    if (i < fieldNames.size() - 1) query.append("&");
                }
            }
            query.append("&vnp_SecureHash=").append(vnp_SecureHash);
            String queryStr = query.toString();
            System.out.println("[VNPay DEBUG] hashData: " + hashDataStr);
            System.out.println("[VNPay DEBUG] queryString: " + queryStr);
            return queryStr;
        } catch (java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Error encoding payment parameters", e);
        }
    }
} 
package Project_ITSS.vnpay.common.service;

import java.util.Map;

/**
 * Interface cho hash service - tách logic hash generation
 * Giải quyết vấn đề low cohesion trong VNPayService
 */
public interface HashService {
    String hashAllFields(Map<String, String> fields);
    String hmacSHA512(String key, String data);
    String generateSecureHash(Map<String, String> params);
} 
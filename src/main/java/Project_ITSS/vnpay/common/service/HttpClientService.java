package Project_ITSS.vnpay.common.service;

import java.util.Map;

/**
 * Interface cho HTTP client service - tách logic HTTP communication
 * Giải quyết vấn đề low cohesion trong VNPayService
 */
public interface HttpClientService {
    <T> T callApi(String url, Map<String, String> params, Class<T> responseType);
    <T> T postRequest(String url, Object requestBody, Class<T> responseType);
    <T> T getRequest(String url, Map<String, String> params, Class<T> responseType);
} 
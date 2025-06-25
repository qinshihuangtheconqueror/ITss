package Project_ITSS.vnpay.common.service.impl;

import Project_ITSS.vnpay.common.service.HttpClientService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Implementation của HttpClientService - tách logic HTTP communication
 * Giải quyết vấn đề low cohesion trong VNPayService
 */
@Service
public class HttpClientServiceImpl implements HttpClientService {

    private final RestTemplate restTemplate;

    public HttpClientServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public <T> T callApi(String url, Map<String, String> params, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            StringBuilder body = new StringBuilder();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (body.length() > 0) {
                    body.append("&");
                }
                body.append(entry.getKey()).append("=").append(entry.getValue());
            }
            
            HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);
            ResponseEntity<T> response = restTemplate.postForEntity(url, request, responseType);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error calling API: " + url, e);
        }
    }

    @Override
    public <T> T postRequest(String url, Object requestBody, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Object> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<T> response = restTemplate.postForEntity(url, request, responseType);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error making POST request to: " + url, e);
        }
    }

    @Override
    public <T> T getRequest(String url, Map<String, String> params, Class<T> responseType) {
        try {
            StringBuilder urlWithParams = new StringBuilder(url);
            if (params != null && !params.isEmpty()) {
                urlWithParams.append("?");
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    if (urlWithParams.charAt(urlWithParams.length() - 1) != '?') {
                        urlWithParams.append("&");
                    }
                    urlWithParams.append(entry.getKey()).append("=").append(entry.getValue());
                }
            }
            
            ResponseEntity<T> response = restTemplate.getForEntity(urlWithParams.toString(), responseType);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error making GET request to: " + url, e);
        }
    }
} 
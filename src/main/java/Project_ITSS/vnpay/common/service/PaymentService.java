package Project_ITSS.vnpay.common.service;

import Project_ITSS.vnpay.common.dto.PaymentRequest;
import Project_ITSS.vnpay.common.dto.QueryRequest;
import Project_ITSS.vnpay.common.dto.RefundRequest;
import Project_ITSS.vnpay.common.service.VNPayService.PaymentResponse;
import Project_ITSS.vnpay.common.service.VNPayService.QueryResponse;
import Project_ITSS.vnpay.common.service.VNPayService.RefundResponse;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Interface cho payment service - giải quyết tight coupling
 * Cho phép thay đổi payment provider mà không sửa code hiện tại
 */
public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest servletRequest);
    QueryResponse queryTransaction(QueryRequest request, HttpServletRequest servletRequest);
    RefundResponse refundTransaction(RefundRequest request, HttpServletRequest servletRequest);
} 
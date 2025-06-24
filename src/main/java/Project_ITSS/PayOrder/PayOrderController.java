package Project_ITSS.PayOrder;

import Project_ITSS.vnpay.common.service.VNPayService;
import Project_ITSS.vnpay.common.dto.PaymentRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payorder")
@CrossOrigin(origins = "http://localhost:3000")
public class PayOrderController {
    @Autowired
    private VNPayService vnPayService;

    @PostMapping("/payment")
    public ResponseEntity<?> createVNPayPayment(@RequestBody Map<String, Object> paymentData, HttpServletRequest request) {
        String amount = paymentData.getOrDefault("amount", "").toString();
        String language = paymentData.getOrDefault("language", "vn").toString();
        String vnpVersion = "2.1.0";
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setAmount(amount);
        paymentRequest.setLanguage(language);
        paymentRequest.setVnp_Version(vnpVersion);
        // Không set bankCode để người dùng tự chọn trên giao diện VNPay
        var response = vnPayService.createPayment(paymentRequest, request);
        return ResponseEntity.ok(response);
    }
} 


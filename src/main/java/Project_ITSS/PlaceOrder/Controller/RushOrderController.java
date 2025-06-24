package Project_ITSS.PlaceOrder.Controller;

import Project_ITSS.PlaceOrder.Entity.*;
import Project_ITSS.PlaceOrder.Service.NonDBService_PlaceOrder;
import Project_ITSS.PlaceOrder.Service.OrderService_PlaceOrder;
import Project_ITSS.PlaceOrder.Service.ProductService_PlaceOrder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Setter
@Getter
class FeeInfoDTO {
    @JsonProperty("province")
    private String province;
    
    @JsonProperty("order")
    @JsonIgnoreProperties(ignoreUnknown = true)
    private Order order;
}

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RushOrderController {

    @Autowired
    private NonDBService_PlaceOrder nonDBService;
    @Autowired
    private OrderService_PlaceOrder orderService;
    @Autowired
    private ProductService_PlaceOrder productService;


    @GetMapping("/rush_check/product/{id}")
    public boolean check_rush_order_product(@PathVariable("id") int product_id){
        return productService.checkProductRush(product_id);
    }

    @GetMapping("/rush_check/products")
    public boolean check_rush_order_products(){
        return productService.checkProducsRush();
    }
    // 2. Kiểm tra tính hợp lệ điểm đến
//    @PostMapping("/check-validity")
//    @ResponseBody
//    public boolean checkValidity(@RequestParam String destination) {
//        // Chỉ cho phép giao hàng nhanh đến các thành phố lớn
//        return destination != null && (
//            destination.equalsIgnoreCase("HaNoi") ||
//            destination.equalsIgnoreCase("HoChiMinhCity") ||
//            destination.equalsIgnoreCase("DaNang")
//        );
//    }

    // 3. Nhận thông tin giao hàng, tạo DeliveryInfo
//    @PostMapping("/submit-info")
//    public String submitInfo(@ModelAttribute DeliveryInfo deliveryInfo,@ModelAttribute Order order, Model model) {
//        if (!checkValidity(deliveryInfo.getDestination())) {
//            model.addAttribute("error", "Destination is not eligible for rush delivery!");
//            return "rush-delivery-form";
//        }
//        // Tính phí giao hàng nhanh (ví dụ: 50k + 10k mỗi kg)
//        int rushFee = 50000 + (int)(deliveryInfo.getWeight() * 10000);
//        deliveryInfo.setTotalPaid(rushFee);
//        // Lưu DeliveryInfo (có thể lưu vào DB hoặc session)
//        model.addAttribute("deliveryInfo", deliveryInfo);
//        // Gửi thông báo thành công
//        model.addAttribute("message", "Rush order placed successfully!");
//        return "rush-delivery-success";
//    }

//     @PostMapping("/Rushdeliveryinfo")
//     public Map<String, Object> SubmitDeliveryInformation(@RequestParam String name, @RequestParam String phone, @RequestParam String email, @RequestParam String address, @RequestParam String province, @RequestParam String payMethod, @RequestParam String delivery_message, @RequestParam int deliveryFee){
//         // Kiểm tra tính hợp lệ của các thông tin được nhập vào
//         boolean result = nonDBService.CheckInfoValidity(name,phone,email,address,province,payMethod);
//         Map<String, Object> json = new HashMap<>();
//         // Nếu thông tin không hợp lệ
//         // Từ đoạn này có thể merge với RushOrder, nhưng tôi chưa biết merge thế nào
//         if(!result){
//             json.put("message","Your provided information is invalid, please select again");
//             return json;
//         }
//         DeliveryInformation deliveryInformation = new DeliveryInformation();                        // Tạo entity deliveryInfo
//         deliveryInformation.createDeliveryInfo(name,phone,email,address,province,delivery_message); // Điền thông tin vào entity đó
// //        int[] deliveryfees = orderService.CalculateDeliveryFee(province,order);
// //        int deliveryfee = deliveryfees[0] + deliveryfees[1];                                        // Tính toán giá tiền phải nộp
//         deliveryInformation.setDelivery_fee(deliveryFee);
// //        json.put("delivery fees",deliveryfees);
// //        json.put("order",order);
//         return json;                                // Trả lại thông tin về invoice lẫn chi phí vận chuyển
//     }

    // 5. Thông báo lỗi
    @GetMapping("/notify-error")
    public String notifyError(Model model) {
        model.addAttribute("error", "Rush order delivery is not eligible for this destination.");
        return "rush-delivery-form";
    }
} 
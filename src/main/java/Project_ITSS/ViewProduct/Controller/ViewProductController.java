//package Project_ITSS.ViewProduct.Controller;
//
//import Project_ITSS.ViewProduct2.Service.UserService_ViewProduct;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import Project_ITSS.ViewProduct2.Entity.Product;
//import Project_ITSS.ViewProduct2.Service.ProductService_ViewProduct;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/productxxxx")
//public class ViewProductController {
//
//
//    @Autowired
//    ProductService_ViewProduct productService;
//
//    @Autowired
//    UserService_ViewProduct userService;
//
//     @GetMapping("/manager/{id}")
//    public Product getProductDetailForManager(@PathVariable("id") long id) {
//        return productService.getFullProductDetail(id);
//    }
//    @GetMapping("/customer/{id}")
//    public Product getProductDetailForCustomer(@PathVariable("id") long id){
//         return productService.getBasicProductDetail(id);
//    }
//
//    @GetMapping("/all")
//    public List<Product> getProductALl(){
//         return productService.getAllProduct();
//    }
//
//
//
//}

package Project_ITSS.ViewProduct2.Controller;

import Project_ITSS.ViewProduct2.Exception.ViewProductException;
import Project_ITSS.ViewProduct2.Service.UserService_ViewProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import Project_ITSS.ViewProduct2.Entity.Product;
import Project_ITSS.ViewProduct2.Service.ProductService_ViewProduct;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/product")
public class ViewProduct2Controller {


    @Autowired
    ProductService_ViewProduct productService;

    @Autowired
    UserService_ViewProduct userService;

    @GetMapping("/all-detail/{id}")
    public Product getProductDetailForManager(@PathVariable("id") int id,@RequestParam("type") String type) {
        if(id <= 0){
            throw new ViewProductException("The product id is invalid");
        }
        return productService.getFullProductDetail(id,type);
    }
    @GetMapping("/detail/{id}")
    public Product getProductDetailForCustomer(@PathVariable("id") int id){
        if(id <= 0){
            throw new ViewProductException("The product id is invalid");
        }
        return productService.getBasicProductDetail(id);
    }

    @GetMapping("/all")
    public List<Product> getProductALl(){
        return productService.getAllProduct();
    }



}

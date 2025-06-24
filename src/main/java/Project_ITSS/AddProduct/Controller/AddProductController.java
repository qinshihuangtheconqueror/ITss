package Project_ITSS.AddProduct.Controller;


import Project_ITSS.AddProduct.Exception.AddProductException;
import Project_ITSS.AddProduct.Repository.DetailProductRepository_AddProduct;
import Project_ITSS.AddProduct.Service.LoggerService_AddProduct;
import Project_ITSS.AddProduct.Service.ProductService_Addproduct;
import Project_ITSS.AddProduct.Entity.Book;
import Project_ITSS.AddProduct.Entity.CD;
import Project_ITSS.AddProduct.Entity.DVD;
import Project_ITSS.AddProduct.Entity.Product;
//import Project_ITSS.AddProduct.Repository.BookRepository_Add_Update;
//import Project_ITSS.Add_Update.Repository.CDRepository_Add_Update;
//import Project_ITSS.Add_Update.Repository.DVDRepository_Add_Update;
//import Project_ITSS.Add_Update.Repository.ProductRepository_Add_Update;
import Project_ITSS.UpdateProduct.Service.LoggerService_UpdateProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AddProductController {

   @Autowired
   private ProductService_Addproduct productService;
   @Autowired
   private LoggerService_AddProduct loggerService;

   // Khi người dùng muốn Add hoặc Update một product, hàm này sẽ trả về các giao diện để điền thông tin
    // Vì chưa có FE nên đoạn này để tạm như ở dưới
   @GetMapping("/AddingRequested")
   public String requestToAddProduct(){
        return "yes";
   }


   // Kiểm tra tính hợp lệ của thông tin đã được đưa vào
   public boolean checkProductInfoValidity(Product product){
       if(product.getTitle().length() > 100 || product.getImage_url().length() > 100 || product.getBarcode().length() > 100 || product.getImport_date().length() > 100 ||  product.getIntroduction().length() > 100) return false;
       DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

       if(product instanceof Book book){
           try{
                LocalDate.parse(book.getPublication_date(), formatter);
            }catch (DateTimeParseException e){
                 return false;
            }
       }else if(product instanceof DVD dvd){
           try{
                 LocalDate.parse(dvd.getImport_date(), formatter);
             }catch (DateTimeParseException e){
                 return false;
             }
       }else if(product instanceof CD cd){
            try{
                LocalDate.parse(cd.getImport_date(), formatter);
                LocalDate.parse(cd.getReleaseDate(), formatter);
            }catch (DateTimeParseException e){
                return false;
            }
       }else{
           return false;
       }
       return true;
   }


   // Sau khi thông tin được điền vào chúng được nộp lại vào hàm này để xử lý
   @PostMapping("/adding/ProductInfo")
   public Map<String,Object> SubmitProductInfo(@RequestBody Product product){
       Map<String, Object> json = new HashMap<>();
       // Kiểm tra tính hợp lệ của thông tin được dưa vào
//       if(!checkProductInfoValidity(productRequest.getProduct())){
//           return "Not OK";
//       }
       // Lưu lại các thông tin đó vào database, đồng thời lấy lại thông tin về product_id
       int Product_id = productService.insertProductInfo(product);
       System.out.println(Product_id);
       if(Product_id < 0){
           throw new AddProductException("Your product failed to be added");
       }
       product.setProduct_id(Product_id);
       // Lưu lại các thông tin đó vào database, dựa trên loại của product đó
       productService.insertProductDetail(product,product.getType());
       loggerService.saveLogger(product);
       json.put("status",1);
       return json;
   }

}

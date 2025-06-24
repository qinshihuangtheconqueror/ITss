package Project_ITSS.AddProduct.Service;

import Project_ITSS.AddProduct.Entity.Product;
import Project_ITSS.AddProduct.Exception.AddProductException;
import Project_ITSS.AddProduct.Repository.DetailProductRepository_AddProduct;
import Project_ITSS.AddProduct.Repository.ProductRepository_AddProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService_Addproduct {
     @Autowired
     private ProductRepository_AddProduct productRepository;

     private final Map<String, DetailProductRepository_AddProduct> repositoryMap;
     @Autowired
     public ProductService_Addproduct(List<DetailProductRepository_AddProduct> repositories) {
          repositoryMap = new HashMap<>();
          for (DetailProductRepository_AddProduct repo : repositories) {
               repositoryMap.put(repo.getType(), repo);
          }
     }

     public int insertProductInfo(Product product){
          return productRepository.insertProductInfo(product);
     }

     public void insertProductDetail(Product product,String type){
          try{
               DetailProductRepository_AddProduct repo = repositoryMap.get(type);
               repo.insertProductInfo((product));
          } catch(Exception e){
               throw new AddProductException("The product detail falied to be added");
          }

     }

}

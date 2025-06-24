package Project_ITSS.ViewProduct2.Service;

import Project_ITSS.ViewProduct2.Repository.DetailProductRepository_ViewProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Project_ITSS.ViewProduct2.Entity.Product;
import Project_ITSS.ViewProduct2.Repository.ProductRepository_ViewProduct;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class ProductService_ViewProduct {
    private final Map<String, DetailProductRepository_ViewProduct> repositoryMap;
    @Autowired
    private ProductRepository_ViewProduct productRepository;
    @Autowired
    public ProductService_ViewProduct(List<DetailProductRepository_ViewProduct> repositories){
        repositoryMap = new HashMap<>();
        for(DetailProductRepository_ViewProduct repo : repositories){
            repositoryMap.put(repo.getType(),repo);
        }
    }

    public boolean checkProductValidity(int quantity,int product_id){
        int available_quantity = productRepository.getProductQuantity(product_id);
        if (quantity > available_quantity) return false;
        else return true;
    }

    public Product getBasicProductDetail(int id) {
        return productRepository.findById(id);
    }

    public Product getFullProductDetail(int id,String type) {
        DetailProductRepository_ViewProduct repo = repositoryMap.get(type);
        return repo.getProductDetailInfo(id);
    }

    public List<Product> getAllProduct(){
//        productRepository = new ProductRepository_ViewProduct();
        return productRepository.getAllProduct();
    }
}

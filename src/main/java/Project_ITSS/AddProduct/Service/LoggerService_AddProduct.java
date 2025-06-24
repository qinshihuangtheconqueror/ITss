package Project_ITSS.AddProduct.Service;

import Project_ITSS.AddProduct.Entity.Product;
import Project_ITSS.AddProduct.Repository.LoggerRepository_AddProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoggerService_AddProduct {
    @Autowired
    LoggerRepository_AddProduct loggerRepository;

    public void saveLogger(Product product){
        loggerRepository.saveLogger("add product","added product with id: " + product.getProduct_id());
    }


}

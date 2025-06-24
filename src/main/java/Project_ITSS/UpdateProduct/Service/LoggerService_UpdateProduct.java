package Project_ITSS.UpdateProduct.Service;

import Project_ITSS.AddProduct.Repository.LoggerRepository_AddProduct;
import Project_ITSS.UpdateProduct.Entity.Product;
import Project_ITSS.UpdateProduct.Repository.LoggerRepository_UpdateProduct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jdbc.repository.config.EnableJdbcAuditing;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LoggerService_UpdateProduct {
    @Autowired
    LoggerRepository_UpdateProduct loggerRepository;

    public void saveLogger(Product product){
        System.out.println("starting to save logger");
        loggerRepository.saveLogger("update product","updated product with id: " + product.getProduct_id());
    }

    public boolean checkValidUpdateProducts(){
        int times = loggerRepository.getUpdatingtimes();
        if(times > 30) return false;
        return true;
    }
}

package Project_ITSS.AddProduct.Repository;

import Project_ITSS.AddProduct.Entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public interface DetailProductRepository_AddProduct {
    @Autowired
    public  void insertProductInfo(Product product);
    public String getType();
}

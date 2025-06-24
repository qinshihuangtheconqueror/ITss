package Project_ITSS.ViewProduct2.Repository;

import Project_ITSS.ViewProduct2.Entity.Product;
import org.springframework.stereotype.Repository;

@Repository
public interface DetailProductRepository_ViewProduct {
    public Product getProductDetailInfo(int product_id);
    public String getType();
}

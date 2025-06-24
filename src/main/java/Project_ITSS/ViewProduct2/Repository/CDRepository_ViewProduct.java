package Project_ITSS.ViewProduct2.Repository;

import Project_ITSS.ViewProduct2.Entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CDRepository_ViewProduct implements DetailProductRepository_ViewProduct {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public Product getProductDetailInfo(int product_id) {
        String sql = "SELECT * FROM CD JOIN Product USING (product_id) WHERE product_id = ?";
        return jdbcTemplate.queryForObject(sql,new Object[]{product_id},new CDRowMapper());
    }

    @Override
    public String getType() {
        return "cd";
    }
}

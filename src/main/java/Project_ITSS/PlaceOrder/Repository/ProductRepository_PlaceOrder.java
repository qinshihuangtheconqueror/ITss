package Project_ITSS.PlaceOrder.Repository;

//import Project_ITSS.demo.Entity.Product;
import Project_ITSS.PlaceOrder.Entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository_PlaceOrder {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int getProductQuantity(int product_id) {
        try{
            return jdbcTemplate.queryForObject("SELECT quantity FROM Product WHERE product_id = ?", new Object[]{product_id}, Integer.class);
        }catch (Exception e){
            e.printStackTrace();
            return  0;
        }
    }

    public int getProductPrice(int product_id){
        return jdbcTemplate.queryForObject("SELECT price FROM Product WHERE product_id = ?",new Object[]{product_id}, Integer.class);
    }

    public double getProductWeight(int product_id){
        return jdbcTemplate.queryForObject("SELECT weight FROM Product WHERE product_id = ?",new Object[]{product_id}, Double.class);
    }

    public Product getProductById(int product_id){
        String sql = "SELECT * FROM product WHERE product_id = ?";
        return jdbcTemplate.queryForObject(sql,new Object[]{product_id},new BeanPropertyRowMapper<>(Product.class));
    }

    public boolean checkRushOrder(int product_id){
        String sql = "SELECT rush_order_supported FROM product WHERE product_id = $1";
        return jdbcTemplate.queryForObject(sql,new Object[]{product_id}, Boolean.class);
    }

    public boolean checkProductsRush(){
        String sql = """
        SELECT CASE
                 WHEN EXISTS (
                     SELECT 1
                     FROM product
                     WHERE rush_order_supported = true
                 )
                 THEN true
                 ELSE false
               END AS any_rush_order_supported
        """;
        return jdbcTemplate.queryForObject(sql, Boolean.class);
    }
}

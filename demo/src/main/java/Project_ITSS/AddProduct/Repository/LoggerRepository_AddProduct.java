package Project_ITSS.AddProduct.Repository;

import Project_ITSS.AddProduct.Exception.AddProductException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LoggerRepository_AddProduct {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveLogger(String action_name,String note){
        String sql = "INSERT INTO Logger (action_name,recorded_at,note) VALUES (?,CURRENT_DATE,?)";
        try{
            jdbcTemplate.update(sql,action_name,note);
        }catch(Exception e){
            e.printStackTrace();
        }
    }


}

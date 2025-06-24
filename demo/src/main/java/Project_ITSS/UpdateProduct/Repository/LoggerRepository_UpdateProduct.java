package Project_ITSS.UpdateProduct.Repository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LoggerRepository_UpdateProduct {
    @Autowired
    JdbcTemplate jdbcTemplate;

    public void saveLogger(String action_name,String note){
        String sql = "INSERT INTO Logger (action_name,recorded_at,note) VALUES (?,CURRENT_DATE,?)";
        jdbcTemplate.update(sql,action_name,note);
    }


    public int getUpdatingtimes(){
        String sql = "SELECT COUNT(DISTINCT note) FROM Logger WHERE recorded_at = CURRENT_DATE AND action_name = 'update product'";
        try{
            return jdbcTemplate.queryForObject(sql, Integer.class);
        }catch(Exception e){
            e.printStackTrace();
            return -1;
        }
    }
}

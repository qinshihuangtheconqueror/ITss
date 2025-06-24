package Project_ITSS.PlaceOrder.Entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@Getter
@Setter
@NoArgsConstructor
public class Invoice {
    private int invoice_id;
    private int order_id;
    private int transaction_id;
    private String description;

//    @Autowired
//    private JdbcTemplate jdbcTemplate;

    public void CreateInvoice(int order_id,String description){
        this.setOrder_id(order_id);
        this.setDescription(description);
    }

//    public void saveInvoice(){
//        jdbcTemplate.update("INSERT INTO Invoice (order_id,transaction_id,description) VALUES (?,?,?)",this.getOrder_id(),this.getTransaction_id(),this.getDescription());
//    }
}

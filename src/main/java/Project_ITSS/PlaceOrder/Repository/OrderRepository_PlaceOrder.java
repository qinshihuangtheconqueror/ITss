package Project_ITSS.PlaceOrder.Repository;

import Project_ITSS.PlaceOrder.Entity.DeliveryInformation;
import Project_ITSS.PlaceOrder.Entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OrderRepository_PlaceOrder {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveOrder(Order order, DeliveryInformation dI){
        // Insert vào DeliveryInformation và lấy delivery_id vừa tạo
        String sqlDelivery = "INSERT INTO DeliveryInformation (Name, Phone, Email, Address, Province, Shipping_message, shipping_fee) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING delivery_id";
        Long deliveryId = jdbcTemplate.queryForObject(sqlDelivery, new Object[]{
            dI.getName(),
            dI.getPhone(),
            dI.getEmail(),
            dI.getAddress(),
            dI.getProvince(),
            dI.getDelivery_message(),
            dI.getDelivery_fee()
        }, Long.class);

        order.setDelivery_id(deliveryId);

        // Insert vào Order, có delivery_id
        jdbcTemplate.update("INSERT INTO \"Order\" (order_id, delivery_id, Total_before_VAT, Total_after_VAT, status, VAT) VALUES (?,?,?,?,?,?)",
            order.getOrder_id(),
            order.getDelivery_id(),
            order.getTotal_before_VAT(),
            order.getTotal_after_VAT(),
            order.getStatus(),
            order.getVAT());
    }

    public Order getOrderById(long order_id){
        String sql = "SELECT * FROM \"Order\" WHERE order_id = ?";
        return jdbcTemplate.queryForObject(sql,new Object[]{order_id},new BeanPropertyRowMapper<>(Order.class));
    }

    public void updateOrderStatus(long order_id, String status) {
        String sql = "UPDATE \"Order\" SET status = ? WHERE order_id = ?";
        jdbcTemplate.update(sql, status, order_id);
    }

    public DeliveryInformation getDeliveryInformationById(long delivery_id) {
        String sql = "SELECT * FROM DeliveryInformation WHERE delivery_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{delivery_id}, new BeanPropertyRowMapper<>(DeliveryInformation.class));
    }

    public void updateOrderStatusToApprove(long order_id) {
        String sql = "UPDATE \"Order\" SET status = 'approved' WHERE order_id = ?";
        jdbcTemplate.update(sql, order_id);
    }
}



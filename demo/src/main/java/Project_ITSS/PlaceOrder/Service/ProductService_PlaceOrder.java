package Project_ITSS.PlaceOrder.Service;


import Project_ITSS.PlaceOrder.Exception.PlaceOrderException;
import Project_ITSS.PlaceOrder.Repository.ProductRepository_PlaceOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductService_PlaceOrder {

    @Autowired
    private ProductRepository_PlaceOrder productRepository;

    public boolean checkProductValidity(int quantity,int product_id){
        if(quantity <= 0){
            throw new PlaceOrderException("The quantity of product is invalid");
        }
        int available_quantity = productRepository.getProductQuantity(product_id);
        if (quantity > available_quantity) return false;
        else return true;
    }

    public boolean checkProductRush(int product_id){
        return productRepository.checkRushOrder(product_id);
    }
    public boolean checkProducsRush(){
        return productRepository.checkProductsRush();
    }


}

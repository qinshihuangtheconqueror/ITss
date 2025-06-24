package Project_ITSS.PlaceOrder.Controller;

import Project_ITSS.PlaceOrder.Service.OrderCancellationService;
import Project_ITSS.PlaceOrder.Command.CommandResult;
import Project_ITSS.PlaceOrder.Exception.OrderNotFoundException;
import Project_ITSS.PlaceOrder.Exception.OrderCancellationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller for order cancellation operations
 * Implements improved design patterns with low coupling
 */
@RestController
@RequestMapping("/api/order")
public class CancelOrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(CancelOrderController.class);
    
    private final OrderCancellationService cancellationService;
    
    @Autowired
    public CancelOrderController(OrderCancellationService cancellationService) {
        this.cancellationService = cancellationService;
    }

    /**
     * Cancel order endpoint with improved design patterns
     */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelOrder(@RequestParam("order_id") long orderId, 
                                       HttpServletRequest request) {
        logger.info("Received cancel order request for order: {}", orderId);
        
        try {
            CommandResult result = cancellationService.cancelOrder(orderId, request);
            
            if (result.isSuccess()) {
                logger.info("Order cancellation successful for order: {}", orderId);
                return ResponseEntity.ok(result.getData());
            } else {
                logger.warn("Order cancellation failed for order: {} - {}", orderId, result.getMessage());
                return ResponseEntity.badRequest().body(result.getMessage());
            }
            
        } catch (OrderNotFoundException e) {
            logger.error("Order not found: {}", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Order not found: " + orderId);
        } catch (OrderCancellationException e) {
            logger.error("Order cancellation exception: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during order cancellation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal error: " + e.getMessage());
        }
    }

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public String test() {
        return "Cancel Order Controller is working!";
    }
} 
package Project_ITSS.PlaceOrder.Service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {
    private final ApplicationEventPublisher eventPublisher;

    public OrderEventPublisher(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void publishOrderCancelled(OrderCancellationEvent event) {
        eventPublisher.publishEvent(event);
    }
} 
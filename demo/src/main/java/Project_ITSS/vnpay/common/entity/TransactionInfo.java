package Project_ITSS.vnpay.common.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "vnpay_transactions")
@Data
public class TransactionInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "transaction_no")
    private String transactionNo;

    @Column(name = "amount")
    private Long amount;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "transaction_status")
    private String transactionStatus;

    @Column(name = "pay_date")
    private String payDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 
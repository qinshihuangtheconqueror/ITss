package Project_ITSS.vnpay.common.repository;

import Project_ITSS.vnpay.common.entity.TransactionInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionInfo, Long> {
    TransactionInfo findByOrderId(String orderId);
} 
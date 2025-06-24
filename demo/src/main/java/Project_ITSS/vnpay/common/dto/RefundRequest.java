/**
 * DTO class for refund requests
 * Contains all parameters required by VNPAY's refund API
 */
package Project_ITSS.vnpay.common.dto;

/**
 * Refund request parameters
 * Used to initiate refunds for completed transactions
 */
public class RefundRequest {
    private String orderId;
    private int amount;
    private String transDate;
    private String tranType;
    private String user;

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getTransDate() {
        return transDate;
    }

    public void setTransDate(String transDate) {
        this.transDate = transDate;
    }

    public String getTranType() {
        return tranType;
    }

    public void setTranType(String tranType) {
        this.tranType = tranType;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}
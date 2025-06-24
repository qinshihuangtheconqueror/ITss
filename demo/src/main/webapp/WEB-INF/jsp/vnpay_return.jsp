<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>KẾT QUẢ THANH TOÁN</title>
        <link href="/assets/bootstrap.min.css" rel="stylesheet"/>
        <link href="/assets/jumbotron-narrow.css" rel="stylesheet">
        <style>
            .container { max-width: 730px; }
            .result-box {
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .success { background-color: #dff0d8; border: 1px solid #d6e9c6; }
            .error { background-color: #f2dede; border: 1px solid #ebccd1; }
            .invalid { background-color: #fcf8e3; border: 1px solid #faebcc; }
            .detail-label { font-weight: bold; min-width: 200px; display: inline-block; }
            .transaction-detail { margin: 8px 0; }
            @media (max-width: 768px) {
                .detail-label { display: block; margin-bottom: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header clearfix">
                <h3 class="text-muted text-center">KẾT QUẢ THANH TOÁN</h3>
            </div>
            
            <c:choose>
                <c:when test="${!payment.validHash}">
                    <div class="result-box invalid">
                        <h4><i class="glyphicon glyphicon-warning-sign"></i> Chữ ký không hợp lệ!</h4>
                        <p>Thông tin thanh toán không thể xác thực. Vui lòng liên hệ với quản trị viên.</p>
                    </div>
                </c:when>
                <c:otherwise>
                    <div class="result-box ${payment.responseCode eq '00' ? 'success' : 'error'}">
                        <h4>
                            <i class="glyphicon ${payment.responseCode eq '00' ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle'}"></i>
                            ${payment.message}
                        </h4>
                    </div>
                    
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h4 class="panel-title">Chi tiết giao dịch</h4>
                        </div>
                        <div class="panel-body">
                            <div class="transaction-detail">
                                <span class="detail-label">Mã giao dịch:</span>
                                <span>${payment.transactionId}</span>
                            </div>
                            
                            <div class="transaction-detail">
                                <span class="detail-label">Số tiền:</span>
                                <span><fmt:formatNumber value="${payment.amount/100}" type="currency" currencySymbol="VND"/></span>
                            </div>
                            
                            <div class="transaction-detail">
                                <span class="detail-label">Nội dung thanh toán:</span>
                                <span>${payment.orderInfo}</span>
                            </div>
                            
                            <div class="transaction-detail">
                                <span class="detail-label">Mã ngân hàng:</span>
                                <span>${payment.bankCode}</span>
                            </div>
                            
                            <div class="transaction-detail">
                                <span class="detail-label">Mã giao dịch VNPAY:</span>
                                <span>${payment.vnpayTransactionId}</span>
                            </div>
                            
                            <div class="transaction-detail">
                                <span class="detail-label">Thời gian thanh toán:</span>
                                <span>
                                    <fmt:formatDate value="${payment.paymentDate.toLocalDate()}" pattern="dd/MM/yyyy HH:mm:ss"/>
                                </span>
                            </div>
                        </div>
                    </div>
                </c:otherwise>
            </c:choose>
            
            <div class="text-center" style="margin-top: 20px;">
                <a href="/" class="btn btn-primary">Về trang chủ</a>
            </div>
            
            <footer class="footer">
                <p class="text-center">&copy; VNPAY <%=java.time.Year.now().getValue()%></p>
            </footer>
        </div>
    </body>
</html>

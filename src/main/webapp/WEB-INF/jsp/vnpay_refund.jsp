<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        <meta name="author" content="">
        <title>Refund</title>
        <!-- Bootstrap core CSS -->
        <link href="/vnpay/assets/bootstrap.min.css" rel="stylesheet"/>
        <!-- Custom styles for this template -->
        <script src="/vnpay/assets/jquery-1.11.3.min.js"></script>
    </head>

    <body>
        <div class="container">
            <div class="header clearfix">
                <h3 class="text-muted">VNPAY</h3>
            </div>
            <h3>Refund</h3>
            <div class="table-responsive">
                <form action="/vnpay/api/payment/refund" id="frmRefund" method="Post">
                    <div class="form-group">
                        <label for="order_id">Mã giao dịch cần hoàn (Giá trị của vnp_TxnRef)</label>
                        <input class="form-control" id="order_id" name="orderId" type="text" required/>
                    </div>
                    <div class="form-group">
                        <label for="amount">Số tiền hoàn</label>
                        <input class="form-control" data-val="true" data-val-number="The field Amount must be a number." 
                               data-val-required="The Amount field is required." id="amount" max="100000000" 
                               min="1" name="amount" type="number" value="10000" required/>
                    </div>
                    <div class="form-group">
                        <label for="trantype">Kiểu hoàn tiền</label>
                        <select name="tranType" id="trantype" class="form-control" required>
                            <option value="02">Hoàn tiền toàn phần</option>
                            <option value="03">Hoàn tiền một phần</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trans_date">Thời gian khởi tạo giao dịch (Giá trị của vnp_CreateDate yêu cầu thanh toán)</label>
                        <input class="form-control" id="trans_date" name="transDate" 
                               type="text" placeholder="yyyyMMddHHmmss" required/>
                    </div>
                    <div class="form-group">
                        <label for="user">User khởi tạo hoàn</label>
                        <input class="form-control" id="user" name="user" type="text" required/>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Refund</button>
                    </div>
                </form>

                <!-- Refund Result -->
                <div id="refundResult" style="display: none">
                    <h4>Kết quả hoàn tiền:</h4>
                    <table class="table">
                        <tr>
                            <td>Mã yêu cầu:</td>
                            <td id="result_responseId"></td>
                        </tr>
                        <tr>
                            <td>Mã giao dịch:</td>
                            <td id="result_txnRef"></td>
                        </tr>
                        <tr>
                            <td>Số tiền hoàn:</td>
                            <td id="result_amount"></td>
                        </tr>
                        <tr>
                            <td>Mã phản hồi:</td>
                            <td id="result_responseCode"></td>
                        </tr>
                        <tr>
                            <td>Nội dung:</td>
                            <td id="result_message"></td>
                        </tr>
                    </table>
                </div>
                <p>&nbsp;</p>
                <footer class="footer">
                    <p>&copy; VNPAY 2025</p>
                </footer>
            </div> 
        </div>

        <script type="text/javascript">
            $("#frmRefund").submit(function () {
                var formData = {
                    orderId: $("#order_id").val(),
                    amount: parseInt($("#amount").val()),
                    tranType: $("#trantype").val(),
                    transDate: $("#trans_date").val(),
                    user: $("#user").val()
                };
                
                $.ajax({
                    type: "POST",
                    url: $("#frmRefund").attr("action"),
                    data: JSON.stringify(formData),
                    contentType: "application/json",
                    dataType: 'json',
                    success: function (response) {
                        $("#result_responseId").text(response.vnp_ResponseId || 'N/A');
                        $("#result_txnRef").text(response.vnp_TxnRef || 'N/A');
                        $("#result_amount").text((response.vnp_Amount ? parseInt(response.vnp_Amount)/100 : 'N/A') + ' VND');
                        $("#result_responseCode").text(response.vnp_ResponseCode || 'N/A');
                        $("#result_message").text(response.vnp_Message || 'N/A');
                        $("#refundResult").show();
                    },
                    error: function(xhr, status, error) {
                        alert("Error processing refund: " + error);
                    }
                });
                return false;
            });
        </script>
    </body>
</html>

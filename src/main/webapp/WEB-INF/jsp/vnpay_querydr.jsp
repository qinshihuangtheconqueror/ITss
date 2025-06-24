<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        <meta name="author" content="">
        <title>Query Transaction</title>
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
            <h3>Query Transaction</h3>
            <div class="table-responsive">
                <form action="/vnpay/api/payment/query" id="frmQueryDr" method="Post">
                    <div class="form-group">
                        <label for="order_id">Mã giao dịch cần truy vấn (Giá trị của vnp_TxnRef)</label>
                        <input class="form-control" id="order_id" name="orderId" type="text" required/>
                    </div>
                    <div class="form-group">
                        <label for="trans_date">Thời gian khởi tạo giao dịch (Giá trị của vnp_CreateDate yêu cầu thanh toán)</label>
                        <input class="form-control" id="trans_date" name="transDate" type="text" placeholder="yyyyMMddHHmmss" required/>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Query</button>
                    </div>
                </form>

                <!-- Query Result -->
                <div id="queryResult" style="display: none">
                    <h4>Kết quả truy vấn:</h4>
                    <table class="table">
                        <tr>
                            <td>Mã giao dịch:</td>
                            <td id="result_txnRef"></td>
                        </tr>
                        <tr>
                            <td>Số tiền:</td>
                            <td id="result_amount"></td>
                        </tr>
                        <tr>
                            <td>Mã ngân hàng:</td>
                            <td id="result_bankCode"></td>
                        </tr>
                        <tr>
                            <td>Thời gian thanh toán:</td>
                            <td id="result_payDate"></td>
                        </tr>
                        <tr>
                            <td>Trạng thái:</td>
                            <td id="result_status"></td>
                        </tr>
                    </table>
                </div>
            </div>
            <p>&nbsp;</p>
            <footer class="footer">
                <p>&copy; VNPAY 2025</p>
            </footer>
        </div>

        <script type="text/javascript">
            $("#frmQueryDr").submit(function () {
                var formData = {
                    orderId: $("#order_id").val(),
                    transDate: $("#trans_date").val()
                };
                
                $.ajax({
                    type: "POST",
                    url: $("#frmQueryDr").attr("action"),
                    data: JSON.stringify(formData),
                    contentType: "application/json",
                    dataType: 'json',
                    success: function (response) {
                        $("#result_txnRef").text(response.vnp_TxnRef || 'N/A');
                        $("#result_amount").text((response.vnp_Amount ? parseInt(response.vnp_Amount)/100 : 'N/A') + ' VND');
                        $("#result_bankCode").text(response.vnp_BankCode || 'N/A');
                        $("#result_payDate").text(response.vnp_PayDate || 'N/A');
                        $("#result_status").text(response.vnp_TransactionStatus === "00" ? "Thành công" : "Thất bại");
                        $("#queryResult").show();
                    },
                    error: function(xhr, status, error) {
                        alert("Error querying transaction: " + error);
                    }
                });
                return false;
            });
        </script>
    </body>
</html>

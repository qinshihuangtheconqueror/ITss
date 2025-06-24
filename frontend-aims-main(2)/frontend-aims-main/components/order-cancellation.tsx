"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { cancelOrder } from "@/lib/tracking-utils"
import type { OrderTrackingInfo } from "@/lib/tracking-types"
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface OrderCancellationProps {
  orderInfo: OrderTrackingInfo
  onClose: () => void
  onSuccess: () => void
}

export default function OrderCancellation({ orderInfo, onClose, onSuccess }: OrderCancellationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cancellationResult, setCancellationResult] = useState<{
    success: boolean
    message: string
    refund_amount?: number
    refund_method?: string
    vnp_ResponseCode?: string
    vnp_Message?: string
  } | null>(null)
  const { toast } = useToast()

  const handleCancelOrder = async () => {
    setIsProcessing(true)
    setCancellationResult(null)

    try {
      const cancellationRequest = {
        order_id: orderInfo.order_id,
        tracking_code: orderInfo.tracking_code,
      }

      const result = await cancelOrder(cancellationRequest)
      setCancellationResult(result)

      if (result.success) {
        toast({
          title: "Hủy đơn hàng thành công",
          description: result.message,
        })
        // Don't call onSuccess immediately, let user see the result
      } else {
        toast({
          title: "Hủy đơn hàng thất bại",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: "Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau."
      }
      setCancellationResult(errorResult)
      toast({
        title: "Lỗi",
        description: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (cancellationResult?.success) {
      onSuccess()
    }
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {cancellationResult ? (
              cancellationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )
            ) : (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            {cancellationResult ? "Kết quả hủy đơn hàng" : "Hủy đơn hàng"}
          </DialogTitle>
          <DialogDescription>
            {cancellationResult ? (
              cancellationResult.success ? 
                `Đơn hàng #${orderInfo.order_id} đã được hủy thành công.` :
                `Không thể hủy đơn hàng #${orderInfo.order_id}.`
            ) : (
              `Bạn có chắc chắn muốn hủy đơn hàng #${orderInfo.order_id}? Hành động này không thể hoàn tác.`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!cancellationResult ? (
            /* Pre-cancellation Information */
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
                Thông tin hoàn tiền
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                  Số tiền hoàn:{" "}
                <span className="font-semibold">{formatCurrency(orderInfo.order_details.total_amount)}</span>
              </p>
              <p>
                  Phương thức hoàn tiền:{" "}
                  {orderInfo.order_details.payment_method === "credit_card" ? "Thẻ tín dụng" : "Chuyển khoản ngân hàng"}
                </p>
                <p>Thời gian xử lý: 3-5 ngày làm việc</p>
                <p className="text-xs">Lưu ý: Chỉ có thể hủy đơn hàng đang chờ xử lý</p>
              </div>
            </div>
          ) : (
            /* Post-cancellation Result */
            <div className={`p-4 rounded-lg ${
              cancellationResult.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                cancellationResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {cancellationResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {cancellationResult.success ? "Hủy đơn hàng thành công" : "Hủy đơn hàng thất bại"}
              </h4>
              <div className={`text-sm space-y-1 ${
                cancellationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                <p>{cancellationResult.message}</p>
                {cancellationResult.success && cancellationResult.refund_amount && (
                  <p>
                    Số tiền hoàn:{" "}
                    <span className="font-semibold">{formatCurrency(cancellationResult.refund_amount)}</span>
                  </p>
                )}
                {cancellationResult.success && cancellationResult.refund_method && (
                  <p>Phương thức hoàn tiền: {cancellationResult.refund_method}</p>
                )}
                {cancellationResult.vnp_ResponseCode && (
                  <p className="text-xs">Mã phản hồi: {cancellationResult.vnp_ResponseCode}</p>
                )}
            </div>
          </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!cancellationResult ? (
            <>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Giữ đơn hàng
          </Button>
          <Button variant="destructive" onClick={handleCancelOrder} disabled={isProcessing}>
                {isProcessing ? "Đang hủy..." : "Hủy đơn hàng"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              {cancellationResult.success ? "Đóng" : "Thử lại"}
          </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

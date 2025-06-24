import { api } from "./api"
import { DeliveryInformation } from "./checkout-types"

export async function SubmitDeliveryInfo(deliveryData: DeliveryInformation) {
  const response = await api.post("/deliveryinfo?", deliveryData)
  return response
}   
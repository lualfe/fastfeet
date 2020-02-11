import OrderNotification from '../schemas/OrderNotification'

class OrderNotificationController {
  async update(req, res) {
    const orderNotification = await OrderNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )
    return res.json(orderNotification)
  }
}

export default new OrderNotificationController()

import Order from '../models/Order'
import DeliveryProblem from '../models/DeliveryProblem'
import CancellationMail from '../jobs/CancellationMail'
import Queue from '../../lib/Queue'

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query
    const deliveryProblems = await DeliveryProblem.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      order: ['order_id'],
      include: [
        {
          model: Order,
          as: 'order'
        }
      ]
    })
    return res.json(deliveryProblems)
  }

  async indexByOrderID(req, res) {
    const { page = 1 } = req.query
    const { id } = req.params
    const deliveryProblems = await DeliveryProblem.findAll({
      where: { order_id: id },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['order_id'],
      include: [
        {
          model: Order,
          as: 'order'
        }
      ]
    })
    return res.json(deliveryProblems)
  }

  async store(req, res) {
    const { order_id } = req.params
    const orderExists = Order.findByPk(order_id)
    if (!orderExists) {
      return res
        .status(400)
        .json({ error: `order with id ${order_id} does not exists` })
    }

    const { description } = req.body
    await DeliveryProblem.create({
      order_id,
      description
    })
    return res.json({
      order_id,
      description
    })
  }

  async cancelOrder(req, res) {
    const { problem_id } = req.params
    const { order_id } = await DeliveryProblem.findByPk(problem_id)
    let order = await Order.findByPk(order_id)
    order = await order.update({
      canceled_at: new Date()
    })

    await Queue.add(CancellationMail.key, { order })
    return res.json(order)
  }
}

export default new DeliveryProblemController()

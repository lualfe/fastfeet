import * as Yup from 'yup'
import {
  isBefore,
  isAfter,
  startOfHour,
  parseISO,
  startOfDay,
  endOfDay,
  isPast,
  format
} from 'date-fns'
import { Op } from 'sequelize'

import Deliveryman from '../models/Deliveryman'
import Recipient from '../models/Recipient'
import File from '../models/File'
import Order from '../models/Order'
import OrderNotification from '../schemas/OrderNotification'
import Queue from '../../lib/Queue'
import NewOrderMail from '../jobs/NewOrderMail'

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman'
        },
        {
          model: Recipient,
          as: 'recipient'
        },
        {
          model: File,
          as: 'signature'
        }
      ]
    })
    return res.json(orders)
  }

  async indexByDeliveryman(req, res) {
    const { id } = req.params
    const { delivered, page = 1 } = req.query
    const filters = [{ deliveryman_id: id }, { canceled_at: null }]
    switch (delivered) {
      case 'delivered':
        filters.push({ [Op.not]: [{ end_date: null }] })
        break
      default:
        filters.push({ end_date: null })
    }
    const orders = await Order.findAll({
      where: {
        [Op.and]: filters
      },
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman'
        },
        {
          model: Recipient,
          as: 'recipient'
        },
        {
          model: File,
          as: 'signature'
        }
      ]
    })
    return res.json(orders)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required()
    })
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'invalid data' })
    }

    const { product, recipient_id, deliveryman_id } = req.body
    const { id } = await Order.create({
      product: product,
      recipient_id: recipient_id,
      deliveryman_id: deliveryman_id
    })

    const deliveryman = await Deliveryman.findByPk(deliveryman_id)
    const recipient = await Recipient.findByPk(recipient_id)
    await OrderNotification.create({
      content: `Olá ${
        deliveryman.name
        // eslint-disable-next-line prettier/prettier
        }, você tem uma nova entrega para ser feita para o destinatário ${
        recipient.name
        // eslint-disable-next-line prettier/prettier
        } no endereço ${recipient.address}${
        recipient.address_number ? ', ' + recipient.address_number : ''
        // eslint-disable-next-line prettier/prettier
        }${
        recipient.address_continued ? ', ' + recipient.address_continued : ''
        // eslint-disable-next-line prettier/prettier
        }.`,
      deliveryman: deliveryman_id
    })

    await Queue.add(NewOrderMail.key, { deliveryman })

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id
    })
  }

  async startDelivery(req, res) {
    const { id } = req.params
    const order = await Order.findByPk(id)
    if (!order) {
      return res.status(400).json({ error: `order with id ${id} not found` })
    }

    const { start_date } = req.body
    const start_date_iso = parseISO(start_date)
    const sDay = format(
      startOfDay(start_date_iso),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    )
    const eDay = format(
      endOfDay(start_date_iso),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    )
    if (isPast(start_date_iso)) {
      return res.status(400).json({ error: 'cannot use a past date' })
    }
    const count = await Order.count({
      where: {
        start_date: { [Op.between]: [sDay, eDay] },
        canceled_at: null
      }
    })
    if (count >= 5) {
      return res
        .status(400)
        .json({ error: 'cannot take more than 5 orders in a day' })
    }

    if (
      isBefore(start_date_iso, startOfHour(start_date_iso.setHours(8))) ||
      isAfter(start_date_iso, startOfHour(start_date_iso.setHours(18)))
    ) {
      return res.status(400).json({ error: 'invalid hour' })
    }
    const {
      order_id,
      product,
      recipient_id,
      deliveryman_id
    } = await order.update({
      start_date: start_date_iso
    })
    return res.json({
      order_id,
      product,
      recipient_id,
      deliveryman_id,
      start_date_iso
    })
  }

  async endDelivery(req, res) {
    const { id } = req.params
    const order = await Order.findByPk(id)
    if (!order) {
      return res.status(400).json({ error: `order with id ${id} not found` })
    }

    const endDate = new Date()
    if (isBefore(endDate, order.start_date)) {
      return res.status(400).json({
        error: 'cannot finish the order before it is started'
      })
    }

    const { signature_id } = req.body
    const {
      order_id,
      product,
      recipient_id,
      deliveryman_id
    } = await order.update({
      end_date: endDate,
      signature_id
    })
    res.json({
      order_id,
      product,
      recipient_id,
      deliveryman_id,
      endDate,
      signature_id
    })
  }
}

export default new OrderController()

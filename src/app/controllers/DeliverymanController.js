import * as Yup from 'yup'

import Deliveryman from '../models/Deliveryman'
import File from '../models/File'

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url']
        }
      ]
    })
    res.json(deliverymen)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .required()
        .email(),
      avatar_id: Yup.number()
    })
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation failed' })
    }

    const { email } = req.body
    const userExists = await Deliveryman.findOne({ where: { email } })
    if (userExists) {
      return res.status(400).json({ error: 'user already exists' })
    }

    const { name, avatar_id } = await Deliveryman.create(req.body)
    return res.json({ name, email, avatar_id })
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number()
    })
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation failed' })
    }

    const { email } = req.body
    const { id } = req.params
    const deliveryman = await Deliveryman.findByPk(id)
    if (email !== deliveryman.email) {
      const userExists = await Deliveryman.findOne({ where: { email } })
      if (userExists) {
        return res.status(400).json({ error: 'E-mail already rregistered' })
      }
    }

    const { name, avatar_id } = await deliveryman.update(req.body)

    return res.json({ id, name, email, avatar_id })
  }

  async deactivate(req, res) {
    const { id } = req.params
    const deliveryman = await Deliveryman.findByPk(id)
    if (!deliveryman) {
      res.status(400).json({ error: 'id not found' })
    }

    const { email, name, active } = await deliveryman.update({ active: false })

    return res.json({ email, name, active })
  }
}

export default new DeliverymanController()

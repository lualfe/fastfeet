import * as Yup from 'yup'

import Recipient from '../models/Recipient'

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      address_number: Yup.string().required(),
      address_continued: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string()
        .required()
        .length(8),
      signature_id: Yup.number()
    })
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation failed' })
    }

    const {
      name,
      address,
      address_number,
      address_continued,
      state,
      city,
      zip,
      signature_id
    } = await Recipient.create(req.body)
    return res.json({
      name,
      address,
      address_number,
      address_continued,
      state,
      city,
      zip,
      signature_id
    })
  }
}

export default new RecipientController()

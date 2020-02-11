import Mail from '../../lib/Mail'

class CancellationMail {
  get key() {
    return 'CancellationMail'
  }

  async handle({ data }) {
    const { order } = data

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Entrega Cancelada',
      text: `A entrega ${order.id} para ${order.recipient.name} foi cancelada`
    })
  }
}

export default new CancellationMail()

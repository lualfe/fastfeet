import Mail from '../../lib/Mail'

class NewOrderMail {
  get key() {
    return 'NewOrderMail'
  }

  async handle({ data }) {
    const { deliveryman } = data

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova Entrega Cadastrada',
      text: 'Você tem uma nova entrega cadastrada.'
    })
  }
}

export default new NewOrderMail()

import Sequelize, { Model } from 'sequelize'

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        address: Sequelize.STRING,
        address_number: Sequelize.STRING,
        address_continued: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        zip: Sequelize.STRING
      },
      {
        sequelize
      }
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'signature_id', as: 'signature' })
  }
}

export default Recipient

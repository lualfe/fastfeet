import Sequelize, { Model } from 'sequelize'

class DeliveryProblem extends Model {
  static init(sequelize) {
    super.init(
      {
        order_id: Sequelize.INTEGER,
        description: Sequelize.TEXT
      },
      {
        sequelize
      }
    )
    return this
  }

  static associate(models) {
    this.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' })
  }
}

export default DeliveryProblem

'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('orders', 'recipient_id', {
        type: Sequelize.INTEGER,
        references: { model: 'recipients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }),
      queryInterface.addColumn('orders', 'deliveryman_id', {
        type: Sequelize.INTEGER,
        references: { model: 'deliverymen', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }),
      queryInterface.addColumn('orders', 'signature_id', {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      })
    ])
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('orders', 'recipient_id'),
      queryInterface.removeColumn('orders', 'deliveryman_id'),
      queryInterface.removeColumn('orders', 'signature_id')
    ])
  }
}

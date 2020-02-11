import Sequelize from 'sequelize'
import mongoose from 'mongoose'

import User from '../app/models/User'
import Recipient from '../app/models/Recipient'
import Deliveryman from '../app/models/Deliveryman'
import Order from '../app/models/Order'
import File from '../app/models/File'
import DeliveryProblem from '../app/models/DeliveryProblem'
import databaseConfig from '../config/db'

const models = [User, Recipient, File, Deliveryman, Order, DeliveryProblem]

class Database {
  constructor() {
    this.init()
    this.mongo()
  }

  init() {
    var types = require('pg').types
    var timestampOID = 1114
    types.setTypeParser(timestampOID, stringValue => {
      return new Date(Date.parse(stringValue + '0000'))
    })
    this.connection = new Sequelize(databaseConfig)
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
    models.map(model => model.removeID && model.removeID())
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:9202/fastfeet',
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true
      }
    )
  }
}

export default new Database()

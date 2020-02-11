import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import SessionController from './app/controllers/SessionController'
import RecipientController from './app/controllers/RecipientController'
import FileController from './app/controllers/FileController'
import DeliverymanController from './app/controllers/DeliverymanController'
import OrderController from './app/controllers/OrderController'
import DeliveryProblemController from './app/controllers/DeliveryProblemController'
import OrderNotificationController from './app/controllers/OrderNotificationController'
import authMiddleware from './app/middlewares/auth'

const routes = new Router()
const uploads = multer(multerConfig)

routes.post('/session', SessionController.store)

// Order routes without auth
routes.get('/orders/deliveryman/:id', OrderController.indexByDeliveryman)
routes.put('/orders/start/:id', OrderController.startDelivery)
routes.put('/orders/end/:id', OrderController.endDelivery)

// DeliveryProblem routes without auth
routes.post('/delivery-problems/:order_id', DeliveryProblemController.store)

// Notification routes
routes.put('/order/notification/read/:id', OrderNotificationController.update)

// AUTHENTICATION
routes.use(authMiddleware)

// recipients routes
routes.post('/recipients', RecipientController.store)

// File routes
routes.post('/files', uploads.single('file'), FileController.store)

// Deliverymen routes
routes.get('/deliverymen', DeliverymanController.index)
routes.post('/deliverymen', DeliverymanController.store)
routes.put('/deliverymen/:id', DeliverymanController.update)
routes.put('/deliverymen', DeliverymanController.deactivate)

// DeliveryProblem routes without auth
routes.get('/delivery-problems', DeliveryProblemController.index)
routes.get(
  '/delivery-problems/order/:id',
  DeliveryProblemController.indexByOrderID
)
routes.put(
  '/delivery-problems/:problem_id/cancel-order',
  DeliveryProblemController.cancelOrder
)

// Order routes
routes.get('/orders', OrderController.index)
routes.post('/orders', OrderController.store)

export default routes

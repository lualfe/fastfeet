import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import auth from '../../config/auth'

export default async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'token not sent' })
  }

  const [, token] = authHeader.split(' ')
  try {
    const decoded = await promisify(jwt.verify)(token, auth.jwt_key)
    req.userID = decoded.id

    return next()
  } catch (error) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

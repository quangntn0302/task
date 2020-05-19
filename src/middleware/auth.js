const jwt = require('jsonwebtoken')

const User = require('../models/user')

const auth = async function (request, response, next) {
  try {
    const token = request.header('Authorization').replace('Bearer ', '')
    const _id = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne(
      {
        _id: _id,
        'tokens.token': token
      }
    )
    if (!user) {
      throw new Error('user is not found')
    }
    request.user = user
    request.token = token
    next()
  } catch (error) {
    response.status(401).send({ error: 'please authenticated' })
  }
}

module.exports = auth

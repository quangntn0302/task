const express = require('express')
const sharp = require('sharp')

const User = require('../models/user')
const userUtils = require('../utils/user')
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const sgMail = require('../email/account')

const router = express.Router()

router.post('/users/register', async (request, response) => {
  try {
    const data = request.body
    const checkEmail = userUtils.checkEmail(data.email)
    if (!checkEmail) {
      response.status(400).send({ error: 'email is not valid' })
    } else {
      const user = new User(data)
      await user.save()
      sgMail.sendWelcomeMail(user.email, user.name)
      response.status(201).send(user)
    }
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.post('/users/login', async (request, response) => {
  try {
    const data = request.body
    const user = await User.findByCredentials(data.email, data.password)
    const token = await user.generateAuthToken()
    response.status(200).send({ user, token })
  } catch (error) {
    response.status(404).send(error.message)
  }
})

router.post('/users/me/avatar', [auth, upload.single('avatar')], async (request, response) => {
  try {
    const buffer = await sharp(request.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    request.user.avatar = buffer
    await request.user.save()
    response.status(200).send(request.user)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.get('/users/users', async (request, response) => {
  try {
    const users = await User.find()
    response.status(201).send(users)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.get('/users/user/me', auth, async (request, response) => {
  try {
    let user = await request.user
    user = await user.populate('tasks').execPopulate()
    response.status(200).send(user)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.get('/users/:id/avatar', async (request, response) => {
  try {
    const user = await User.findById(
      {
        _id: request.params.id
      }
    )
    if (!user) {
      throw new Error()
    }
    response.set('Content-Type', 'image/jpg')
    response.send(user.avatar)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.get('/users/user/:id', async (request, response) => {
  try {
    const _id = request.params.id
    const user = await User.findById(
      {
        _id: _id
      }
    )
    if (!user) {
      throw new Error({ error: 'user is not found' })
    } else {
      response.status(201).send(user)
    }
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.get('/users/logout', auth, async (request, response) => {
  try {
    request.user.tokens = request.user.tokens.filter(token => {
      return token.token !== request.token
    })
    await request.user.save()
    response.status(200).send(request.user)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

router.patch('/users/user/:id', async (request, response) => {
  const data = request.body
  const userUpdateKeys = Object.keys(data)
  const allowUpdateFields = ['name', 'age', 'password']
  const checkUpdateUser = userUpdateKeys.every(field => {
    return allowUpdateFields.includes(field)
  })
  if (!checkUpdateUser) {
    response.status(403).send({ error: 'update is invalid' })
  } else {
    try {
      const _id = request.params.id
      const user = await User.findById(
        {
          _id: _id
        }
      )
      if (!user) {
        response.status(404).send({ error: 'user is not found' })
      } else {
        userUpdateKeys.forEach(update => {
          user[update] = data[update]
        })
        await user.save()
        response.status(201).send(user)
      }
    } catch (error) {
      response.status(500).send(error.message)
    }
  }
})

router.delete('/users/user/:id', auth, async (request, response) => {
  try {
    const _id = request.params.id
    const user = await User.findByIdAndDelete(
      {
        _id: _id
      }
    )
    if (!user) {
      response.status(404).send({ error: 'user is not found' })
    }
    await user.remove()
    response.status(201).send(user)
  } catch (error) {
    response.status(500).send(error.message)
  }
})

module.exports = router

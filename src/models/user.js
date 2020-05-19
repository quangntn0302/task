const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Task = require('../models/task')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
)

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany(
    {
      owner: user._id
    }
  )
  next()
})

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne(
    {
      email: email
    }
  )
  if (!user) {
    throw new Error('login is failed')
  }
  const checkPassword = await bcrypt.compare(password, user.password)
  if (!checkPassword) {
    throw new Error('login is failed')
  }
  return user
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, 'tokenlogin')
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.createdAt
  delete userObject.updatedAt
  delete userObject.__v
  delete userObject.id
  delete userObject.tokens
  return userObject
}

const User = mongoose.model('User', userSchema)

module.exports = User

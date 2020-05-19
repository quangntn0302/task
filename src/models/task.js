const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

taskSchema.methods.toJSON = function () {
  const task = this
  const taskObject = task.toObject()
  delete taskObject.createdAt
  delete taskObject.updatedAt
  delete taskObject.__v
  return taskObject
}

const Task = mongoose.model('Task', taskSchema)

module.exports = Task

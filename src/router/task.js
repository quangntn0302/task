const express = require('express')

const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/tasks/create', auth, async (request, response) => {
  try {
    const data = request.body
    const task = new Task(
      {
        ...data,
        owner: request.user._id
      }
    )
    await task.save()
    response.status(201).send(task)
  } catch (error) {
    response.status(500).send(error)
  }
})

router.get('/tasks/tasks', async (request, response) => {
  try {
    const tasks = await Task.find()
    response.status(201).send(tasks)
  } catch (error) {
    response.status(500).send(error)
  }
})

router.get('/tasks/task/:id', auth, async (request, response) => {
  try {
    const _id = request.params.id
    const task = await Task.findOne(
      {
        _id: _id,
        owner: request.user._id
      }
    )
    if (!task) {
      response.status(404).send('task is not found')
    } else {
      const sort = {}
      const match = {}
      if (request.query.completed) {
        match.completed = request.query.completed
      }
      if (request.query.sortBy) {
        const parts = request.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
      }
      await request.user
        .populate(
          {
            path: 'tasks',
            match: match,
            options: {
              limit: parseInt(request.query.limit),
              skip: parseInt(request.query.page - 1) * parseInt(request.query.limit),
              sort: sort
            }
          }
        )
        .execPopulate()
      response.status(201).send(request.user.tasks)
    }
  } catch (error) {
    response.status(500).send(error)
  }
})

router.patch('/tasks/task/:id', async (request, response) => {
  const data = request.body
  const taskUpdateFields = Object.keys(data)
  const allowUpdateFields = ['description', 'completed']
  const checkUpdateTask = taskUpdateFields.every(update => {
    return allowUpdateFields.includes(update)
  })
  if (!checkUpdateTask) {
    return response.status(403).send({ error: 'update is invalid' })
  } else {
    try {
      const _id = request.params.id
      const task = await Task.findById(
        {
          _id: _id
        }
      )
      if (!task) {
        response.status(404).send({ error: 'task not found' })
      } else {
        taskUpdateFields.forEach(update => {
          task[update] = data[update]
        })
        await task.save()
        response.status(201).send(task)
      }
    } catch (error) {
      response.status(500).send(error)
    }
  }
})

router.delete('/tasks/task/:id', async (request, response) => {
  try {
    const _id = request.params.id
    const task = await Task.findByIdAndDelete(
      {
        _id: _id
      }
    )
    response.status(201).send(task)
  } catch (error) {
    response.status(500).send(error)
  }
})

module.exports = router

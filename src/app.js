const express = require('express')
const bodyParser = require('body-parser')
const ip = require('ip')

const userRouter = require('./router/user')
const taskRouter = require('./router/task')
require('./database/mongoose')

const port = process.env.PORT

const app = express()
app.use(function (requset, response, next) {
  response.header("Access-Control-Allow-Origin", "*")
  response.header("Access-Control-Allow-Method", "GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE")
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
})
app.use(bodyParser.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log('Listening on port: ' + port)
})

const id = ip.address()

console.log(typeof id)

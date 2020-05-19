const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL

mongoose.connect(process.env.MONGODB_URL || connectionURL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
)

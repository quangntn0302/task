const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, 'avatars')
  },
  filename: function (request, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter: function (request, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|svg|PNG)/)) {
      return cb(new Error('Invalid file'))
    }
    cb(undefined, true)
  }
})

module.exports = upload

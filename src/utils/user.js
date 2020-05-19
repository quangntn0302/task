const validator = require('validator')

function checkEmail (email) {
  const emailInvalid = validator.isEmail(email)
  if (!emailInvalid) {
    return 0
  } else {
    return 1
  }
}

module.exports = {
  checkEmail
}


const jwt = require('jsonwebtoken')

const SupremeValidator = {
  isValidEmail(email) {
    if (email.length < 6 || email.length > 50) return false
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email)
  },
  isValidPW(pw) {
    let pwRegex = /[a-zA-Z]/
    if (pw.length < 6 || pw.length > 25) return false
    return (pw && pw.length > 5 && pw.length < 26 && pwRegex.test(pw))
  },
  generateJSONWebToken(mail){
    const signature = 'YoiRG3rots' + Math.random()
    return jwt.sign({ mail }, signature, { expiresIn: '6h' }).substr(0, 165)
  }
}


function salaryDeriv (salary_min, salary_max, currency) {
  // let currency = $t('App.currencyDic')[this.job.currency]
  console.log('cp exx1', salary_min, salary_max, currency)
  let res = ''
  if (salary_min < 1) {
    if (salary_max < 1) {
      res = 'По итогам собеседования'
      // res = $t('jobPage.salaryNone')
    } else res = salary_max + ' ' + currency
  } else {
    if (salary_min < salary_max) {
      res = `${salary_min} - ${salary_max}` + ' ' + currency
    } else
    if (salary_min == salary_max) {
      res = `${salary_max}` + ' ' + currency
    } else res = `${salary_max}` + ' ' + currency
  }
  return res
}
function expDeriv (exp_value) {
  let exp
      (1 > exp_value && exp_value>= 0) ?
        exp = '\n' + 'Без опыта.'
      :(exp_value >= 1 && 3 > exp_value) ?
        exp = '\n' + 'Опыт: от 1 до 3 лет.'
      :(exp_value >= 3 && 5 > exp_value) ?
        exp = '\n' + 'Опыт: от 3 до 5 лет.'
      :exp_value >= 5 ?
        exp = '\n' + 'Опыт: от 5 лет.'
      : exp = ''
      return exp
}

module.exports = {
  SupremeValidator,
  salaryDeriv,
  expDeriv
}
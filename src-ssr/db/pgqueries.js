const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://postgres:123456@localhost:5433/jobsnearby`
  // connectionString: `postgres://postgres@localhost:5432/jobsnearby`
})
// console.log('debug1', process.env.DATABASE_URL)
// console.log('debug2', process.env.SITE_URL)
// console.log('debug3', process.env.GMAIL_FOR_VERIFICATIONS)
// console.log('debug4', process.env.GMAIL_PW)
const titleRegex = /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\.\,\+\$\%\(\)\№\:\#\/\"]*$/

const bcrypt = require('bcryptjs')

let nodeMailer = require('nodemailer')

const fs = require('fs')
//const { SSL_OP_CRYPTOPRO_TLSEXT_BUG } = require('constants') 08AUG2020 - WHAT IS THIS AT ALL?

const DAILY_JOBS_LIMIT = 30 //Макс кол-во вакансий в день(86400 сек, что указано ниже)
// const JOBS_LIMIT_DURATIO1 = 86400 //86400 - 24 hours

const SupremeValidator = require('./../serverutils').SupremeValidator

const cookieConfig = {
  httpOnly: true, // to disable accessing cookie via client side js
  // secure: true, // to force https (if you use it)
  maxAge: 2000000000, // ttl in ms (remove this option and cookie will die when browser is closed)
  signed: true // if you use the secret with cookieParser
}
const cookieConfigNoRemember = {
  httpOnly: true, // to disable accessing cookie via client side js
  // secure: true, // to force https (if you use it)
  signed: true, // if you use the secret with cookieParser
  sameSite: true
}

function authPreValidation(session, mail) {
  if (
    session && session.length > 50
    &&
    mail && mail.length > 2 && mail.length < 51 //50 is max mail length in db now
  ) return true
  else return false
}

function hashSome() {
  let base = String(Number(new Date()))
  var hash = 0, i, chr;
  if (base.length === 0) return hash;
  for (i = 0; i < base.length; i++) {
    chr   = base.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function validateOneJob (data) {
  let parsedData = {}
  //title - обязат поле, без него вакансия пропускается; длина от 2 до 75 символов
  if (data.title && data.title.length > 1 && data.title.length < 76 && titleRegex.test(data.title)) {
    parsedData.title = data.title
  } else return false//{ iSkipped += 1; continue}
  //salary_max - необязат, целое число
  if (data.salary_max && isNaN(data.salary_max) === false && data.salary_max > -1 && Number.isInteger(Number(data.salary_max))) {
    if (String(data.salary_max).length > 5) data.salary_max = String(data.salary_max).substring(0,5)
    parsedData.salary_max = Number(data.salary_max)
  } else parsedData.salary_max = 0
  //salary_min - необязат, целое число
  if (data.salary_min && isNaN(data.salary_min) === false && data.salary_min > -1 && Number.isInteger(Number(data.salary_min))) {
    if (String(data.salary_min).length > 5) data.salary_min = String(data.salary_min).substring(0,5)
    parsedData.salary_min = Number(data.salary_min)
  } else parsedData.salary_min = 0
  //если указана min но не указана max, то добавить max
  if (parsedData.salary_max == 0 && parsedData.salary_min > 0) parsedData.salary_max = parsedData.salary_min
  if (parsedData.salary_max < parsedData.salary_min) parsedData.salary_max = parsedData.salary_min
  //валюта - необязат, [m, $, р, e], по умолчанию m
  if (data.currency && (data.currency === '$' || data.currency === 'm' || data.currency === 'р' || data.currency === 'e')) {
    parsedData.currency = data.currency
  } else parsedData.currency = 'm'

  //возр от - необязат, целое число
  if (data.age1 && isNaN(data.age1) === false && Number(data.age1) > 0 && Number(data.age1) < 250 && Number.isInteger(Number(data.age1))) {
    parsedData.age1 = Number(data.age1)
    if (parsedData.age1 < 18) parsedData.age1 = 18
  } else parsedData.age1 = 0
  //возр до - необязат, целое число
  if (data.age2 && isNaN(data.age2) === false && data.age2 > 0 && data.age2 < 250 && Number.isInteger(Number(data.age2))) {
    parsedData.age2 = Number(data.age2)
    if (parsedData.age2 < 18) parsedData.age2 = 18
  } else parsedData.age2 = 0
  //возр проверки
  if (parsedData.age2 == 18) {
    parsedData.age1 = 18
    parsedData.age2 = 0
  }
  //время от - необязат
  if (data.worktime1 && isNaN(data.worktime1) === false && data.worktime1 > -1 && data.worktime1 < 25) {
    parsedData.worktime1 = data.worktime1
  } else parsedData.worktime1 = ''
  //время до - необязат
  if (data.worktime2 && isNaN(data.worktime2) === false && data.worktime2 > -1 && data.worktime2 < 25) {
    parsedData.worktime2 = data.worktime2
  } else parsedData.worktime2 = ''
  //режим
  if (data.schedule && data.schedule.length > 0 && data.schedule.length < 11) {
    parsedData.schedule = data.schedule
  } else parsedData.schedule = ''
  //языки - обязательно массив, длина каждого языка - 50, макс кол-во языков - 3
  if (data.langs && Array.isArray(data.langs) && data.langs.length < 4) {
    let langsFiltered = data.langs.filter(lang => lang.length < 51)
    parsedData.langs = langsFiltered
  } else parsedData.langs = []
  //edu - необязат, от 2х символов до 20
  if (data.edu && data.edu.length > 1 && data.edu.length < 61) {
    parsedData.edu = data.edu
  } else parsedData.edu = ''
  //experience - стаж в годах, дробное число от 0 до 250
  if (data.experience != undefined && isNaN(data.experience) === false && data.experience >= -1 && data.experience < 250) {
    parsedData.experience = Number(data.experience)
  } else parsedData.experience = -1 //не указано = -1, без опыта = 0
  //jcategory - стаж в годах, дробное число от 0 до 250
  if (data.jcategory != undefined && isNaN(data.jcategory) === false && data.jcategory >= 0 && data.jcategory < 100) {
    parsedData.jcategory = Math.round(Number(data.jcategory))
  } else parsedData.jcategory = 0 //без категории = 0
  //city - необязат, от 2х символов до 100
  if (data.city && data.city.length > 1 && data.city.length < 71) {
    parsedData.city = data.city
  } else parsedData.city = ''
  //jobtype - постоянная, временная или пусто
  if (data.jtype && data.jtype == 'c') parsedData.jobtype = 'c'
  else if (data.jtype && data.jtype == 'v') parsedData.jobtype = 'v'
  else parsedData.jobtype = ''
  //description - необязат, от 2х символов до 500
  if (data.description && data.description.length > 1 && data.description.length < 3001) {
    parsedData.description = data.description
  } else parsedData.description = ''
  //"contact_tel", "contact_mail", 
  //contact_tel - не обязат на самом деле; длина до 15 символов
  data.contact_tel = String(data.contact_tel).trim()
  if (data.contact_tel && data.contact_tel.length < 16 && /^[\+0-9\-\(\)]*$/.test(data.contact_tel)) {
    parsedData.contact_tel = data.contact_tel
  } else parsedData.contact_tel = ''
  //contact_mail - не обязат на самом деле; длина до 40 символов
  if (data.contact_mail && data.contact_mail.length < 41 && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(data.contact_mail)) {
    parsedData.contact_mail = data.contact_mail
  } else parsedData.contact_mail = ''

  //contact_amil or contact_tel must be present!
  if (parsedData.contact_tel.length == 0 && parsedData.contact_mail.length == 0) {
    return false
  }

  return parsedData
}


async function setLangCookie(req, res) {
  let lang = req.body.lang
  // console.log('lang, settings cookies:', lang)
  res.cookie('lang', lang, cookieConfigNoRemember)
  res.send('have a nice cookies')
}

async function resend(req, res) {
  //page with form to request a resend
  let body = `
    <main style="width: 100%; display: flex; justify-content: center;">
      <form action="/resender.json" method="POST" style="padding:10px; background-color: #dfd; width: auto; display: inline-block; font-size: 18px; font-family: sans-serif;">
        <p>Письмо верификации не дошло? (в папке спам тоже нет?)</p>
        <label for="mail1">Введите Email</label>
        <input id="mail1" name="mail" />
        <input type="submit" value="Отправить еще раз"/>
      </form>
    </main>
  `
  let page = `<!DOCTYPE html>
  <html lang="en"><head><style>
  section {
    width: 100%;
  }
  .detailed__line {
    display: flex;
  }
  </style></head><body>` + body + `<footer></footer>`
  res.send(page)
}

async function getVerificationEntry(mail) {
  //mail should be prechecked for validity outside this
  //just get the whole entry by mail
  let que = `
  SELECT uid, url, mail, EXTRACT(EPOCH FROM time_created - 'now()'::timestamptz) AS time_passed
  FROM "verifications" WHERE mail = $1
  `
  let params = [mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('getVerificationEntry failed')
  })
  if (result && result.rows && result.rows.length == 1) return result.rows
  else return undefined
}

async function veriUpdTime(mail) {
  //mail should be prechecked for validity outside this
  let que = `
    UPDATE "verifications"
    SET time_created = NOW()
    WHERE mail = $1
  `
  let params = [mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('veriUpdTime')
  })
}


async function resender(req, res) {
  let mail = req.body.mail

  //check the mail's by regex and length
  if (SupremeValidator.isValidEmail(mail)) {
    let veri = await getVerificationEntry(mail).catch(error => {
      //res.send('step2')
      return undefined
    })
    if (veri) {
      if (veri[0].time_passed < -300) {
        console.log('time in', veri[0].time_passed)
        //send mail if ok, and send the user, that its resent, or that u shall wait so much  
        testMail(veri[0].url, mail)
        let upd = await veriUpdTime(mail).catch(error => {
          //res.send('step2')
          return undefined
        })
        //let baseUrl = process.env.NODE_ENV ? 'https://jobsnearby.herokuapp.com' : 'http://127.0.0.1:8080'
        let baseUrl = process.env.SITE_URL || 'http://127.0.0.1:8080'
        //res.send('Повторное письмо с ссылкой для активации учетной записи отправлено. <a href="' + baseUrl + '/registration?login=1">Войти</a> на сайт.')
        res.send('<html><body><script>window.location.replace("' + baseUrl + '/registration?login=1&resender=1")</script></body></html>')
      } else {
        res.send('Повторная отправка верификации возможна не реже чем раз в 5 минут. Прошло ' + -Math.round(veri[0].time_passed/60) + ' минут')
      }
    } else res.send('Неправильный email')
  } else res.send('error 1')
}

async function verifiedMailExists(mail) {
  //check if its verified too!!!
  //but need to return the result if it exists but is not verified, like verify first
  let que = `
    SELECT email_confirmed
    FROM users
    WHERE email = $1
  `
  let params = [mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('verifiedMailExists failed')
  })
  if (result && result.rows && result.rows.length == 1 && result.rows[0].email_confirmed == true) return true
  else return undefined
}

async function insertForgottenEntry(mail, url) {
  let que = `
    INSERT INTO "forgotten"
    ("mail", "url", "time_created") VALUES ($1, $2, NOW())
  `
  let params = [mail, url]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('insertForgottenEntry failed')
  })
  if (result) return true
  else return undefined
}

async function forgottenMail(url, mail) {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        // should be replaced with real sender's account
        user: process.env.GMAIL_FOR_VERIFICATIONS || 'jobsnearby1000@gmail.com',
        pass: process.env.GMAIL_PW || 'g789451bb'
    }
  })
  console.log('sending ащкпщееут mail')
  let baseUrl = process.env.SITE_URL || 'http://127.0.0.1:7777'
  let url1 = baseUrl + '/forgottenx2.json?n=' + url
  let mailOptions = {
    // should be replaced with real recipient's account
    to: mail,
    subject: 'Восстановление пароля на hunarmen.com',
    text: 'Для получения нового пароля нужно подтвердить восстановление, перейдя по ссылке ' + url1 + '. После этого вы получите второе письмо с новым паролем. Эта ссылка действительна в течении 2 часов.'
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      //res.send('NOT OK')
      return 'ERR'
    }
    //res.send('OK')
    console.log('Message2 %s sent: %s', info.messageId, info.response);
    return 'OK'
  })
}
async function forgottenRequest1stCheck(mail) {
  let que = `
    SELECT url, mail, EXTRACT(EPOCH FROM time_created - 'now()'::timestamptz) AS time_passed
    FROM forgotten
    WHERE mail = $1
  `
  let params = [mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('forgottenRequest1stCheck failed')
  })
  if (result && result.rows && result.rows.length == 1) return result.rows[0]
  else return undefined
}

async function updateForgottenEntry(mail,url) {
  let que = `
    UPDATE "forgotten"
    SET ("url", "time_created") = ($1, NOW())
    WHERE mail = $2
  `
  let params = [url, mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('updateForgottenEntry failed')
  })
  if (result) return true
  else return undefined
}

async function forgottenx(req, res) {
  let mail = req.body.mail
  if (SupremeValidator.isValidEmail(mail)) {
    let veri = await verifiedMailExists(mail).catch(error => {
      return undefined
    })
    if (veri) {
      //check if there is already a request for new pw in the table first
      //need to check if mail in the forgotten basically
      //just get all that info
      let firstCheck = await forgottenRequest1stCheck(mail).catch(error => {
        return undefined
      })
      if (firstCheck == undefined) {
        let hash1 = String(hashSome()) + parseInt(Math.random()*100000000000, 11)

        let dbEntry = await insertForgottenEntry(mail, hash1).catch(error => {
          return undefined
        })
        if (dbEntry) {
          //send mail
          forgottenMail(hash1, mail)
          //send page that its sent
          res.send('Письмо подтверждения восстановления пароля отправлено на вашу почту. Оно будет действительно в течении 2 часов')
        } else res.send('Ошибка базы данных 1')
      } else if (firstCheck && firstCheck.time_passed <= -1200) {//1200 = 20 min?
        //rewrite old
        //use the old url
        let hash1 = firstCheck.url
        //rewrite the record
        let dbEntry = await updateForgottenEntry(mail, hash1).catch(error => {
          return undefined
        })
        if (dbEntry) {
          //send mail
          forgottenMail(hash1, mail)
          //send page that its sent
          res.send('Письмо подтверждения восстановления пароля отправлено на вашу почту')
        } else res.send('Ошибка базы данных 2')
      } else if (firstCheck && firstCheck.time_passed > -1200) {
        //send back that time hasnt passed
        res.send('Вы уже запрашивали восстановление пароля ' + Math.round(firstCheck.time_passed / -60) + ' минут назад. Минимальное время между сбросами 20 минут')
      } else res.send('Ошибка на сервере')
    } else res.send('Несуществующий, либо не верифицированный mail')
  } else res.send('Неправильный формат адреса')
}

async function forgCheck(n) {
  let que = `
    DELETE FROM "forgotten"
    WHERE url = $1
    RETURNING mail, EXTRACT(EPOCH FROM time_created - 'now()'::timestamptz) AS time_passed
  `
  let params = [n]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('forg check err1')
  })
  if (result && result.rowCount === 1) {
    return result.rows[0]
  } return undefined
}
async function forgChangePw(pwhash, mail) {
  //mail and hash should be prechecked for validity
  let que = `
    UPDATE "users"
    SET pwhash = $1
    WHERE email = $2
  `
  let params = [pwhash, mail]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp forgChangePw: ', error)
    throw new Error('user update fail')
  })
  return true
}

async function forgottenx2Mail(newpw, mail) {
  console.log('sending forgotten2: ' + newpw + ' ' + mail)
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_FOR_VERIFICATIONS || 'jobsnearby1000@gmail.com',
      pass: process.env.GMAIL_PW || 'g789451bb'
    }
  })
  let mailOptions = {
    // should be replaced with real recipient's account
    to: mail, //'origami1024@gmail.com',
    subject: 'Сгенерирован новый пароль на hunarmen.com',
    text: 'Пароль пользователя на hunarmen.com изменен по процедуре восстановления на: ' + newpw + '. Измените его в профиле на более безопасный.'
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      //res.send('NOT OK')
      return 'ERR'
    }
    //res.send('OK')
    console.log('Message3 %s sent: %s', info.messageId, info.response);
    return 'OK'
  })
}

async function forgottenx2(req, res) {
  console.log('fx2: ', req.query.n)
  let reg = /^\d+$/
  let n1 = req.query.n
  //u need to check if link in db
  if (reg.test(n1) == false || String(n1).length > 25) {
    console.log('Error: wrong num2')
    res.status(400).send('WRONG VERIFICATION LINK2')
    return false
  }
  //after that check if its in db, check by deletion//consume the db entry(delete)
  let forg = await forgCheck(n1).catch(error => {
    //res.send('step2')
    return undefined
  })
  if (forg) {
    //check here time, send diff response based on that.
    //respond that its sent
    if (forg.time_passed > -7200) {
      //within the time - send mail, redirect
      //generate the new pw
      let pwarr = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNMM'
      let newpw = ''
      var i = 10
      while (i--) {
        newpw += pwarr[Math.round(Math.random()*62)]
      }
      //generate the hash of that pw
      let hash = bcrypt.hashSync(newpw, bcrypt.genSaltSync(9))
      //put it into the db
      let some = await forgChangePw(hash, forg.mail).catch(error => {
        return undefined
      })
      //send letter-2 to the mail in the consumed entry
      forgottenx2Mail(newpw, forg.mail)
      //let baseUrl = process.env.NODE_ENV ? 'https://jobsnearby.herokuapp.com' : 'http://127.0.0.1:8080'
      let baseUrl = process.env.SITE_URL || 'http://127.0.0.1:8080'
      //res.send('Пароль сброшен. Новый пароль отправлен на вашу почту. <a href="' + baseUrl + '/registration?login=1">Войти</a>')
      res.send('<html><body><script>window.location.replace("' + baseUrl + '/registration?login=1&reset=1")</script></body></html>')
    } else res.send('Ссылка сброса пароля просрочена (2 часа макс), попробуйте еще раз')
  } else res.send('Ошибка в адресе верификации')
  
}

async function forgotten(req, res) {
  let body = `
    <main>
      <form action="/forgottenx.json" method="POST">
        <p>Пароль забыт и утерян?</p>
        <p>Его можно восстановить получив письмо на оригинальный mail и перейдя по ссылке</p>
        <br>
        <label for="mail1">Введите Email</label>
        <input id="mail1" name="mail"/>
        <input type="submit" value="Отправить"/>
      </form>
    </main>
  `
  let page = `<!DOCTYPE html>
  <html lang="en"><head><style>
  section {
    width: 100%;
  }
  .detailed__line {
    display: flex;
  }
  </style></head><body>` + body + `<footer></footer>`
  res.send(page)
}


async function addJobs (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email, new_jobs_count_today, EXTRACT(EPOCH FROM new_jobs_count_date - 'now()'::timestamptz) AS last_posted FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    let results = await pool.query(que1st, params1st).catch(error => {
      console.log('cp addJobs errX: ', error)
      return false
    })
    if (!results || !results.rows || results.rows.length != 1) {
      res.send('step3')
      return false
    }

    let processedlength = Math.min(req.body.length, 31)
    let totalLengthReport = processedlength
    
    let uid = results.rows[0].user_id
    let last_posted = results.rows[0].last_posted
    let limitCount = parseInt(results.rows[0].new_jobs_count_today)
    if (!limitCount) limitCount = 0
    
    if (results.rows[0].email == 'vepashv@gmail.com') {
      limitCount = 0
      console.log('moderator action - no limits')
    }

    if (limitCount >= DAILY_JOBS_LIMIT) {//-86400
      res.send({msg: 'error limits reached', added: 0, total: req.body.length})
      return false
    }
    // if (parseInt(last_posted) < -JOBS_LIMIT_DURATIO1) {
    //   limitCount = 0
    // }
    if (DAILY_JOBS_LIMIT - limitCount < processedlength) processedlength = DAILY_JOBS_LIMIT - limitCount

    
    if (processedlength > 0) {
      let que2nd = `INSERT INTO "jobs" ("title", "salary_max", "salary_min", "currency", "age1", "age2", "worktime1", "worktime2", "schedule", "langs", "edu", "experience", "jcategory", "city", "jobtype", "description", "contact_tel", "contact_mail", "author_id") VALUES`
      let params2nd = []
      let n = 19
      let iSkipped = 0
      for (let i = 0; i < processedlength; i++) {//Math.min - максимум 15
        req.body[i].jcategory
        let parsedData = validateOneJob(req.body[i])
        if (parsedData == false) { iSkipped += 1; continue}
        //author_id - проверка не нужна
        parsedData.author_id = results.rows[0].user_id
        let j = i - iSkipped
        que2nd += ` ($${(j * n) + 1}, $${(j * n) + 2}, $${(j * n) + 3}, $${(j * n) + 4}, $${(j * n) + 5}, $${(j * n) + 6}, $${(j * n) + 7}, $${(j * n) + 8}, $${(j * n) + 9}, $${(j * n) + 10}, $${(j * n) + 11}, $${(j * n) + 12}, $${(j * n) + 13}, $${(j * n) + 14}, $${(j * n) + 15}, $${(j * n) + 16}, $${(j * n) + 17}, $${(j * n) + 18}, $${(j * n) + 19}),`
        params2nd = [
          ...params2nd,
          ...Object.values(parsedData)
        ]
      }
      que2nd = que2nd.substring(0, que2nd.length - 1)
      let result2 = await pool.query(que2nd, params2nd).catch(error2 => {
        console.log('cp addJobs err2: ', error2)
        return false
      })
      if (!result2) {
        res.send('error39.5')
        return false
      }
    }
    
    let que3rd = `UPDATE "users" SET "new_jobs_count_today" = $1 WHERE user_id = $2`
    let params3rd = [limitCount + processedlength, uid]
    // if (last_posted == null || parseInt(last_posted) == NaN || parseInt(last_posted) < -JOBS_LIMIT_DURATIO1) {
    //   que3rd = `UPDATE "users" SET ("new_jobs_count_today") = ($2) WHERE user_id = $1`
    //   params3rd = [uid, processedlength]
    // }
    pool.query(que3rd, params3rd, (error3, results3) => {
      if (error3) {
        res.send('step4')
        return false
      }
      if (processedlength < totalLengthReport) {
        res.send({msg: 'error limits reached', added: processedlength, total: req.body.length})
      } else res.send('OK')
      //Добавление логов
      addLog('Вакансии добавлены(n)', 'Добавлено ' + processedlength, results.rows[0].user_id, results.rows[0].email)
    })
    
  } else {res.send('step1'); console.log('a trespasser is trying to send xls')}
}



async function viewHit(req, res) {
  let hit = parseInt(req.body[0])
  if (isNaN(hit) || hit < 0 || String(hit).length > 10) {
    console.log('Error: wrong hit')
    res.status(400).send('Неправильный hit.')
    return false
  }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que = `
      SELECT user_id
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'company'
    `
    let result = await pool.query(que, [req.signedCookies.session, req.signedCookies.mail]).catch(error => {
      console.log('cp viewHit err1: ', error)
    })
    if (result.rows.length == 1) {
      let que2 = `
        UPDATE cvhits SET "date_checked" = NOW()
        WHERE date_checked IS NULL AND cvhit_id = $1 AND (SELECT author_id
          FROM jobs
          WHERE job_id = cvhits.cvjob_id) = $2
      `
      let params2 = [hit,result.rows[0].user_id]
      let result2 = await pool.query(que2, params2).catch(error => {
        console.log('cp viewHit err2: ', error)
        return false
      })
      if (result2) {
        res.send('OK')
      } else res.send('BAD')
    } else res.send('error 1')

  }
}

async function getResps(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    //get author_id first, also check role in the process
    let que = `
      SELECT user_id
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'company'
    `
    let result = await pool.query(que, [req.signedCookies.session, req.signedCookies.mail]).catch(error => {
      console.log('cp getResps err1: ', error)
    })
    if (result.rows.length == 1) {
      // let que2 = `
      //   SELECT cvhits.*, jobs.title, users.name, users.surname
      //   FROM cvhits, jobs, users
      //   WHERE jobs.author_id = $1 AND cvhits.cvjob_id = jobs.job_id AND cvhits.cvuser_id = users.user_id
      // `
      let que2 = `
        SELECT cvhits.*, jobs.title, users.name, users.surname, users.cv_id
        FROM cvhits
        INNER JOIN jobs
        ON jobs.author_id = $1
        AND cvhits.cvjob_id = jobs.job_id
        INNER JOIN users
        ON cvhits.cvuser_id = users.user_id
      `
      let params2 = [result.rows[0].user_id]
      let resps = await pool.query(que2, params2).catch(error => {
        console.log('cp getResps err2: ', error)
      })
      if (resps.rows && resps.rows.length > 0) {
        res.send({rows: resps.rows})
      } else res.send({rows: []})

    } else res.send('error 1')
    
  } else res.send('error 0')
}


async function reopenJobById(req, res) {
  const jid = parseInt(req.query.jid)
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows || results.rows.length != 1) {
        res.send('step3')
        return false
      }

      let que2nd = `UPDATE jobs SET (is_closed, time_updated) = (FALSE, NOW()) WHERE (author_id = $1 AND job_id = $2)`
      //console.log(que2nd)
      let params2nd = [results.rows[0].user_id, jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('reopenJobById Error2: ', error2)
          res.status(400).send('error22')
          return false
        }
        res.status(200).send('OK')
        //Добавление логов
        addLog('Вакансия открыта', 'Айди вакансии: ' + jid, results.rows[0].user_id, results.rows[0].email)
      })

    })
  } else {res.send('wrong userinfo(reopenJobById)')}
}

async function deleteJobById(req, res) {
  const jid = parseInt(req.query.jid)
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }

  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows || results.rows.length != 1) {
        res.send('step3')
        return false
      }
      
      let que2nd = `DELETE FROM jobs where (author_id = $1 AND job_id = $2)`
      //console.log(que2nd)
      let params2nd = [results.rows[0].user_id, jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('deleteJobById Error2: ', error2)
          res.status(400).send('error22')
          return false
        }
        res.status(200).send('OK')
        addLog('Вакансия удалена', 'Айди вакансии: ' + jid, results.rows[0].user_id, results.rows[0].email)
      })

    })
  } else {res.send('wrong userinfo(deleteJBI)')}
}

async function closeJobById(req, res) {
  const jid = parseInt(req.query.jid)
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows || results.rows.length != 1) {
        res.send('step3')
        return false
      }
      let que2nd = `UPDATE jobs SET (is_closed, time_updated) = (TRUE, NOW()) WHERE (author_id = $1 AND job_id = $2)`
      //console.log(que2nd)
      let params2nd = [results.rows[0].user_id, jid]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('closeJobById Error2: ', error2)
          res.status(400).send('error22')
          return false
        }
        res.status(200).send('OK')
        //Добавление логов
        addLog('Вакансия закрыта', 'Айди вакансии: ' + jid, results.rows[0].user_id, results.rows[0].email)
      })

    })
  } else {res.send('wrong userinfo(closeJBI)')}
}

async function getOwnJobs (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows || results.rows.length != 1) {
        res.send('step3')
        return false
      }

      let que2nd = `
        SELECT jobs.job_id, jobs.city, jobs.experience, jobs.jobtype, jobs.title, jobs.edu, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.sex, jobs.description, jobs.worktime1, jobs.worktime2, jobs.age1, jobs.age2, jobs.langs, jobs.time_published as published, jobs.time_updated as updated, jobs.contact_tel, jobs.contact_mail, cardinality(jobs.hits_log) as hits_all, (select count(distinct a) from unnest(jobs.hits_log) as a) as hits_uniq, jobs.is_closed, jobs.closed_why, jobs.jcategory, jobs.is_published
        FROM jobs
        WHERE jobs.author_id = $1
        GROUP BY jobs.job_id
        ORDER BY (jobs.time_updated, jobs.job_id) DESC
      `
      
      let params2nd = [results.rows[0].user_id]
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          res.send('step3')
          return false
        }
        // res.send({rows: results2.rows})
        res.send(results2.rows)
      })
      //send back response
      //handle finding nothing?
    })
  } else res.send('logout, wrong userinfo')
}


async function updateJob (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows || results.rows.length != 1) {
        res.send('step3')
        return false
      }

      let jid = req.body.job_id
      if (isNaN(jid) != false || !Number.isInteger(Number(jid)) || jid < 0) {
        res.send('wrong job id: ' + jid)
        // console.log('cp34: ', jid)
        return false
      }
      let parsedData = validateOneJob(req.body)
      if (parsedData == false) {
        res.send('error, not passing validation')
        return false
      }

      let que2nd = `UPDATE "jobs" SET ("time_updated", "title", "salary_max", "salary_min", "currency", "age1", "age2", "worktime1", "worktime2", "schedule", "langs", "edu", "experience", "city", "jobtype", "description", "contact_tel", "contact_mail", "jcategory") =
                    (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    WHERE author_id = $19 AND job_id = $20
                    RETURNING job_id, title`
      let params2nd = [parsedData.title, parsedData.salary_max, parsedData.salary_min, parsedData.currency, parsedData.age1, parsedData.age2, parsedData.worktime1, parsedData.worktime2, parsedData.schedule, parsedData.langs, parsedData.edu, parsedData.experience, parsedData.city, parsedData.jobtype, parsedData.description, parsedData.contact_tel, parsedData.contact_mail, parsedData.jcategory, results.rows[0].user_id, jid]

      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('updateJob, err2: ', error2)
          res.send('error')
          return false
        }
        if (results2.rows.length > 0) {
          //Добавление логов
          addLog('Вакансия изменена', parsedData.title, results.rows[0].user_id, results.rows[0].email)
          res.send({...results2.rows[0], 'result': 'OK'})
        } else res.send('error unkn')
      })
    })
  } else {res.send('auth fail edit')}
}

async function addOneJob (req, res) {
  // console.log('cp177', req.signedCookies)
  // console.log('cp178', req.signedCookies)
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, email, new_jobs_count_today FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('addOneJob. step3-2: ' + results.rows.length + ' ' + results.rows)
        return false
      }
      let uid = results.rows[0].user_id
      let limitCount = parseInt(results.rows[0].new_jobs_count_today)
      if (!limitCount) limitCount = 0
      // console.log('cp67', last_posted)
      // console.log('cp68', limitCount)
      if (limitCount >= DAILY_JOBS_LIMIT) {//-86400
        res.send('error limits reached')
        return false
      }

      let parsedData = validateOneJob(req.body)
      if (parsedData == false) {
        res.send('error, not passing validation')
        return false
      }
      //author_id - проверка не нужна
      parsedData.author_id = results.rows[0].user_id
      //console.log('addOneJob cp2: ', parsedData)
      let que2nd = `INSERT INTO "jobs" ("title", "salary_max", "salary_min", "currency", "age1", "age2", "worktime1", "worktime2", "schedule", "langs", "edu", "experience", "city", "jobtype", "description", "author_id", "contact_tel", "contact_mail", "jcategory") VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    RETURNING job_id, title`
      let params2nd = [parsedData.title, parsedData.salary_max, parsedData.salary_min, parsedData.currency, parsedData.age1, parsedData.age2, parsedData.worktime1, parsedData.worktime2, parsedData.schedule, parsedData.langs, parsedData.edu, parsedData.experience, parsedData.city, parsedData.jobtype, parsedData.description, parsedData.author_id, parsedData.contact_tel, parsedData.contact_mail, parsedData.jcategory]
      
      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('send1Job, err2: ', error2)
          res.send('error')
          return false
        }
        if (results2.rows.length > 0) {
          let que3rd = `UPDATE "users" SET "new_jobs_count_today" = $1 WHERE user_id = $2`
          let params3rd = [limitCount + 1, uid]
          
          pool.query(que3rd, params3rd, (error3, results3) => {
            if (error3) {
              res.send('step4')
              return false
            }
            //Добавление логов
            addLog('Вакансия добавлена', parsedData.title, parsedData.author_id, results.rows[0].email)
            res.send({...results2.rows[0], 'result': 'OK'})
          })
          
        } else res.send('error unkn')
        
        
      })
    })

  } else {res.send('auth fail')}
}

async function cvGetDetail(req, res) {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0 || String(id).length > 10) {
    res.status(400).send('Неправильный id')
    return false
  }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    const que1st = `SELECT user_id, email, role, rights, cv_id FROM "users" WHERE auth_cookie = $1 AND email = $2`
    const params1st = [req.signedCookies.session, req.signedCookies.mail]

    pool.query(que1st, params1st, async (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('step3-2: ' + results.rows.length)
        return false
      }

      const user_id = results.rows[0].user_id
      const rights = results.rows[0].rights
      
      const role = results.rows[0].role
      let allowedCvIds = []
      if (rights !== 'bauss' && role === 'company') {
        const queAllowedCvs = `SELECT users.cv_id from jobs, cvhits, users
          WHERE jobs.author_id = $1 AND jobs.job_id = cvhits.cvjob_id AND users.user_id = cvhits.cvuser_id
          GROUP BY users.cv_id`

        const allowedCvsResp = await pool.query(queAllowedCvs, [user_id]).catch(error => {
          console.log('cp allowedCvsResp err: ', error)
          return false
        })
        if (!allowedCvsResp || !allowedCvsResp.rows || !allowedCvsResp.rows.length) {
          res.send('step7-1')
          return false
        }
        allowedCvIds = allowedCvsResp.rows.map(row => row.cv_id)
      }

      
      const cv_id = results.rows[0].cv_id
      if (rights !== 'bauss' && !(role === 'company' && allowedCvIds.includes(String(id))) && !(role === 'subscriber' && cv_id && cv_id == id)) { // && rights === 'bauss'
        res.send('Step3-3. Authorization problems. ' + role + ' ' + cv_id)
        return false
      }

      const que2 = `SELECT cvs.*, users.last_logged_in FROM "cvs", "users" WHERE users.cv_id = cvs.id AND cvs.id = $1`
      const params2 = [ id ]
      pool.query(que2, params2, (err2, results2) => {
        if (err2) {
          res.send('step4. Error')
          return false
        }
        if (!results2.rows.length) {
          res.send('Error, does not exist')
          return false
        }


        const que3 = `SELECT * FROM "cv_exps" WHERE cv_id = $1`
        
        pool.query(que3, params2, (error3, results3) => {
          if (error3) {
            res.status(400).send('error33', error3)
            return false
          }

          const que4 = `SELECT * FROM "cv_edus" WHERE cv_id = $1`
          
          pool.query(que4, params2, (error4, results4) => {
            if (error4) {
              res.status(400).send('error44')
              return false
            }

            if (results3.rows && results3.rows.length) {
              results3.rows.forEach(row => {
                delete row.cv_id
              })
            }

            if (results4.rows && results4.rows.length) {
              results4.rows.forEach(row => {
                delete row.cv_id
              })
            }
            results2.rows[0].cvExt = {
              exps: results3.rows,
              edus: results4.rows
            }

            res.send(results2.rows[0])
          })

        })
      })

    })

  } else {res.send('auth fail')}
}

async function cvGetIndex(req, res) {
  // console.log('cp7', req.query)
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    const que1st = `SELECT user_id, email FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company' AND rights = 'bauss'`
    const params1st = [req.signedCookies.session, req.signedCookies.mail]

    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('step3-2: ' + results.rows.length)
        return false
      }

      let approvedFilters = {
        'txt': null,
        'position': null,
        'expname': null,
        'car': null,
        'city_current': null,
        'city_based': null,
        'edu': null,
        'tel': null,
        'sal_min': null,
        // 'sal_max': null,
        'langs': null,
        'exp_min': null,
        'exp_max': null
      }
      let likeFilters = [
        'txt',
        'position',
        'expname',
        'city_current',
        'city_based',
        'edu',
        'tel'
      ]
      //LIKE %% filter or exact equals
      Object.keys(approvedFilters).forEach(key => {
        if (req.query[key]) {
          const val = likeFilters.includes(key)
            ? '%' + String(req.query[key]).toLowerCase() + '%'
            : String(req.query[key].toLowerCase())
          approvedFilters[key] = val
        }
      })

      // txt first
      let filters = ''
      let filtersArray = []
      let fParams = []
      let currentParamNum = 1
      if (approvedFilters.txt) {
        filtersArray.push(`(LOWER(cvs.name) LIKE $${currentParamNum} OR
        LOWER(cvs.surname) LIKE $${currentParamNum} OR
        LOWER(cvs.email) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.txt)
        currentParamNum += 1
        // AND
        //         (LOWER(jobs.title) LIKE $2 OR
        //         LOWER(users.company) LIKE $2 OR
        //         LOWER(jobs.description) LIKE $2 OR
        //         LOWER(jobs.city) LIKE $2)` : ''}
        //         txt = '%' + req.query.txt.toLowerCase() + '%'
      }
      if (approvedFilters.position) {
        filtersArray.push(`(LOWER(cv_exps.position) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.position)
        currentParamNum += 1
      }

      if (approvedFilters.expname) {
        filtersArray.push(`(LOWER(cvs.wanted_job) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.expname)
        currentParamNum += 1
      }
      
      if (approvedFilters.car) {
        filtersArray.push(`(cvs.car = $${currentParamNum})`)
        fParams.push(approvedFilters.car)
        currentParamNum += 1
      }

      if (approvedFilters.city_current) {
        filtersArray.push(`(LOWER(cvs.city_current) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.city_current)
        currentParamNum += 1
      }

      if (approvedFilters.city_based) {
        filtersArray.push(`(LOWER(cvs.city_based) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.city_based)
        currentParamNum += 1
      }

      if (approvedFilters.edu) {
        filtersArray.push(`(LOWER(cvs.edu) LIKE $${currentParamNum} OR
        LOWER(cv_edus.general) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.edu)
        currentParamNum += 1
      }

      if (approvedFilters.tel) {
        filtersArray.push(`(LOWER(cvs.tel) LIKE $${currentParamNum} OR
        LOWER(cvs.tel_home) LIKE $${currentParamNum})`)
        fParams.push(approvedFilters.tel)
        currentParamNum += 1
      }

      if (approvedFilters.sal_min) {
      // 1. IF NOT NUMBER PROBLEM
      // 2. intervals problem
        filtersArray.push(`(cvs.salary_max >= $${currentParamNum})`)
        //  OR cvs.salary_max IS NULL
        fParams.push(approvedFilters.sal_min)
        currentParamNum += 1
      }
      if (approvedFilters.langs && approvedFilters.langs.length < 76) {
        const langsPrep = '{' + approvedFilters.langs.replace(/[{}]/gi, '') + '}'
        filtersArray.push(`($${currentParamNum} && cvs.langs::varchar[])`)
        fParams.push(langsPrep)
        currentParamNum += 1
      }

      if (approvedFilters.exp_min && !isNaN(Number(approvedFilters.exp_min))) {
        const expMinNum = Number(approvedFilters.exp_min)
        filtersArray.push(`(cvs.total_exp >= $${currentParamNum})`)
        fParams.push(expMinNum)
        currentParamNum += 1
      }

      if (approvedFilters.exp_max && !isNaN(Number(approvedFilters.exp_max))) {
        const expMaxNum = Number(approvedFilters.exp_max)
        filtersArray.push(`(cvs.total_exp <= $${currentParamNum})`)
        fParams.push(expMaxNum)
        currentParamNum += 1
      }

      
      if (filtersArray.length) {
        filters = 'WHERE ' + filtersArray.join(' AND ')
      }

      // console.log('cp filters packed:', filters)
      // console.log('cp filters parms:', fParams)


      let page = 1
      const perpage = 25
      if (req.query.page && Number(req.query.page) > 0 && Number(req.query.page) < 11) page = Number(req.query.page)
      const offset = (page - 1) * Number(perpage)

      const que2 = `SELECT cvs.*, users.last_logged_in FROM "cvs"
        LEFT OUTER JOIN cv_exps ON (cvs.id = cv_exps.cv_id)
        LEFT OUTER JOIN cv_edus ON (cvs.id = cv_edus.cv_id)
        LEFT OUTER JOIN users ON (cvs.id = users.cv_id)
        ${filters || ''}
        GROUP BY cvs.id, users.last_logged_in
        ORDER BY users.last_logged_in DESC
        LIMIT ${perpage}
        ${offset ? ' OFFSET ' + offset : ''}`

      // const que2 = `SELECT cvs.*, cv_exps.*, cv_edus.* FROM "cvs" LEFT OUTER JOIN cv_exps ON (cvs.id = cv_exps.cv_id) LEFT OUTER JOIN cv_edus ON (cvs.id = cv_edus.cv_id)  ${filters || ''} LIMIT ${perpage}${offset ? ' OFFSET ' + offset : ''}`
      // const que2 = `SELECT * FROM "cvs" LIMIT ${perpage}${offset ? ' OFFSET ' + offset : ''}`
      // console.log('cp 9090', que2)
      const params2 = filters.length ? fParams : null
      pool.query(que2, params2, (err2, res2) => {
        if (err2) {
          res.send('step4. Error' + err2)
          return false
        }
        // that is all shiet cause then pagination is cooked
        // let cvs = []
        // console.log('cp rr', res2.rows.length)
        // res2.rows.forEach(row => {
        //   // just remove duplicates, no need for the related data on index
        //   // just need it in search
        //   const needle = cvs.findIndex(cv => cv.id === row.id)
        //   if (needle === -1) {
        //     cvs.push(row)
        //   }
        // })
        // // res2.rows.forEach(row => {
        // //   const needle = cvs.findIndex(cv => cv.id === row.id)
        // //   if (needle > -1) {
        // //     cvs[needle].exps.push({place: row.place, position: row.position, start: row.start, end: row.end, desc: row.desc})
        // //   }
        // //   cvs.push(row)
        // // })
        const que3 = `SELECT COUNT(DISTINCT cvs.id) FROM "cvs"
        LEFT OUTER JOIN cv_exps ON (cvs.id = cv_exps.cv_id)
        LEFT OUTER JOIN cv_edus ON (cvs.id = cv_edus.cv_id)
        ${filters || ''}`
        pool.query(que3, params2, (err3, res3) => {
          if (err3) {
            res.send('step5. Error')
            return false
          }
          
          res.status(200).json({...res3.rows[0], page, perpage, rows: res2.rows})
        
        })
        // res.send(res2.rows)
      })
    })
  } else {res.send('auth fail')}
}
// async function cvFetchForEditSSR(req, res) {
//   if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
//     const que1st = `SELECT user_id, email, cv_id FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
//     const params1st = [req.signedCookies.session, req.signedCookies.mail]
//     const authCheck = await pool
//       .query(que1st, params1st)
//       .catch(err => false)
//     if (!authCheck || !authCheck.rows || authCheck.rows.length !== 1) return false
    
//     const cv_id = authCheck.rows[0].cv_id
//     if (!cv_id) return false

//     const que2 = `SELECT * FROM "cvs" WHERE id = $1`
//     const params2 = [cv_id]
//     const result = await pool
//       .query(que2, params2)
//       .catch(err => false)
//     if (!result || !result.rows || result.rows.length !== 1) return false

//     return result.rows[0]
//   }
// }

async function cvFetchForEdit(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    const que1st = `SELECT user_id, email, cv_id FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    const params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('Step 2. Auth error')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('step3-2: ' + results.rows.length)
        return false
      }

      const cv_id = results.rows[0].cv_id

      if (!cv_id) {
        res.send('step4: cv doesnt exists')
        return false
      }

      const que2 = `SELECT * FROM "cvs" WHERE id = $1`
      const params2 = [cv_id]

      pool.query(que2, params2, (error2, results2) => {
        if (error2) {
          res.status(400).send('error22')
          return false
        }
        if (!results2.rows || !results2.rows.length) {
          res.status(400).send('error23')
          return false
        }
        if (results2.rows.length > 1) {
          res.status(400).send('error24')
          return false
        }

        const que3 = `SELECT * FROM "cv_exps" WHERE cv_id = $1`
        
        pool.query(que3, params2, (error3, results3) => {
          if (error3) {
            res.status(400).send('error33', error3)
            return false
          }

          const que4 = `SELECT * FROM "cv_edus" WHERE cv_id = $1`
          
          pool.query(que4, params2, (error4, results4) => {
            if (error4) {
              res.status(400).send('error44')
              return false
            }

            if (results3.rows && results3.rows.length) {
              results3.rows.forEach(row => {
                delete row.cv_id
              })
            }

            if (results4.rows && results4.rows.length) {
              results4.rows.forEach(row => {
                delete row.cv_id
              })
            }
            results2.rows[0].cvExt = {
              exps: results3.rows,
              edus: results4.rows
            }

            res.send(results2.rows[0])

          })

        })

      })

    })

  } else res.send('Step 1. Auth fail')
}

async function cvPhotoDelete (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, logo_url, role FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send({success: false, msg: 'step2 err'})
        console.log('updateOneCvPic Error: ', error)
        return false
      }
      if (results.rows.length != 1 || results.rows[0].role != 'subscriber') {
        res.send({success: false, msg: 'step3 err'})
        return false
      }

      let uid = results.rows[0].user_id
      let logo_url = results.rows[0].logo_url

      let queDel = 'UPDATE users SET logo_url = $1 WHERE user_id = $2'
      let paramsDel = [null, uid]
      pool.query(queDel, paramsDel, (error2, results2) => {
        if (error2) {
          console.log('update cv photo, err2: ', error2)
          res.send({success: false, error: error2})
          return false
        }

        let ext = logo_url.split('?')[0]
        let dir = './www/uploads/cvpics'

        fs.unlink(dir + '/' + uid + ext,  err => 0)

        res.send({success: true})
      })
    })
  } else res.send({success: false, msg: 'auth error'})
}

async function updateOneCvPic (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, logo_url, role FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send({success: false, msg: 'step2 err'})
        console.log('updateOneCvPic Error: ', error)
        return false
      }
      if (results.rows.length != 1 || results.rows[0].role != 'subscriber') {
        res.send({success: false, msg: 'step3 err'})
        return false
      }

      let uid = results.rows[0].user_id
      let image = req.file
      if (image.size < 409601) {
        let ext = null
        let path_part1 = 'uploads/cvpics/' + uid
        let dir = './www/uploads/cvpics'

        fs.unlink(dir + '/' + uid + '.png',  err => 0)
        fs.unlink(dir + '/' + uid + '.jpg',  err => 1)
        fs.unlink(dir + '/' + uid + '.gif',  err => 2)
        fs.unlink(dir + '/' + uid + '.webp', err => 3)

        if (image.mimetype == 'image/png') ext = '.png'
        else if (image.mimetype == 'image/jpeg') ext = '.jpg'
        else if (image.mimetype == 'image/gif') ext = '.gif'
        else if (image.mimetype == 'image/webp') ext = '.webp'

        if (ext !== null) {
          // let photo_url = path_part1 + ext + '?rand=' + Date.now()
          let photo_url = ext + '?rand=' + Date.now()
          let fname = dir + '/' + uid + ext
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }
          fs.writeFile(fname, image.buffer, "binary", function(err) {
            if(err) {
              console.log(err);
            }
          })
          let que2nd = `
            UPDATE "users"
            SET "logo_url" = $1
            WHERE user_id = $2
          `
          let params2nd = [photo_url, uid]

          pool.query(que2nd, params2nd, (error2, results2) => {
            if (error2) {
              console.log('update cv photo, err2: ', error2)
              res.send({success: false, msg: 'step4 err'})
              return false
            }
            res.send({success: true, link: photo_url})
          })

        } else {
          res.send({success: false, msg: 'file ext error'})
          return false
        }
      } else {
        res.send({success: false, msg: 'file size error'})
        return false
      }
    })

  } else res.send({success: false, msg: 'auth error'})
}

async function cvDelete(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    const que1st = `SELECT user_id, email, cv_id FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    const params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('Step 2. Auth error')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('step3-2: ' + results.rows.length)
        return false
      }
      const uid = results.rows[0].user_id
      const cv_id = results.rows[0].cv_id
      const userEmail = results.rows[0].email
      if (!cv_id) {
        res.send('step4: cv already deleted')
        return false
      }
      console.log('DELETION! CP1')
      const que21 = 'UPDATE "users" SET cv_id = $1, logo_url = $3 WHERE user_id = $2'
      const que22 = `DELETE FROM "cvs" WHERE id = $1;`
      // there is cascade deletion for cv_exps and cv_edus
      const params21 = [null, uid, null]
      const params22 = [cv_id]
      pool.query(que21, params21, (error21, results21) => {
        addLog('Удаление резюме ч1.', 'Айди резюме: ' + cv_id, uid, userEmail)
        pool.query(que22, params22, (error22, results22) => {
          if (error22) {
            res.send('Step 6. ' + error22)
            return false
          }
          if (error21) {
            res.send('Step 5. ' + error21)
            return false
          }
          res.send('OK')
          addLog('Резюме удалено', 'Айди резюме: ' + cv_id, uid, userEmail)
        })
      })

    })
  } else { res.send('Step 1. Auth fail') }

}

async function cvCreateUpdate (req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    const que1st = `SELECT user_id, email, cv_id FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    const params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('Step 2. Auth error')
        return false
      }
      if (!results.rows) {
        res.send('step3-1')
        return false
      } else if (results.rows.length != 1) {
        res.send('step3-2: ' + results.rows.length)
        return false
      }
      const uid = results.rows[0].user_id
      let cv_id = results.rows[0].cv_id
      const userEmail = results.rows[0].email

      const parsedData = validateCV(req.body)
      if (!parsedData) {
        res.send('error, not passing validation')
        return false
      }
      if (parsedData.error) {
        res.send('Validation error: ' + parsedData.error)
        return false
      }
      // parsedData.user_id = uid
      parsedData.updated_at = new Date()
      let que2
      const columns = Object.keys(parsedData)
      const params2nd = Object.values(parsedData)

      const parsedExts = validateCVExts(req.body.cvExt)
      columns.push('total_exp')
      params2nd.push(parsedExts.totalExp || 0)

      if (cv_id) {
        //cv found, update
        const columnsToRefs = columns.map((column, cidx) => column + '=$' + (cidx + 1))
        que2 = `UPDATE "cvs" SET ${columnsToRefs.join(',')} WHERE id=${cv_id}`
      } else {
        //no cv - create new
        const refs = Object.keys(columns).map(k => '$' + (Number(k)+1)).join(',')
        que2 = `INSERT INTO "cvs" (${columns.join(',')}) VALUES (${refs}) RETURNING id`
        console.log('CREATING')
      }

      pool.query(que2, params2nd, (error2, results2) => {
        if (error2) {
          res.send('step4-1, error in db: ' + error2)
          return false
        }
        

        if (!cv_id) {
          //cv_id is still null on the user
          if (results2.rows && results2.rows[0] && results2.rows[0].id) {
            
            const que3 = `UPDATE "users" SET cv_id = $1 WHERE user_id = $2`
            cv_id = results2.rows[0].id
            

            pool.query(que3, [cv_id, uid], (error3, results3) => {
              if (error3) {
                console.log('Trouble saving cv_id on user')
              }
            })
            res.send({ result: 'OK', cv_id })
          } else {
            res.send('step5. Error saving to the user')
          }
        } else {
          res.send({ result: 'OK' })
        }

        // const parsedExts = validateCVExts(req.body.cvExt)
        
        if (parsedExts.error) {
          console.log('error parsing cvExts', parsedExts.error)
        }
        if (parsedExts && !parsedExts.error) {
          // exps
          // delete first
          const queExpsDelete = `DELETE FROM cv_exps WHERE cv_id = $1`
          const queExpsParams = [cv_id]
          pool.query(queExpsDelete, queExpsParams, (error4, results4) => {
            if (error4) {
              console.log('Trouble removing old cv_exps', error4)
            }
            if (parsedExts.exps && parsedExts.exps.length) {
              let vals = ''
              parsedExts.exps.forEach((exp, eidx) => {
                let local = ''
                for (let index = 1; index < 7; index++) {
                  local += '$' + ((eidx * 6) + index) + ','
                }
                vals += `(${local.slice(0, -1)}),`
              })
              
              const queExps = `INSERT INTO cv_exps ("cv_id", "place", "position", "start", "end", "desc") VALUES ${vals.slice(0, -1)};`
              const paramsExps = parsedExts.exps.reduce((acc, exp) => acc.concat([
                Number(cv_id),
                exp.place,
                exp.position,
                exp.start,
                exp.end,
                exp.desc
              ]), [])
              
              pool.query(queExps, paramsExps, (error5, results5) => {
                if (error5) {
                  console.log('Trouble saving cv_exps', error5)
                }
              })
            }
          })

          // edus
          const queEdusDelete = `DELETE FROM cv_edus WHERE cv_id = $1`
          const queEdusParams = [cv_id]
          pool.query(queEdusDelete, queEdusParams, (error4, results4) => {
            if (error4) {
              console.log('Trouble removing old cv_edus', error4)
            }
            if (parsedExts.edus && parsedExts.edus.length) {
              let vals = ''
              parsedExts.edus.forEach((edu, eidx) => {
                let local = ''
                for (let index = 1; index < 7; index++) {
                  local += '$' + ((eidx * 6) + index) + ','
                }
                vals += `(${local.slice(0, -1)}),`
              })
              
              const queEdus = `INSERT INTO cv_edus ("cv_id", "general", "place", "fac", "spec", "year") VALUES ${vals.slice(0, -1)};`
              const paramsEdus = parsedExts.edus.reduce((acc, edu) => acc.concat([
                Number(cv_id),
                edu.general,
                edu.place,
                edu.fac,
                edu.spec,
                edu.year
              ]), [])
              
              pool.query(queEdus, paramsEdus, (error5, results5) => {
                if (error5) {
                  console.log('Trouble saving cv_edus', error5)
                }
              })
            }
          })
        }
        
        addLog(
          cv_id ? 'Резюме изменено' : 'Резюме создано',
          parsedData.name + ((parsedExts && parsedExts.exps && parsedExts.edus) ? '. Опыт: ' + parsedExts.exps.length + ', Образование: ' + parsedExts.edus.length : ''),
          uid,
          userEmail
        )
      })
      

    })
    //also just edit ur own one if exists, so you need to check if it exists every time

  } else {res.send('Step 1. Auth fail')}
}

function validateCVExts (data) {
  try {
    let parsedExts = {
      exps: [],
      edus: []
    }
    if (data.exps && Array.isArray(data.exps) && data.exps.length) {
      data.exps.slice(0, 5).forEach(exp => {

        if (exp.range && !exp.range.from) {
          exp.range = {
            from: exp.range
          }
        }
        if (exp.place &&
          exp.place.length < 76 && 
          (!exp.position || exp.position.length < 76) &&
          (!exp.range || (!exp.range.from || (exp.range.from && exp.range.from.length < 30)) || (!exp.range.to || (exp.range.to && exp.range.to.length < 30))) &&
          (!exp.desc || exp.desc.length < 801)
        ) {
          
          exp.start = new Date(exp.range.from)
          if (exp.range.to) {
            exp.end = new Date(exp.range.to)
          } else {
            exp.end = null
          }
          parsedExts.exps.push(exp)
        }
      })
      
      parsedExts.totalExp = Math.round(parsedExts.exps.slice(0, 5)
        .reduce((acc, cur) => acc + ((
            cur.end || new Date()
          ) - cur.start), 0) / 1000 / 60 / 60 / 24 / 30 / 12 * 10
      ) / 10
    }

    if (data.edus && Array.isArray(data.edus) && data.edus.length) {
      data.edus.slice(0, 5).forEach(edu => {
        if (edu.general && edu.general.length < 76 &&
          (!edu.place || edu.place.length < 76) &&
          (!edu.fac || edu.fac.length < 76) &&
          (!edu.spec || edu.spec.length < 76) &&
          (!edu.year || edu.year.length < 20)
        ) {
          parsedExts.edus.push(edu)
        }
      })
    }
    return parsedExts
  } catch (error) {
    return { error: 'validation failed: some field had an unpredicted error' + error }
  }
}

function validateCV (data) {
  try {
    
    let parsedData = {}
    // .photo = .photo
    //TODO: deal with the photo later
    if (data.photo) {
      parsedData.photo = data.photo
    }
    // name
    if (!data.name) {
      parsedData.error = 'name is required'
    } else if (data.name.length < 2) {
      parsedData.error = 'name: min length is 2 characters'
    } else if (data.name.length > 75) {
      parsedData.error = 'name: max length is 75 characters'
    } else {
      parsedData.name = data.name
    }
    
    // surname
    if (!data.surname) {
      parsedData.error = 'surname is required'
    } else if (data.surname.length < 2) {
      parsedData.error = 'surname: min length is 2 characters'
    } else if (data.surname.length > 75) {
      parsedData.error = 'surname: max length is 75 characters'
    } else {
      parsedData.surname = data.surname
    }

    // tel
    if (!data.tel) {
      parsedData.error = 'tel is required'
    } else if (data.tel.length < 6) {
      parsedData.error = 'tel: min length is 6 characters'
    } else if (data.tel.length > 20) {
      parsedData.error = 'tel: max length is 20 characters'
    } else {
      parsedData.tel = data.tel
    }

    // tel_home
    if (data.tel_home) {
      if (data.tel_home.length < 6) {
        parsedData.error = 'tel_home: min length is 6 characters'
      } else if (data.tel_home.length > 20) {
        parsedData.error = 'tel_home: max length is 20 characters'
      } else {
        parsedData.tel_home = data.tel_home
      }
    }

    // email
    if (data.email) {
      if (data.email.length < 3 ||
        !/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(data.email)
      ) {
        parsedData.error = 'email: wrong format'
      } else {
        parsedData.email = data.email
      }
    }

    //city_current
    if (data.city_current) {
      if (data.city_current.length < 2) {
        parsedData.error = 'city_current: min length is 2 characters'
      } else if (data.city_current.length > 70) {
        parsedData.error = 'city_current: max length is 70 characters'
      } else {
        parsedData.city_current = data.city_current
      }
    }

    //city_based
    if (data.city_based) {
      if (data.city_based.length < 2) {
        parsedData.error = 'city_based: min length is 2 characters'
      } else if (data.city_based.length > 70) {
        parsedData.error = 'city_based: max length is 70 characters'
      } else {
        parsedData.city_based = data.city_based
      }
    }
    
    // driver
    if (data.driver) {
      let driver = ''
      driver += data.driver.a ? 1 : 0
      driver += data.driver.b ? 1 : 0
      driver += data.driver.c ? 1 : 0
      driver += data.driver.d ? 1 : 0
      parsedData.driver = driver
    }

    // car
    if ([true, false, null].includes(data.car)) {
      parsedData.car = data.car
    }
    
    //birth
    if (data.birth) {
      let d = new Date(data.birth)
      if (!(d instanceof Date && !isNaN(d))) {
        parsedData.error = 'birth: invalid date'
      } else {
        parsedData.birth = d
      }
    } else {
      parsedData.birth = null
    }
    
    // sex
    if (data.sex) {
      if (!['f', 'm'].includes(data.sex)) {
        parsedData.error = 'sex: wrong gender'
      } else {
        parsedData.sex = data.sex
      }
    }
    
    // family
    if ([true, false, null].includes(data.family)) {
      parsedData.family = data.family
    }

    // exp
    if ([true, false, null].includes(data.exp)) {
      parsedData.exp = data.exp
    }

    //edu
    if (parsedData.exp) {
      parsedData.edu = null
    } else if (data.edu) {
      if (data.edu.length > 30) {
        parsedData.error = 'edu: max length is 30 characters'
      } else {
        parsedData.edu = data.edu
      }
    }

    //langs
    if (data.langs && Array.isArray(data.langs)) {
      let langsFiltered = data.langs.filter(lang => lang.length < 51)
      parsedData.langs = langsFiltered.map(l => String(l).toLowerCase())
    } else {
      parsedData.langs = data.langs
    }

    //skills
    if (data.skills) {
      if (data.skills.length > 500) {
        parsedData.error = 'skills: max length is 500 characters'
      } else {
        parsedData.skills = data.skills
      }
    }

    // wanted_job
    if (!data.wanted_job) {
      parsedData.error = 'wanted_job is required'
    } else if (data.wanted_job.length < 2) {
      parsedData.error = 'wanted_job: min length is 2 characters'
    } else if (data.wanted_job.length > 75) {
      parsedData.error = 'wanted_job: max length is 75 characters'
    } else {
      parsedData.wanted_job = data.wanted_job
    }

    //salary_min
    if (data.salary_min &&
        isNaN(data.salary_min) === false &&
        data.salary_min > -1 &&
        Number.isInteger(Number(data.salary_min))
    ) {
      if (String(data.salary_min).length > 5) data.salary_min = String(data.salary_min).substring(0,5)
      parsedData.salary_min = Number(data.salary_min)
    } else parsedData.salary_min = null

    //salary_max
    if (data.salary_max &&
        isNaN(data.salary_max) === false &&
        data.salary_max > -1 &&
        Number.isInteger(Number(data.salary_max))
    ) {
      if (String(data.salary_max).length > 5) data.salary_max = String(data.salary_max).substring(0,5)
      parsedData.salary_max = Number(data.salary_max)
    } else parsedData.salary_max = null

    //salary order check
    if (parsedData.salary_min && parsedData.salary_max < parsedData.salary_min) {
      const tmp = parsedData.salary_max
      parsedData.salary_max = parsedData.salary_min
      parsedData.salary_min = tmp
    }

    return parsedData
  } catch (error) {
    return { error: 'validation failed: some field had an unpredicted error' + error }
  }
}

async function updateOneCompany(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    //console.log(req.body)
    let que1st = `SELECT user_id, company, logo_url, role FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send('step2')
        console.log('updateOneCompany Error: ', error)
        return false
      }
      if (results.rows.length != 1 || results.rows[0].role != 'company') {
        res.send('step3')
        return false
      }

      let uid = results.rows[0].user_id

      let parsedData = {}
      //VALIDATE SHIET HERE!
      if (req.body.company && req.body.company.length < 80 && titleRegex.test(req.body.company)) {
        parsedData.company = req.body.company
      } else parsedData.company = results.rows[0].company
      if (req.body.logo_url && req.body.logo_url.length < 86) {
        parsedData.logo_url = req.body.logo_url
      } else parsedData.logo_url = results.rows[0].logo_url
      //console.log('cp100: ', req.body.logo_url)
      if (req.body.domains) {
        parsedData.domains = req.body.domains.slice(0, 3)
      } else parsedData.domains = '{}'
      if (req.body.website) {
        parsedData.website = req.body.website
      } else parsedData.website = ''
      if (req.body.full_description && req.body.full_description.length < 2001) {
        parsedData.full_description = req.body.full_description
      } else parsedData.full_description = ''

      let que2nd = `UPDATE "users" SET ("company", "logo_url", "domains", "website", "full_description") =
                    ($1, $2, $3, $4, $5)
                    WHERE user_id = $6`
      let params2nd = [parsedData.company, parsedData.logo_url, parsedData.domains, parsedData.website, parsedData.full_description, uid]

      pool.query(que2nd, params2nd, (error2, results2) => {
        if (error2) {
          console.log('updateOneCompany, err2: ', error2)
          res.send('error')
          return false
        }
        res.send('OK')
      })


    })
  } else res.send('auth error')

}

async function updateOneCompanyPicX(req, res) {
  //node version, receives pic file,
  //!should delete old file by url from db, or do the replacement
  //!in a way by storing by user name perhaps
  //!url should not be set from outside
  //check if file by url is in the proper dir
  //need to think through how to make images not be lost between deployments
  
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    
    let que1st = `SELECT user_id, logo_url, role FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]
    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send({success: false, msg: 'step2 err'})
        console.log('updateOneCompanyPic Error: ', error)
        return false
      }
      if (results.rows.length != 1 || results.rows[0].role != 'company') {
        res.send({success: false, msg: 'step3 err'})
        return false
      }

      let uid = results.rows[0].user_id
      let image = req.file
      if (image.size < 409601) {
        // console.log('cpx', image)
        //delete old file ! done!
        let ext = null
        let path_part1 = 'uploads/' + uid
        fs.unlink(path_part1 + '.png', (err) => {})
        fs.unlink(path_part1 + '.jpg', (err) => {})
        fs.unlink(path_part1 + '.gif', (err) => {})
        fs.unlink(path_part1 + '.webp', (err) => {})
        console.log(image.mimetype)
        if (image.mimetype == 'image/png') ext = '.png'
        else if (image.mimetype == 'image/jpeg') ext = '.jpg'
        else if (image.mimetype == 'image/gif') ext = '.gif'
        else if (image.mimetype == 'image/webp') ext = '.webp'
        if (ext !== null) {
          
          let logo_url = path_part1 + ext  + '?rand=' + Date.now()
          let dir = './www/uploads'
          let fname = dir + '/' + uid + ext
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }
          fs.writeFile(fname, image.buffer, "binary", function(err) {
            if(err) {
              console.log(err);
            }
          })

          let que2nd = `
            UPDATE "users"
            SET "logo_url" = $1
            WHERE user_id = $2
          `
          let params2nd = [logo_url, uid]

          pool.query(que2nd, params2nd, (error2, results2) => {
            if (error2) {
              console.log('updateOneCompanyPic, err2: ', error2)
              res.send({success: false, msg: 'step4 err'})
              return false
            }
            res.send({success: true, link: logo_url})
          })
        } else {
          res.send({success: false, msg: 'file ext error'})
          return false
        }
      } else {
        res.send({success: false, msg: 'file size error'})
        return false
      }
      //send back link or error
      //check file size
      //save logo url
      //for new users make new url pointing to placeholder
      
      
    })
  } else res.send({success: false, msg: 'auth error'})

}
// async function updateOneCompanyPic(req, res) {
//   if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
//     let que1st = `SELECT user_id, logo_url, role FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'company'`
//     let params1st = [req.signedCookies.session, req.signedCookies.mail]
//     pool.query(que1st, params1st, (error, results) => {
//       if (error) {
//         res.send('step2')
//         console.log('updateOneCompanyPic Error: ', error)
//         return false
//       }
//       if (results.rows.length != 1 || results.rows[0].role != 'company') {
//         res.send('step3')
//         return false
//       }

//       let uid = results.rows[0].user_id
      
//       let logo_url = ''
//       //VALIDATE SHIET HERE!
//       if (req.body.logo_url && req.body.logo_url.length < 86) {
//         logo_url = req.body.logo_url
//       } else logo_url = results.rows[0].logo_url

//       let que2nd = `
//         UPDATE "users"
//         SET "logo_url" = $1
//         WHERE user_id = $2
//       `
//       let params2nd = [logo_url, uid]

//       pool.query(que2nd, params2nd, (error2, results2) => {
//         if (error2) {
//           console.log('updateOneCompanyPic, err2: ', error2)
//           res.send('error')
//           return false
//         }
//         res.send('OK')
//       })


//     })
//   } else res.send('auth error')
// }

async function getOwnCompanyJSON(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que = `
      SELECT company, logo_url, domains, website, full_description
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'company'
    `
    let result = await pool.query(que, [req.signedCookies.session, req.signedCookies.mail]).catch(error => {
      console.log('cp getOwnCompanyJSON err: ', error)
      return false
    })
    if (result.rows && result.rows.length == 1) company = result.rows[0]
    else {
      res.send('error1, wrong user data 1')
      return false
    }
    res.send(company)
  } else res.send('error0, wrong user data 0')
}

async function hitjobcv(req, res) {
  const jid = parseInt(req.query.jid)
  //проверить жоб айди формально
  if (isNaN(jid) || jid < 0 || String(jid).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  // if (!req.body.cvurl || req.body.cvurl.length > 85) {
  //   //и еще надо проверить cv url  - что начинается с webhost000
  //   res.send('Error: CV not loaded')
  //   return false
  // }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que = `
      SELECT user_id
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'
    `
    let result = await pool.query(que, [req.signedCookies.session, req.signedCookies.mail]).catch(error => {
      console.log('cp hitjobcv err: ', error)
      return false
    })
    if (result && result.rows && result.rows.length == 1) {
      let uid = result.rows[0].user_id

      //ПРОВЕРКА - существует ли такая cvhit уже - по job_id, user_id
      let precheck_que = `
        SELECT cvhit_id
        FROM cvhits WHERE
        cvjob_id = $1 AND cvuser_id = $2
      `
      let precheck_params = [jid, uid]
      let precheck_result = await pool.query(precheck_que, precheck_params).catch(error => {
        console.log('cp hitjobcv1.5 err: ', error)
      })
      if (precheck_result.rows.length != 0) {
        res.send('Уже подано')
        return false
      }

      let que2 = `INSERT INTO "cvhits" ("cvjob_id", "cvuser_id", "cv_url") VALUES ($1, $2, $3) RETURNING *`
      let params2 = [jid, uid, req.body.cvurl]
      let result2 = await pool.query(que2, params2).catch(error => {
        console.log('cp hitjobcv2 err: ', error)
      })
      if (result2 && result2.rows.length == 1) {
        console.log(result2.rows[0])
        res.send(result2.rows[0])
      }
      else res.send('Ошбика в бд')
    } else {
      res.send('Ошибка 1')
      return false
    }
    
    
  } else res.send('Ошибка авторизации')
}


async function verifCheck(n) {
  let que = `
    DELETE FROM "verifications"
    WHERE url = $1
    RETURNING uid
  `
  let result = await pool.query(que, [n]).catch(error => {
    console.log(error)
    throw new Error('veri check err1')
  })
  if (result && result.rowCount === 1) {
    let uid = result.rows[0].uid
    console.log('cp67gg1: ', uid)
    let que2 = `
      UPDATE "users" SET (is_active, email_confirmed, block_reason) = (TRUE, TRUE, '')
      WHERE user_id = $1
    `
    let params2 = [uid]
    let result2 = await pool.query(que2, params2).catch(error => {
      console.log(error)
      throw new Error('veri check err2')
    })
    return result.rowCount
  } return -1
}
async function verify(req, res) {
  //check if in the base
  
  //get the param
  //check if is a number
  let reg = /^\d+$/
  let n1 = req.query.n
  console.log('got client: ' + n1)
  if (reg.test(n1) == false || String(n1).length > 25) {
    console.log('Error: wrong num')
    res.status(400).send('WRONG VERIFICATION LINK')
    return false
  }
  // console.log('cp1: ', n1)
  //after that check if its in db, check by deletion
  let veri = await verifCheck(n1).catch(error => {
    return -2
  })
  
  if (veri === 1) {
    console.log('copcpo sending reload!', veri)
    let baseUrl = process.env.SITE_URL || 'http://127.0.0.1:8080'
    //res.send('Email пользователя верифицирован. Теперь вы можете <a href="' + baseUrl + '/registration?login=1">Войти</a>')
    res.send('<html><body><script>window.location.replace("' + baseUrl + '/registration?login=1&verified=1")</script></body></html>')
  } else res.send('Ошибка в адресе верификации')
}


async function cvurldelete(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que = `
      UPDATE "users" SET "cvurl" = ''
      WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'
    `
    let params = [req.signedCookies.session, req.signedCookies.mail]
    let result = await pool.query(que, params).catch(error => {
      console.log('cp cvurldelete err: ', error)
      return undefined
    })
    if (result) {
      res.send('OK')
      return true
    } else {
      res.send('User non existent')
      return false
    }

  } else res.send('err2')
}

async function cvurlupdate(req, res) {
  if (req.body && req.body.cvurl && req.body.cvurl.length > 4 && req.body.cvurl.length < 86) {
    if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      //console.log(req.body)
      let que = `
        UPDATE "users" SET "cvurl" = $1
        WHERE auth_cookie = $2 AND email = $3 AND role = 'subscriber'
      `
      let params = [req.body.cvurl, req.signedCookies.session, req.signedCookies.mail]
      let result = await pool.query(que, params).catch(error => {
        console.log('cp cvurlupdate err: ', error)
        return undefined
      })
      if (result) {
        res.send('OK')
        return true
      } else {
        res.send('User non existent')
        return false
      }
    } else res.send('err2')
  } else res.send('err1')
}

async function cvUpdateX(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que1st = `SELECT user_id, cvurl FROM "users" WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'`
    let params1st = [req.signedCookies.session, req.signedCookies.mail]

    pool.query(que1st, params1st, (error, results) => {
      if (error) {
        res.send({success: false, msg: 'step2 err'})
        console.log('cvUpdateX Error: ', error)
        return false
      }
      if (results.rows.length != 1) {
        res.send({success: false, msg: 'step3 err'})
        return false
      }

      let uid = results.rows[0].user_id
      let cv = req.file
      // console.log('cp315', cv)
      if (cv.size < 409601) {
        let ext = cv.originalname.split('.').pop()
        
        let path_part1 = req.headers.host + '/uploads/cvs/' + uid
        fs.unlink(path_part1 + '.doc', (err) => {})
        fs.unlink(path_part1 + '.docx', (err) => {})
        fs.unlink(path_part1 + '.pdf', (err) => {})
        fs.unlink(path_part1 + '.rtf', (err) => {})
        // console.log('cp-mime', cv.mimetype)
        if (['doc', 'docx', 'pdf', 'rtf'].includes(ext.toLowerCase())) {
          ext = '.' + ext
          
          let cv_url = path_part1 + ext  + '?rand=' + Date.now()
          
          let dir = './www/uploads/cvs'
          let fname = dir + '/' + uid + ext
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true })
          }
          fs.writeFile(fname, cv.buffer, "binary", function(err) {
            if(err) {
              console.log(err);
            }
          })

          let que2nd = `
            UPDATE "users"
            SET cvurl = $1
            WHERE user_id = $2
          `
          let params2nd = [cv_url, uid]
          pool.query(que2nd, params2nd, (error2, results2) => {
            if (error2) {
              console.log('cvUpdateX, err2: ', error2)
              res.send({success: false, msg: 'step4 err'})
              return false
            }
            res.send({success: true, link: cv_url})
          })

        } else {
          res.send({success: false, msg: 'file ext error'})
          return false
        }
      } else {
        res.send({success: false, msg: 'file size error'})
        return false
      }

    })

  } else res.send({success: false, msg: 'auth error'})
}
//make delete too!!!


async function getCVHitsHistory(req, res) {
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let que = `
      SELECT user_id
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'
    `
    let result = await pool.query(que, [req.signedCookies.session, req.signedCookies.mail]).catch(error => {
      console.log('cp getResps err1: ', error)
    })
    if (result.rows.length == 1) {
      let que2 = `
        SELECT cvhits.*, jobs.title, jobs.is_closed, users.company
        FROM cvhits, jobs, users
        WHERE jobs.author_id = users.user_id AND cvhits.cvjob_id = jobs.job_id AND cvhits.cvuser_id = $1
        ORDER BY (cvhits.date_created) DESC
      `
      let params2 = [result.rows[0].user_id]
      let history = await pool.query(que2, params2).catch(error => {
        console.log('cp getResps err2: ', error)
      })
      if (history.rows && history.rows.length > 0) {
        res.send({rows: history.rows})
      } else res.send({rows: []})

    } else res.send('error 2')
  } else res.send('error 1')
}

const getJobs = (req, res) => {
  console.log(req.query)
  let perpage = '25'
  if (req.query.perpage === '10') perpage = '10'
  else if (req.query.perpage === '50') perpage = '50'
  else if (req.query.perpage === '100') perpage = '100'
  // console.log('cpGetJobs, txt: ', req.query)
  let txt
  if (req.query.txt != undefined && 
      req.query.txt.length > 0 && 
      titleRegex.test(req.query.txt)) {
    txt = '%' + req.query.txt.toLowerCase() + '%'
  }
  
  let sort = 'ORDER BY (jobs.time_updated, jobs.job_id) DESC'
  if (req.query.sort === 'salasc') sort = 'ORDER BY (jobs.salary_max::int, jobs.job_id) ASC'
  else if (req.query.sort === 'saldesc') sort = 'ORDER BY (jobs.salary_max::int, jobs.job_id) DESC'
  //console.log('cp_getJobs1: ', perpage)
  let timerange = ` AND jobs.time_updated > now() - interval '1 month'`
  let page = 1
  if (req.query.page && Number(req.query.page) > 0 && Number(req.query.page) < 11) page = req.query.page
  let offset = (page - 1) * Number(perpage)
  //console.log('cpoffset ', offset, 'CPPAGE ', page)
  if (req.query.timerange === 'wee') timerange = ` AND jobs.time_updated > now() - interval '1 week'`
  else if (req.query.timerange === 'day') timerange = ` AND jobs.time_updated > now() - interval '1 day'`

  let city
  if (req.query.city != undefined && 
      req.query.city.length > 0 && 
      /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\\-]*$/.test(req.query.city)) {
    city = '%' + req.query.city.toLowerCase() + '%'
  }
  let cityN
  if (city != undefined) {
    if (txt != undefined) cityN = 3
    else cityN = 2
  }

  let jcat
  if (req.query.jcat && String(req.query.jcat).length < 3 && !isNaN(req.query.jcat)) jcat = req.query.jcat
  
  let exp_line
  if (req.query.exp == '0') exp_line = ` AND jobs.experience = 0`
  else if (req.query.exp == '1-3') exp_line = ` AND jobs.experience BETWEEN 1 AND 3`
  else if (req.query.exp == '3-5') exp_line = ` AND jobs.experience BETWEEN 3 AND 5`
  else if (req.query.exp == '5') exp_line = ` AND jobs.experience > 5`
  else exp_line = ''
  // console.log('exp_line: ', exp_line)
  let sal_line
  if (req.query.sal == '0-1') sal_line = ` AND ((jobs.salary_min BETWEEN 1 AND 1000) OR jobs.salary_max <= 1000)`
  else if (req.query.sal == '1-3') sal_line = ` AND (jobs.salary_min BETWEEN 1000 AND 3000 OR jobs.salary_max BETWEEN 1000 AND 3000)`
  else if (req.query.sal == '3') sal_line = ` AND (jobs.salary_max >= 3000)`
  else sal_line = ''
  // console.log('sal_line: ', sal_line)

  let curr_line
  if (req.query.cur == '$') curr_line = ` AND jobs.currency = '$'`
  else if (req.query.cur == 'm') curr_line = ` AND jobs.currency = 'm'`
  else curr_line = ''
  // console.log('curr_line: ', curr_line)

  let que =  `SELECT jobs.author_id, users.company as author, jobs.job_id, jobs.city, jobs.experience, jobs.title, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.description, jobs.time_updated as updated, jobs.contact_mail, contact_tel
              FROM jobs
              INNER JOIN users
              ON jobs.author_id = users.user_id AND
                jobs.is_published = TRUE AND
                jobs.is_closed = FALSE
                ${timerange} 
                ${txt != undefined ? ` AND
                (LOWER(jobs.title) LIKE $2 OR
                LOWER(users.company) LIKE $2 OR
                LOWER(jobs.description) LIKE $2 OR
                LOWER(jobs.city) LIKE $2)` : ''}
                ${city != undefined ? ` AND 
                LOWER(jobs.city) LIKE $${cityN}`: ''}
                ${jcat != undefined ? ` AND jobs.jcategory = ${jcat}`: ''}
                ${exp_line}
                ${sal_line}
                ${curr_line}
              ${sort}
              LIMIT $1 ${'OFFSET ' + offset}`
  let qparams = [perpage]
  if (txt) qparams.push(txt)
  if (city) qparams.push(city)
  pool.query(que, qparams, (error, results) => {
    if (error) {
      console.log(error)
      return false
    }
    qparams.shift()
    let countque =  `SELECT count(*) AS full_count
                    FROM jobs
                    INNER JOIN users
                    ON jobs.author_id = users.user_id AND
                      jobs.is_published = TRUE AND
                      jobs.is_closed = FALSE
                      ${timerange} 
                      ${txt != undefined ? ` AND
                      (LOWER(jobs.title) LIKE $1 OR
                      LOWER(users.company) LIKE $1 OR
                      LOWER(jobs.description) LIKE $1 OR
                      LOWER(jobs.city) LIKE $1)` : ''}
                      ${city != undefined ? ` AND
                      LOWER(jobs.city) LIKE $${cityN - 1}`: ''}
                      ${jcat != undefined ? ` AND jobs.jcategory = ${jcat}`: ''}
                      ${exp_line}
                      ${sal_line}
                      ${curr_line}`
    
    
    pool.query(countque, qparams, (error2, results2) => {
      if (error2) {
        console.log('errcp33 ', error2)
        return false
      }
      res.status(200).json({...results2.rows[0], 'page': page, 'perpage': perpage, rows: results.rows})
    })
  })
}
async function getSalStats(req, res) {
  let que = `
    SELECT * FROM cached_salary_stats
  `
  let result = await pool.query(que, null).catch(error => {
    console.log(error)
    throw new Error('getSalStats failed')
  })
  if (result && result.rows) res.send(result.rows)
  else res.send('Error 13')
}

async function feedback(req, res) {
  //check 4 fields
  if (req.body.topic.length > 75) {
    res.send('error, topic too long')
    return false
  }
  if (req.body.name.length > 25) {
    res.send('error, name too long')
    return false
  }
  if (
    req.body.mail.length > 70 ||
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(req.body.mail) == false
  ) {
    res.send('error, mail too bad')
    return false
  }
  if (req.body.topic.length > 2000) {
    res.send('error, body too long')
    return false
  }
  //put them in db
  let que = `
    INSERT INTO "feedbacks"
    ("topic", "name", "mail", "desc")
    VALUES
    ($1, $2, $3, $4)
  `
  let params = [req.body.topic, req.body.name, req.body.mail, req.body.body]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp feedback err1: ', error)
  })
  //send back ok or bad
  if (result) res.send('OK')
  else res.send('BAD')
}


async function hitJobById (job_id, ip) {
  let que = `UPDATE jobs SET "hits_log" = array_append("hits_log", $1) WHERE job_id = $2`
  let params = [ip, job_id]
  pool.query(que, params, (error, results1) => {
    if (error) {
      console.log('hitJobById Error: ', error)
    }
    // else console.log('job hit')
  })
}

async function getJobByIdJSON(req, res) {
  console.log('get job by idJSON first func. ip: ', req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0 || String(id).length > 10) {
    console.log('Error: wrong id')
    res.status(400).send('Неправильный id вакансии.')
    return false
  }
  let que = `SELECT * FROM
    (SELECT jobs.author_id, users.company as author, users.logo_url, jobs.job_id, jobs.city, jobs.experience, jobs.jobtype, jobs.title, jobs.edu, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.description, jobs.worktime1, jobs.worktime2, jobs.schedule, jobs.age1, jobs.age2, jobs.langs, jobs.time_published as published, jobs.time_updated as updated, contact_mail, contact_tel, cardinality(jobs.hits_log) as hits_all, jobs.is_closed, jobs.closed_why, jobs.jcategory, jobs.is_published
    FROM jobs, users
    WHERE jobs.author_id = users.user_id AND jobs.job_id = $1) a,
    (select count(distinct hits_log1) as hits_uniq
    from (
        select unnest(hits_log) as hits_log1
        from jobs
      WHERE job_id = $1
    ) as ss) b
  `
  let result = await pool.query(que, [id]).catch(error => {
    console.log(error)
    return false
  })
  if (result.rows && result.rows.length === 1) {
    res.status(200).send(result.rows[0])
    hitJobById(id, req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  } else res.status(400).json('Неправильный id вакансии')
}

async function getCompanyById(req, res) {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0 || String(id).length > 10) {
    console.log('Error: wrong company id')
    res.status(400).send('Неправильный id компании.')
    return false
  }
  let que = `
    SELECT company, logo_url, domains, website, full_description, users.time_created, count(*) as jobs_count
    FROM users JOIN jobs ON (jobs.author_id = users.user_id)
    WHERE users.user_id = $1 AND users.role = 'company'
    GROUP BY users.user_id
  `
  let result = await pool.query(que, [id]).catch(error => {
    console.log('cp getCompanyById err: ', error)
    //throw new Error('job by id error')
    return false
  })
  let company
  if (result.rows && result.rows.length === 1) company = result.rows[0]
  else {
    res.status(400).json('Неправильный id компании. Ошибка 2')
    return false
  }
  
  res.status(200).send(company)
}

async function testMail(n, mail) {
  let baseUrl = process.env.SITE_URL || 'http://127.0.0.1:7777'
  
  let txt = baseUrl + '/verify.json?n=' + n
  console.log('sending mail func1: ' + txt)
  let transporter = nodeMailer.createTransport({
    // service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    //secure: false,
    secure: false,
    // requireTLS: true,
    socketTimeout: 10000,
    logger: true,
    auth: {
        // should be replaced with real sender's account
        user: process.env.GMAIL_FOR_VERIFICATIONS || 'jobsnearby1000@gmail.com',
        pass: process.env.GMAIL_PW || 'g789451bb'
    }
  })
  let mailOptions = {
    // should be replaced with real recipient's account
    to: mail, //'origami1024@gmail.com',
    subject: 'Верификация пользователя на hunarmen.com',
    text: 'Перейдите по ссылке для верификации пользователя: ' + txt
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return 'ERR'
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    return 'OK'
  })
}

//Добавить лог
async function addLog (action, body, author_id, author_mail) {
  //time, action, body, author_id, author_name
  let que = `
    INSERT INTO "logs" (time, action, body, author_id, author_mail) VALUES
    (NOW(), $1, $2, $3, $4)`
  let params = [action, body, author_id, author_mail]
  let result1 = await pool.query(que, params).catch(error => {
    console.log('cp addLog err: ', error)
    return undefined
  })
  return Boolean(result1)
}

async function authedForUserData(session, mail, usertype) {
  let que1st = `SELECT user_id FROM "users" WHERE "auth_cookie" = $1 AND "email" = $2 AND "role" = $3`
  let params1st = [session, mail, usertype]
  //return user_id
  let result1 = await pool.query(que1st, params1st).catch(error => {
    console.log('cp authedForUserData err: ', error)
    return false
  })
  //console.log('cpc p2: ', result1)
  if (result1.rows && result1.rows.length == 1) return result1.rows[0].user_id
  else return false
}
async function updateUserData(user_id, udata) {
  //its prechecked for validity and existence
  let que = `
    UPDATE "users" SET ("name", "surname") =
    ($1, $2)
    WHERE user_id = $3
  `
  console.log(udata)
  let params = [udata.name, udata.surname, user_id]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp updDiapers err: ', error)
    return false
  })
  //res.send('OK')
  return result
}
async function changeuserstuff(req, res) {
  console.log('cp change user stuff: ', req.body)
  let udata = {}
  if (req.body && req.body.username && req.body.username.length < 36 && req.body.username.length > 2) {
    udata.name = req.body.username
  } else {
    res.send('error name')
    return false
  }
  if (req.body.surname && req.body.surname.length < 36 && req.body.surname.length > 2) {
    udata.surname = req.body.surname
  } else {
    res.send('error surname')
    return false
  }
  if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
    let user_id = await authedForUserData(req.signedCookies.session, req.signedCookies.mail,'subscriber').catch(error => {
      res.send('step2')
      return undefined
    })
    if (user_id) {
      let doit = await updateUserData(user_id, udata).catch(error => {
        res.send('step3')
        return undefined
      })
      if (doit) {
        res.send('OK')
      }
    } else {
      res.send('error bad userdata')
      return false
    }
  } else {
    res.send('error auth')
    return false
  }
}
async function getDiapers(sess, mail) {
  let que = `
    SELECT pwhash
    FROM users
    WHERE LOWER(email) = $1 AND auth_cookie = $2
  `
  let result = await pool.query(que, [mail, sess]).catch(error => {
    console.log('cp getDiapers err: ', error)
  })
  if (result.rows && result.rows.length === 1) return result.rows[0]
  else return false
}
async function updateDiaper(newhash, oldhash, sess) {
  let que = `
    UPDATE "users" SET "pwhash" =
    $1
    WHERE auth_cookie = $2 AND pwhash = $3
  `
  let params = [newhash, sess, oldhash]
  let result = await pool.query(que, params).catch(error => {
    console.log('cp updDiapers err: ', error)
    return false
  })
  return result
}
async function changepw(req, res) {
  if (req.body && req.body.oldmail && typeof req.body.oldmail === 'string' && req.body.oldpw && req.body.newpw && typeof req.body.oldpw === 'string' && typeof req.body.newpw === 'string') {

    let mail = req.body.oldmail.toLowerCase()
    let oldpw = req.body.oldpw
    let newpw = req.body.newpw
    if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(oldpw) && SupremeValidator.isValidPW(newpw)) {
      //if cookies present
      if (authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
        //check data in db
        let userData = await getDiapers(req.signedCookies.session, mail).catch(error => {
          res.send('step2')
          return undefined
        })
        if (userData) {
          let authed = bcrypt.compareSync(oldpw, userData.pwhash)
          //console.log('cp219: ', userData, ' and ', authed)
          if (authed) {
            let newhash = bcrypt.hashSync(newpw, bcrypt.genSaltSync(9))
            let updator = await updateDiaper(newhash, userData.pwhash, req.signedCookies.session).catch(error => {
              res.send('step2')
              return undefined
            })
            //console.log('cp134 ', updator)
            if (updator) res.send('OK')
            //else res.send('smthngs')
          } else {res.send('step4')}
        } else {res.send('step5')}
      } else {res.send('step1'); console.log('not valid cookies')}
    } else {res.send('step1'); console.log('not valid mail or pw')}
  } else {res.send('step1'); console.log('not valid stuff: ')}
}

async function registerFinish (id, hash, usertype, arg1, arg2) {
  let insert = ''
  if (usertype === 'company' && (arg2 != true && arg2 != 'true')) arg2 = false
  if (usertype === 'subscriber') insert = `, name = $4, surname = $5`
  else if (usertype === 'company') insert = `, company = $4, isagency = $5, block_reason = 'not_verified'`
  let que = `UPDATE "users" SET pwhash = $1, role = $3${insert} where user_id = $2 RETURNING email`
  //console.log(que, '///', arg2)block_reason == 'not_verified'
  let params = [hash, id, usertype, arg1, arg2]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('user update fail')
  })
  //Добавление логов
  addLog('Регистрация пользователя', usertype === 'company' ? 'Компания ' + arg1 : 'Соискатель ' + arg1 + ' ' + arg2, id, result.rows[0].email)
  return true
}

async function tryInsertMailVerification(hash1, userId, mail) {
  let que = `INSERT INTO "verifications" ("uid", "url", "time_created", "mail") VALUES ($1, $2, NOW(), $3)`
  let params = [userId, hash1, mail]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('veri insertion failed')
  })
  if (result && result.rows) {
    return true
  } return undefined
}

async function tryInsertMailVerificationNoMail(hash1, userId, mail) {
  let que = `
    UPDATE "users" SET (is_active, email_confirmed, block_reason) = (TRUE, TRUE, '') 
    WHERE user_id = $1
    `
  let params = [userId]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    throw new Error('veri insertion failed')
  })
  if (result) {
    return true
  } return undefined
}


async function reg(req, res) {
  console.log('cp register', req.body)
  //first server-side literal validation
  let mail = req.body[0].toLowerCase()
  let pw = req.body[1]
  let usertype = req.body[2]
  let arg1 = req.body[3]
  let arg2 = req.body[4]
  
  //check type
  if (usertype !== 'subscriber' && usertype !== 'company') {
    res.send('step3')
    return -1
  }
  //add /s but not from beginning or end
  let nameregex = /^[\w1234567890а-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-]*$/
  if (arg1.length < 3 ||
     (arg1.length > 60 && usertype === 'subscriber') ||
     (arg1.length > 80 && usertype === 'company') ||
      !nameregex.test(arg1)
    ) {
    res.send('step3')
    return -1
  }
  //check arg2
  if ((arg2.length < 3 && usertype === 'subscriber') ||
      (arg2.length > 60 && usertype === 'subscriber') ||
      (!nameregex.test(arg2) && usertype === 'subscriber') ||
      ((arg2 != true && arg2 != false && arg2 != 'true' && arg2 != 'false') && usertype === 'company')
    ) {
    res.send('step3')
    return -1
  }
  
  console.log('tops validated')
  if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(pw)) {
    //try to insert the email//if fails then error
    let que = `INSERT INTO "users" ("email") VALUES ($1) RETURNING user_id`
    let params = [mail]
    let userId = await pool.query(que, params).catch(error => {
      console.log('cp reg I', error)
      return undefined
    })
    if (userId && userId.rowCount == 1) userId = userId.rows[0].user_id
    else {
      res.send('step2')
      return -1
    }

    if (userId === -1 || userId === undefined) return false
    console.log('step2 passed, email inserted:', userId)
    //if all before is successful, id of new user in emailIn
    //go on
    //hash the pw with pw and salt
    let hash = bcrypt.hashSync(pw, bcrypt.genSaltSync(9))
    //store rest of the new user
    let isDone = await registerFinish(userId, hash, usertype, arg1, arg2).catch(error => {
      console.log('STEP3', error)
      res.send('step3')
      return false
    })
    if (isDone === false) return false
    
    
    let hash1 = String(hashSome()) + userId + parseInt(Math.random()*1000000000, 10)

    //currently sending mail on registration depends on usertype(role)
    let success1
    if (usertype === 'subscriber') {
      success1 = await tryInsertMailVerificationNoMail(hash1, userId, mail).catch(error => {
        res.send('step5')
        return undefined
      })
    } else {
      success1 = await tryInsertMailVerification(hash1, userId, mail).catch(error => {
        res.send('step5')
        return undefined
      })
    }
    if (success1) {
      if (usertype !== 'subscriber') {
        testMail(hash1, mail)
      }
      //testMail(hash1, mail) - turn it back on for sending mails
      res.send('OK')
    } else {res.send('step6'); console.log('failed at creating the verification entry')}
    
  } else {res.send('step1'); console.log('not valid mail or wrong pw')}
  
}


async function out(req, res) {
  //maybe delete stuff in db and write some statistics down
  //for now just reset cookies and send back OK
  // console.log('user logout')
  res.cookie('session', '', cookieConfigNoRemember)
  res.cookie('mail', '', cookieConfigNoRemember)
  res.send('get out then')
}

async function tryInsertAuthToken(id,token) { 
  let que = `UPDATE "users" SET auth_cookie = $1, last_logged_in = NOW() where user_id = $2`
  let params = [token, id]
  let result = await pool.query(que, params).catch(error => {
    console.log(error)
    return false
  })
  //console.log(result)
  return true
}
async function login(req, res) {
  // console.log('cp login: ', req.signedCookies)
  let mail = req.body[0].toLowerCase()
  let pw = req.body[1]
  let rememberme = req.body[2]
  // console.log('cp login rm: ', mail, ',', pw, ',', rememberme)
  if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(pw)) {
    //console.log('user validated')
    //get hash from db checking if mail exists
    let que = `
      SELECT pwhash, user_id, role, name, surname,
      insearch, company, isagency, cvurl, is_active, cv_id, rights, logo_url,
      block_reason FROM "users" WHERE "email" = $1`
    let params = [mail]
    let userData = await pool.query(que, params).catch(error => {
      res.send('step2')
      return undefined
    })
    if (userData.rowCount !== 1) userData = false
    else {
      userData = userData.rows[0]
      userData.identity = mail
    }
    if (userData) {
      //check if blockd
      if (userData.is_active == false) {
        if (userData.block_reason == 'not_verified') {
          res.status(211).send('Email не верифицирован. Вам на почту должно было прийти письмо о верификации')
        } else {
          res.status(209).send('Пользователь заблокирован модератором, причина: ' + userData.block_reason)
        }
        return false
      }
      
      //is the pw right?
      // console.log('derpeprepr')
      // console.log(userData)
      let authed = bcrypt.compareSync(pw, userData.pwhash)
      // console.log('authed cp: ', authed)
      if (authed) {
        //generate and store a cookie
        let jwtoken = SupremeValidator.generateJSONWebToken(mail)
        //send the cookie and send the ok
        //console.log(req.signedCookies)
        let laststage = await tryInsertAuthToken(userData.user_id, jwtoken).catch(error => {
          res.send('step3')
          return undefined
        })
        if (laststage === undefined) return false
        delete userData.pwhash
        delete userData.block_reason
        userData.success = 'OK'
        if (rememberme) {
          // res.cookie('session', jwtoken, {expires: new Date(Date.now() + 590013000)})
          // res.cookie('mail', mail, {expires: new Date(Date.now() + 590013000)})
          res.cookie('session', jwtoken, cookieConfig)
          res.cookie('mail', mail, cookieConfig)
          
        } else {
          res.cookie('session', jwtoken, cookieConfigNoRemember)
          res.cookie('mail', mail, cookieConfigNoRemember)
        }

        //own CVS on login
        if (userData.role == 'subscriber') {
          let que = 'SELECT cvhit_id, cvjob_id, date_created, date_checked FROM cvhits WHERE cvuser_id = $1'
          let result2 = await pool.query(que, [userData.user_id]).catch(error => {
            return 'errorCVHITSLogin'
          })
          if (result2 && result2.rows) {
            userData.ownCVs = result2.rows
          }
    
        }
        res.send(userData)
      } else res.send('step2')

    } else {console.log('user does not exist?', userData); res.send('step2'); return false}

    //res.send('OK')
  } else {res.send('step1')}
  
}


async function getUserAuthByCookies(session, mail) {
  let que = `SELECT email AS identity, user_id, role, 
    name, surname, company, insearch, isagency, cvurl, is_active, cv_id, rights, logo_url
    FROM "users" 
    WHERE ("auth_cookie" = $1 AND "email" = $2)`
  let params = [session, mail]
  let result = await pool.query(que, params).catch(error => {
    // console.log('authcheck failed', error)
    // throw new Error('auth check failed')
    return 'error2'
  })
  if (result.rowCount !== 1) return 'error3'
  if (result.rows[0].is_active == false) return 'notactive'
  else {
    //attach ownCVs
    if (result.rows[0].role == 'subscriber') {
      let que = 'SELECT cvhit_id, cvjob_id, date_created, date_checked FROM cvhits WHERE cvuser_id = $1'
      let result2 = await pool.query(que, [result.rows[0].user_id]).catch(error => {
        return 'errorCVHITS'
      })
      if (result2 && result2.rows) {
        result.rows[0].ownCVs = result2.rows
      }

    }
    return result.rows[0]
  }
}



async function getCompanyDataSSR(uid) {
  let que = `
    SELECT company, logo_url, domains, website, full_description, users.time_created, count(*) as jobs_count
    FROM users JOIN jobs ON (jobs.author_id = users.user_id)
    WHERE users.user_id = $1 AND users.role = 'company'
    GROUP BY users.user_id
  `
  // console.log(uid)
  let result = await pool.query(que, [uid]).catch(error => {
    console.log('cp getCompanyDataSSR err: ', error)
    return false
  })
  let company
  if (result.rows && result.rows.length === 1) company = result.rows[0]
  else return {}
  return(company)
}

async function getJobDataSSR(id, addr) {
  // console.log('get job by id first func. ip: ', req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  let que = `SELECT * FROM
    (SELECT jobs.author_id, users.company as author, users.logo_url, jobs.job_id, jobs.city, jobs.experience, jobs.jobtype, jobs.title, jobs.edu, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.description, jobs.worktime1, jobs.worktime2, jobs.schedule, jobs.age1, jobs.age2, jobs.langs, jobs.time_published as published, jobs.time_updated as updated, contact_mail, contact_tel, cardinality(jobs.hits_log) as hits_all, jobs.is_closed, jobs.closed_why, jobs.jcategory, jobs.is_published
    FROM jobs
    INNER JOIN users
    ON jobs.author_id = users.user_id AND jobs.job_id = $1) a,
    (select count(distinct hits_log1) as hits_uniq
    from (
        select unnest(hits_log) as hits_log1
        from jobs
      WHERE job_id = $1
    ) as ss) b
  `
  let result = await pool.query(que, [id]).catch(error => {
    console.log(error)
    return false
  })
  let job
  if (result.rows && result.rows.length === 1) job = result.rows[0]
  else return {}
  
  hitJobById(id, addr)
  return(job)
}

async function getJobsUserStatsSSR(page_num) {
  //get JOBS and USERSTATS in one
  let page = 1
  if (page_num && Number(page_num) > 0 && Number(page_num) < 15)
    page = page_num
  
  let perpage = '25'

  let offset = (page - 1) * Number(perpage)
  
  let sort = 'ORDER BY (jobs.time_updated, jobs.job_id) DESC'
  let que =  `SELECT jobs.author_id, users.company as author, jobs.job_id, jobs.city, jobs.experience, jobs.title, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.description, jobs.time_updated as updated, jobs.contact_mail, contact_tel FROM jobs, users WHERE jobs.author_id = users.user_id AND jobs.is_published = TRUE AND jobs.is_closed = FALSE AND jobs.time_updated > NOW() - interval '1 month' ${sort} LIMIT $1 OFFSET ${offset}`
  let qparams = [perpage]

  let r1 = await pool.query(que, qparams).catch(error => {
    console.log('getJobsForSSR 1. ', error)
    return 'erra1'
  })

  let countque =  `SELECT count(*) AS full_count
    FROM jobs, users
    WHERE jobs.author_id = users.user_id AND
      jobs.is_published = TRUE AND
      jobs.is_closed = FALSE
      AND jobs.time_updated > now() - interval '1 month'`
  let r2 = await pool.query(countque, null).catch(error => {
    console.log('getJobsForSSR 2. ', error)
    return 'erra2'
  })
  let usque =  `SELECT * FROM cached_salary_stats`
  let r3 = await pool.query(usque, null).catch(error => {
    console.log('getJobsForSSR 3. ', error)
    return 'erra3'
  })
  return {...r2.rows[0], 'page': page, 'perpage': perpage, rows: r1.rows, stats: r3.rows}
  
}


module.exports = {
  getJobs,
  getSalStats,
  getJobByIdJSON,
  getCompanyById,

  login,
  reg,
  out,
  
  setLangCookie,

  verify,

  feedback,

  hitJobById,

  getCVHitsHistory,
  cvurlupdate,
  cvUpdateX,
  cvurldelete,
  changeuserstuff,
  changepw,

  hitjobcv,

  getOwnJobs,
  getOwnCompanyJSON,
  // updateOneCompanyPic,
  updateOneCompanyPicX,
  updateOneCompany,

  addOneJob,
  updateJob,
  addJobs,

  forgotten,
  forgottenx,
  forgottenx2,
  resend,
  resender,

  closeJobById,
  deleteJobById,
  reopenJobById,

  getResps,
  viewHit,

  cvCreateUpdate,
  cvDelete,
  cvFetchForEdit,
  // cvFetchForEditSSR,
  cvGetIndex,
  cvGetDetail,
  updateOneCvPic,
  cvPhotoDelete,

  //SSR
  getJobsUserStatsSSR,
  getJobDataSSR,
  getCompanyDataSSR,

  getUserAuthByCookies,


  //utils
  authPreValidation,
}
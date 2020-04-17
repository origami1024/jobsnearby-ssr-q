const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://postgres:123456@localhost:5433/jobsnearby`
})

const titleRegex = /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\+\$\%\(\)\№\:\#\/]*$/

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

let nodeMailer = require('nodemailer')

function authPreValidation(session, mail) {
  if (
    session && session.length > 50
    &&
    mail && mail.length > 2 && mail.length < 51 //50 is max mail length in db now
  ) return true
  else return false
}

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
  console.log('copcpo', veri)
  if (veri === 1) {
    let baseUrl = process.env.NODE_ENV ? 'https://jobsnearby.herokuapp.com' : 'http://127.0.0.1:8080'
    //res.send('Email пользователя верифицирован. Теперь вы можете <a href="' + baseUrl + '/registration?login=1">Войти</a>')
    res.send('<html><body><script>window.location.replace("' + baseUrl + '/registration?login=1&verified=1")</script></body></html>')
  } else res.send('Ошибка в адресе верификации')
}


async function cvurldelete(req, res) {
  if (authPreValidation(req.cookies.session, req.cookies.mail)) {
    let que = `
      UPDATE "users" SET "cvurl" = ''
      WHERE auth_cookie = $1 AND role = 'subscriber'
    `
    let params = [req.cookies.session]
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
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      //console.log(req.body)
      let que = `
        UPDATE "users" SET "cvurl" = $1
        WHERE auth_cookie = $2 AND email = $3 AND role = 'subscriber'
      `
      let params = [req.body.cvurl, req.cookies.session, req.cookies.mail]
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

async function getCVHitsHistory(req, res) {
  if (authPreValidation(req.cookies.session, req.cookies.mail)) {
    let que = `
      SELECT user_id
      FROM users
      WHERE auth_cookie = $1 AND email = $2 AND role = 'subscriber'
    `
    let result = await pool.query(que, [req.cookies.session, req.cookies.mail]).catch(error => {
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
  let perpage = '25'
  if (req.query.perpage === '50') perpage = '50'
  else if (req.query.perpage === '100') perpage = '100'
  console.log('cpGetJobs, txt: ', req.query)
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
    if (txt != undefined) cityN = '$3'
    else cityN = '$2'
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
              FROM jobs, users
              WHERE jobs.author_id = users.user_id AND
                jobs.is_published = TRUE AND
                jobs.is_closed = FALSE
                ${timerange} 
                ${txt != undefined ? ` AND
                (LOWER(jobs.title) LIKE $2 OR
                LOWER(users.company) LIKE $2 OR
                LOWER(jobs.description) LIKE $2 OR
                LOWER(jobs.city) LIKE $2)` : ''}
                ${city != undefined ? ` AND 
                LOWER(jobs.city) LIKE ${cityN}`: ''}
                ${jcat != undefined ? ` AND jobs.jcategory = ${jcat}`: ''}
                ${exp_line}
                ${sal_line}
                ${curr_line}
              ${sort}
              LIMIT $1 ${'OFFSET ' + offset}`
              
  //console.log('cp_getJobs2: ', que)
  let qparams = [perpage]
  if (txt) qparams.push(txt)
  if (city) qparams.push(city)
  pool.query(que, qparams, (error, results) => {
    if (error) {
      console.log(error)
      return false
    }
    qparams = txt != undefined ? [qparams[1]] : null
    let countque =  `SELECT count(*) AS full_count
                    FROM jobs, users
                    WHERE jobs.author_id = users.user_id AND
                      jobs.is_published = TRUE AND
                      jobs.is_closed = FALSE
                      ${timerange} 
                      ${txt != undefined ? ` AND
                      (LOWER(jobs.title) LIKE $1 OR
                      LOWER(users.company) LIKE $1 OR
                      LOWER(jobs.description) LIKE $1 OR
                      LOWER(jobs.city) LIKE $1)` : ''}
                      ${city != undefined ? ` AND 
                      LOWER(jobs.city) LIKE ${cityN - 1}`: ''}
                      ${jcat != undefined ? ` AND jobs.jcategory = ${jcat}`: ''}
                      ${exp_line}
                      ${sal_line}
                      ${curr_line}`
    pool.query(countque, qparams, (error2, results2) => {
      if (error2) {
        console.log('errcp33 ', error2)
        return false
        //throw error2
      }
      res.status(200).json({...results2.rows[0], 'page': page, 'perpage': perpage, rows: results.rows})
    })
    //console.log('cp16: ', results.rows)
    
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
  if (req.body.topic.length > 25) {
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
    } else console.log('job hit')
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
  console.log('cp1')
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
  console.log('cp2')
  let company
  if (result.rows && result.rows.length === 1) company = result.rows[0]
  else {
    res.status(400).json('Неправильный id компании. Ошибка 2')
    return false
  }
  
  res.status(200).send(company)
}

async function testMail(n, mail) {
  let baseUrl = process.env.NODE_ENV ? 'https://jobsnearby.herokuapp.com' : 'http://127.0.0.1:7777'
  
  let txt = baseUrl + '/verify.json?n=' + n
  console.log('sending mail func: ' + txt)
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        // should be replaced with real sender's account
        user: 'jobsnearby1000@gmail.com',
        pass: 'g789451bb'
    }
  })
  let mailOptions = {
    // should be replaced with real recipient's account
    to: mail, //'origami1024@gmail.com',
    subject: 'Верификация пользователя на jobsnearby',
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


async function registerFinish (id, hash, usertype, arg1, arg2) {
  let insert = ''
  if (usertype === 'company' && (arg2 != true && arg2 != 'true')) arg2 = false
  if (usertype === 'subscriber') insert = `, name = $4, surname = $5`
  else if (usertype === 'company') insert = `, company = $4, isagency = $5`
  let que = `UPDATE "users" SET pwhash = $1, role = $3${insert} where user_id = $2 RETURNING email`
  //console.log(que, '///', arg2)
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

    let success1 = await tryInsertMailVerification(hash1, userId, mail).catch(error => {
      res.send('step5')
      return undefined
    })
    if (success1) {
      testMail(hash1, mail)
      console.log('it is successful registraion at this point')
      res.send('OK')
    } else {res.send('step6'); console.log('failed at creating the verification entry')}
    
  } else {res.send('step1'); console.log('not valid mail or wrong pw')}
  
}


async function out(req, res) {
  //maybe delete stuff in db and write some statistics down
  //for now just reset cookies and send back OK
  // console.log('user logout')
  res.cookie('session', '')
  res.cookie('mail', '')
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
  // console.log('cp login: ', req.cookies)
  let mail = req.body[0].toLowerCase()
  let pw = req.body[1]
  let rememberme = req.body[2]
  // console.log('cp login rm: ', mail, ',', pw, ',', rememberme)
  if (SupremeValidator.isValidEmail(mail) && SupremeValidator.isValidPW(pw)) {
    //console.log('user validated')
    //get hash from db checking if mail exists
    let que = `
      SELECT pwhash, user_id, role, name, surname, 
      insearch, company, isagency, cvurl, is_active, 
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
    // console.log('cp77', userData)
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
        //console.log(req.cookies)
        let laststage = await tryInsertAuthToken(userData.user_id, jwtoken).catch(error => {
          res.send('step3')
          return undefined
        })
        if (laststage === undefined) return false
        delete userData.pwhash
        delete userData.block_reason
        userData.success = 'OK'
        if (rememberme) {
          res.cookie('session', jwtoken, {expires: new Date(Date.now() + 590013000)})
          res.cookie('mail', mail, {expires: new Date(Date.now() + 590013000)})
        } else {
          res.cookie('session', jwtoken)
          res.cookie('mail', mail)
        }
        res.send(userData)
      } else res.send('step2')

    } else {console.log('user does not exist?', userData); res.send('step2'); return false}

    //res.send('OK')
  } else {res.send('step1')}
  
}


async function getUserAuthByCookies(session, mail) {
  let que = `SELECT email AS identity, user_id, role, 
    name AS username, surname, company, insearch, isagency, cvurl, is_active
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
  else return result.rows[0]
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
  let job
  if (result.rows && result.rows.length === 1) job = result.rows[0]
  else return {}
  
  hitJobById(id, addr)
  return(job)
}

async function getJobsUserStatsSSR() {
//get JOBS and USERSTATS in one
  let perpage = '25'
  let sort = 'ORDER BY (jobs.time_updated, jobs.job_id) DESC'

  let que =  `SELECT jobs.author_id, users.company as author, jobs.job_id, jobs.city, jobs.experience, jobs.title, jobs.currency, jobs.salary_min, jobs.salary_max, jobs.description, jobs.time_updated as updated, jobs.contact_mail, contact_tel
              FROM jobs, users
              WHERE jobs.author_id = users.user_id AND
                jobs.is_published = TRUE AND
                jobs.is_closed = FALSE
                AND jobs.time_updated > now() - interval '1 month'
              ${sort}
              LIMIT $1`
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

  return {...r2.rows[0], 'page': 1, 'perpage': perpage, rows: r1.rows, stats: r3.rows}
}

// async function testAsyncSSR(req, res) {
//   let r = 'dik'
//   r = await pool.query('SELECT NOW()', null).catch(error => {
//     console.log('errcpx3x4 ', error)
//     return 'erra'
//   })
  
//   return {'title':'drainage',r}
// }

module.exports = {
  getJobs,
  getSalStats,
  getJobByIdJSON,
  getCompanyById,

  login,
  reg,
  out,
  
  verify,

  feedback,

  hitJobById,

  getCVHitsHistory,
  cvurlupdate,
  cvurldelete,

  getJobsUserStatsSSR,
  getJobDataSSR,
  getCompanyDataSSR,
  getUserAuthByCookies,

  //utils
  authPreValidation,
}
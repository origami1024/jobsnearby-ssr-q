const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://postgres:123456@localhost:5433/jobsnearby`
})

const getJobs = (req, res) => {
  let perpage = '25'
  if (req.query.perpage === '50') perpage = '50'
  else if (req.query.perpage === '100') perpage = '100'
  //console.log('cpGetJobs, txt: ', req.query.txt)
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
  console.log('sal_line: ', sal_line)

  let curr_line
  if (req.query.cur == '$') curr_line = ` AND jobs.currency = '$'`
  else if (req.query.cur == 'm') curr_line = ` AND jobs.currency = 'm'`
  else curr_line = ''
  console.log('curr_line: ', curr_line)

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
      throw error
    }
    qparams[0] = 1
    let countque =  `SELECT count(*) AS full_count
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
                      ${curr_line}`
    pool.query(countque, null, (error2, results2) => {
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

  feedback,

  hitJobById,

  getJobsUserStatsSSR,
  getJobDataSSR,
  getCompanyDataSSR,
  // testAsyncSSR
}
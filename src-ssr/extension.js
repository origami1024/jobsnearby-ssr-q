/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Note: This file is used for both PRODUCTION & DEVELOPMENT.
 * Note: Changes to this file (but not any file it imports!) are picked up by the
 * development server, but such updates are costly since the dev-server needs a reboot.
 */

const db = require('./db/pgqueries')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

function authPreValidation(session, mail) {
  if (
    session && session.length > 50
    &&
    mail && mail.length > 2 && mail.length < 51 //50 is max mail length in db now
  ) return true
  else return false
}

module.exports.extendApp = function ({ app, ssr }) {
  /*
     Extend the parts of the express app that you
     want to use with development server too.

     Example: app.use(), app.get() etc
  */

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cookieParser('qwekkk-12345'))

  app.get('/jobs.json', db.getJobs)
  app.get('/salstats.json', db.getSalStats)
  app.get('/jobby.idjson=:id', db.getJobByIdJSON)
  // app.get('/companyby.idjson=:id', getCompanyById)
  app.get('/companyby.idjson=:id', db.getCompanyById)

  app.post('/fb', db.feedback)

  app.post('/login', db.login)
  app.post('/out', db.out)

  //ssr stuff
  //0 -- wait! on what route is this? on any first route?
  //0 -- think this trhourh
  /*AUTH ROUTE WOT? NO SUCH ROUTE ON SSR
  app.post('/auth', async function (req, res, next) {
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    
    next()
  })*/
  //1
  app.get('/', async function (req, res, next) {
    //auth first
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }

    req.rawjobs = await db.getJobsUserStatsSSR().catch(error => {
      console.log('getJobsUserStatsSSR. xxx', error)
      return undefined
    })
    next()
  })
  //2
  app.get('/jobpage', async function (req, res, next) {
    //auth first
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }

    //second this
    const id = parseInt(req.query.id)
    if (isNaN(id) || id < 0 || String(id).length > 10) {
      console.log('Error: wrong id')
      res.status(400).send('Неправильный id вакансии.')
      return false
    }

    //second this
    req.jobData = await db.getJobDataSSR(id, req.headers['x-forwarded-for'] || req.connection.remoteAddress).catch(error => {
      console.log('getJobDataSSR. xxx', error)
      return undefined
    })
    next()
  })
  //3
  app.get('/companypage', async function (req, res, next) {
    //auth first
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }

    //second this
    const id = parseInt(req.query.id)
    if (isNaN(id) || id < 0 || String(id).length > 10) {
      console.log('Error: wrong company id')
      res.status(400).send('Неправильный id компании.')
      return false
    }
    // console.log('DRA', id)
    req.companyData = await db.getCompanyDataSSR(id).catch(error => {
      console.log('getCompanyDataSSR. xxx', error)
      return undefined
    })
    next()
  })
  app.post('/registration', async function (req, res, next) {
    //only auth here
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.post('/feedback', async function (req, res, next) {
    //only auth here
    if (authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
}

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
const adm = require('./db/pgadmin')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')



module.exports.extendApp = function ({ app, ssr }) {
  /*
     Extend the parts of the express app that you
     want to use with development server too.

     Example: app.use(), app.get() etc
  */



  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  //app.use(cookieParser('qwekkk-12345'))
  app.use(cookieParser())

  app.get('/jobs.json', db.getJobs)
  app.get('/salstats.json', db.getSalStats)
  app.get('/jobby.idjson=:id', db.getJobByIdJSON)
  // app.get('/companyby.idjson=:id', getCompanyById)
  app.get('/companyby.idjson=:id', db.getCompanyById)

  app.post('/fb', db.feedback)

  app.post('/login', db.login)
  app.post('/reg', db.reg)
  app.post('/out', db.out)

  app.get('/verify.json', db.verify)

  app.post('/changeuserstuff', db.changeuserstuff)
  app.post('/changepw', db.changepw)
  app.post('/getcvhitshistory', db.getCVHitsHistory)
  app.post('/cvupdate.json', db.cvurlupdate)
  app.post('/cvdelete.json', db.cvurldelete)
  
  app.post('/hitjobcv', db.hitjobcv)


  app.post('/getownjobs.json', db.getOwnJobs)
  app.post('/ownCompany.json', db.getOwnCompanyJSON)
  app.post('/companyupdpic.json', db.updateOneCompanyPic)
  app.post('/companyUpdate.json', db.updateOneCompany)

  app.post('/getresps', db.getResps)
  app.post('/viewhit', db.viewHit)
  
  app.post('/oneJob', db.addOneJob)
  app.post('/updateJob', db.updateJob)

  app.post('/closeJobBy.id', db.closeJobById)
  app.post('/delJobBy.id', db.deleteJobById)
  app.post('/reopenJobBy.id', db.reopenJobById)

  app.post('/entrance', db.addJobs)


  app.get('/forgottenx2.json', db.forgottenx2)//u come here to confirm the pw regen request
  app.get('/forgotten.json', db.forgotten)
  app.post('/forgottenx.json', db.forgottenx)
  app.get('/resend.json', db.resend)
  app.post('/resender.json', db.resender)


  //CPSTART
  app.get('/cp.json', adm.adminPanel)
  app.get('/cplogin.json', adm.adminLogin)
  app.post('/cploginep.json', adm.cpLoginEndpoint)
  app.get('/allfb.json', adm.getAllFB)
  app.get('/adminusers.json', adm.adminUsers)
  app.get('/adminjobs.json', adm.adminJobs)
  app.get('/adminstats.json', adm.adminStatsRoute)
  app.get('/cpsuper.json', adm.superAdmin)
  app.get('/u2out.json', adm.u2out)
  app.post('/newu2.json', adm.adminNew)
  //CPEND

  //admin actions
  app.post('/fbaction.json', adm.fbaction)
  app.post('/admnjobclo.json', adm.closeJobByIdAdmin)
  app.post('/admnjobdel.json', adm.deleteJobByIdAdmin)
  app.post('/admnjobapr.json', adm.approveJobByIdAdmin)
  app.post('/auaction.json', adm.auaction)
  app.post('/userstatregen.json', adm.userStatRegen)
  //aa end
  
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
    console.log('cp1debug')
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
  app.get('/registration', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
  app.get('/subprofile', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
  app.get('/entprofile', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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
  app.get('/addjob', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addjob', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/uploads', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.cookies.session, req.cookies.mail).catch(error => {
        console.log('getUserAuthByCookies. uploads', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/feedback', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.cookies.session, req.cookies.mail)) {
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

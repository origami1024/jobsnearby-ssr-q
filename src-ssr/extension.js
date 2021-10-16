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
  app.use(cookieParser('twerk-12345'))
  // app.use(cookieParser())


  app.get('/jobs.json', db.getJobs)
  app.get('/salstats.json', db.getSalStats)
  app.get('/jobby.idjson=:id', db.getJobByIdJSON)
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
  
  app.post('/setlang', db.setLangCookie)

  app.post('/hitjobcv', db.hitjobcv)


  app.post('/getownjobs.json', db.getOwnJobs)
  // app.post('/getownjobscut.json', db.getOwnJobsCut)
  app.post('/ownCompany.json', db.getOwnCompanyJSON)
  // app.post('/companyupdpic.json', db.updateOneCompanyPic)

  const multer = require('multer')
  const upload = multer()

  app.post('/companyupdpicx.json', upload.single('image'), db.updateOneCompanyPicX)

  app.post('/cvupdx.json', upload.single('cv'), db.cvUpdateX)

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

  app.post('/cv', db.cvCreateUpdate)
  app.delete('/cv', db.cvDelete)
  app.get('/cv', db.cvFetchForEdit)
  app.get('/cv/:id', db.cvGetDetail)
  app.get('/cv-index', db.cvGetIndex)
  app.post('/cvphoto.json', upload.single('photo'), db.updateOneCvPic)
  app.delete('/cvphoto.json', db.cvPhotoDelete)

  //CPSTART
  app.get('/cp.json', adm.adminPanel)
  app.get('/cplogin.json', adm.adminLogin)
  app.post('/cploginep.json', adm.cpLoginEndpoint)
  app.get('/allfb.json', adm.getAllFB)
  app.get('/banners.json', adm.banners)
  app.get('/adminusers.json', adm.adminUsers)
  app.get('/adminjobs.json', adm.adminJobs)
  app.get('/adminstats.json', adm.adminStatsRoute)
  app.get('/cpsuper.json', adm.superAdmin)
  app.get('/u2out.json', adm.u2out)
  app.post('/newu2.json', adm.adminNew)
  app.get('/snpics.json', adm.snpics)
  app.get('/deleteSnpics.json', adm.deleteSnpics)
  //CPEND

  //admin actions
  app.post('/fbaction.json', adm.fbaction)
  app.post('/admnjobclo.json', adm.closeJobByIdAdmin)
  app.post('/admnjobdel.json', adm.deleteJobByIdAdmin)
  app.post('/admnjobapr.json', adm.approveJobByIdAdmin)
  app.post('/auaction.json', adm.auaction)
  app.post('/userstatregen.json', adm.userStatRegen)
  app.post('/forceedit.json', adm.forceEdit)
  app.post('/socpicbyparams.json', adm.createSocialPicByParams)
  
  // aa end
  
  app.get('/jobpage', async function (req, res, next) {
    res.set('location', '/jobpage/' + req.query.id);
    res.status(301).send()
  })
  app.get('/companypage', async function (req, res, next) {
    res.set('location', '/companypage/' + req.query.id);
    res.status(301).send()
  })

  //ssr stuff
  //1
  app.get('/', async function (req, res, next) {
    //auth first
    // console.log('cp1debug')
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    //let page_num = (req.query && req.query.page) ? req.query.page : 1
    let page_num = (req.query && req.query.page) ? req.query.page : 1
    req.rawjobs = await db.getJobsUserStatsSSR(page_num).catch(error => {
      console.log('getJobsUserStatsSSR. xxx', error)
      return undefined
    })
    next()
  })
  //2
  app.get('/jobpage/:jid', async function (req, res, next) {
    //auth first
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }

    //second this
    // const id = parseInt(req.query.id)
    const id = parseInt(req.params.jid)

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
  app.get('/companypage/:cid', async function (req, res, next) {
    //auth first
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. xxx', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }

    //second this
    const id = parseInt(req.params.cid)
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addjob', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/cv-search', async function (req, res, next) {
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addCV', error)
        return 'error1'
      })
      // req.cvData = await db.cvFetchForEditSSR(req, res).catch(error => {
      //   console.log('cvFetchForEdit. addCV', error)
      //   return 'error2'
      // })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/cv-editor', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addCV', error)
        return 'error1'
      })
      // req.cvData = await db.cvFetchForEditSSR(req, res).catch(error => {
      //   console.log('cvFetchForEdit. addCV', error)
      //   return 'error2'
      // })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/cvs/:id', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addCV', error)
        return 'error1'
      })
    } else {
      //empty or not valid auth data
      req.userData = 'noauth'
    }
    next()
  })
  app.get('/cv-list', async function (req, res, next) {
    //only auth here
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
        console.log('getUserAuthByCookies. addCV', error)
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
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
    if (db.authPreValidation(req.signedCookies.session, req.signedCookies.mail)) {
      req.userData = await db.getUserAuthByCookies(req.signedCookies.session, req.signedCookies.mail).catch(error => {
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

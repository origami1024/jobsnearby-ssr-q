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


module.exports.extendApp = function ({ app, ssr }) {
  /*
     Extend the parts of the express app that you
     want to use with development server too.

     Example: app.use(), app.get() etc
  */

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/jobs.json', db.getJobs)
  app.get('/salstats.json', db.getSalStats)
  app.get('/jobby.idjson=:id', db.getJobByIdJSON)
  // app.get('/companyby.idjson=:id', getCompanyById)

  app.post('/fb', db.feedback)


  //ssr stuff
  //1
  app.get('/', async function (req, res, next) {
    req.rawjobs = await db.getJobsUserStatsSSR().catch(error => {
      console.log('getJobsUserStatsSSR. xxx', error)
      return undefined
    })
    next()
  })
  //2
  app.get('/jobpage', async function (req, res, next) {
    // console.log('smghth ', parseInt(req.query.id))
    const id = parseInt(req.query.id)
    if (isNaN(id) || id < 0 || String(id).length > 10) {
      console.log('Error: wrong id')
      res.status(400).send('Неправильный id вакансии.')
      return false
    }
    req.jobData = await db.getJobDataSSR(id, req.headers['x-forwarded-for'] || req.connection.remoteAddress).catch(error => {
      console.log('getJobDataSSR. xxx', error)
      return undefined
    })
    next()
  })
  //3
  app.get('/companypage', async function (req, res, next) {
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
}

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

module.exports.extendApp = function ({ app, ssr }) {
  /*
     Extend the parts of the express app that you
     want to use with development server too.

     Example: app.use(), app.get() etc
  */
  app.get('/jobs.json', db.getJobs)
  app.get('/salstats.json', db.getSalStats)

  app.get('/', async function (req, res, next) {
    req.rawjobs = await db.getJobsUserStatsSSR().catch(error => {
      console.log('getJobsUserStatsSSR. xxx', error)
      return undefined
    })
    // console.log(JSON.stringify(r))
    // console.log('here')
    next()
  })
}

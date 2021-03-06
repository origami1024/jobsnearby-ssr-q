export default {
  filtersToggle(state) {
    state.jfiltersToggle = !state.jfiltersToggle
  },
  filtersOff(state) {
    state.jfiltersToggle = false
  },
  reopenJobById(state, jid) {
    state.user.ownJobs.find(val=>val.job_id == jid).is_closed = false
  },
  deleteJobById(state, jid) {
    let indx = state.user.ownJobs.findIndex(val=>val.job_id == jid)
    state.user.ownJobs.splice(indx, 1)
  },
  closeJobById(state, jid) {
    state.user.ownJobs.find(val=>val.job_id == jid).is_closed = true
  },
  setOwnJobs(state, jobs) {
    state.user.ownJobs = jobs
  },
  newJobInitAJ(state) {
    state.addJob = {
      newJobsPageType: 'new',
      jobEditedObj: {},
      sent: 'none'
    }
  },
  setAJEditedObj(state, value) {
    state.addJob.jobEditedObj = value
  },
  setAJNewJobsPageType(state, value) {
    state.addJob.newJobsPageType = value
  },
  setAJSentState(state, value) {
    state.addJob.sent = value
  },
  setCAboutProp(state, {prop, value}) {
    state.cabout[prop] = value
  },
  setCAbout(state, cabout) {
    state.cabout = cabout
  },
  addOwnCV(state, cv) {
    state.user.ownCVs.push(cv)
  },
  setCVUrl(state, cvurl) {
    state.user.cvurl = cvurl
  },
  setCvId (state, cv_id) {
    state.user.cv_id = cv_id
  },
  setSubscriberPhoto (state, link) {
    state.user.logo_url = link
    state.user = { ...state.user, logo_url: link}
  },
  preFetchCv (state, cvData) {
    state.cvData = cvData
  },
  setFilter(state, {prop, value}) {
    state.jFilters[prop] = value
  },
  resetFilters(state) {
    state.jFilters = {
      query: '',
      city: '',
      jcat: {label: "", value: 0},
      salary: {label: "", value: 'idc'},
      exp: {label: "", value: 'idc'}, 
      currency: {label: "", value: 'idc'},
      txt: '',
      timerange: 'mon',
      sort: 'new',
      perpage: '25'
    }
  },
  setRegState (state, value) {
    state.regState = value 
  },
  refreshJobs (state, rawjobs) {
    state.jobslist = rawjobs.rows
    state.jobs.jobsFullcount = Number(rawjobs.full_count)
    state.jobs.perpage = Number(rawjobs.perpage)
    state.jobs.page_current = Number(rawjobs.page)
  },
  refreshUStats (state, stats) {//user stats
    let topIdx = 0
    for (let index = 0; index < stats.length; index++) {
      if (stats[index].statname == 'salMin')
        state.uStats.salMin = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname == 'salAvg')
        state.uStats.salAvg = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname == 'salMax')
        state.uStats.salMax = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname.startsWith('top')) {
        // let topIdx = parseInt(stats[index].statname.replace('top',''))
        state.uStats.tops[topIdx] = [
          stats[index].statlabel,
          stats[index].statvalue + stats[index].statcurrency,
          stats[index].statlink
        ]
        topIdx += 1
        
      }
    }
  },
  setJobDetails (state, job) {
    state.jobDetails = job
  },
  setCompanyDetails (state, company) {
    state.cdata = company
    // console.log('cp7', state.cdata)
  },
  storeAuth (state, user) {
    state.user = {...state.user, ...user}
    // console.log('cnt', user)
  },
  setNameSurnameInSearch (state, user) {
    state.user = {...state.user, ...user}
    // console.log('cnt', user)
  },
  resetUser (state) {
    state.user = {
      identity: 'Гость',
      role: 'guest',
      user_id: -1,
      name: '',
      surname: '',
      company: '',
      isagency: false,
      insearch: false,
      cvurl: '',
      ownJobs: [],
      ownCVs: []
    }
    state.authStatus = 'Вход не выполнен'
    //should be not just user, but also otehr data user related data
  },
  setAuthStatus (state, newStatus) {
    state.authStatus = newStatus
  }
}

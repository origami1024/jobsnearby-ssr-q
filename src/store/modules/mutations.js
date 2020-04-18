export default {
  addOwnCV(state, cv) {
    state.user.ownCVs.push(cv)
  },
  setCVUrl(state, cvurl) {
    state.user.cvurl = cvurl
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
    state.jobsFullcount = Number(rawjobs.full_count)
    state.perpage = Number(rawjobs.perpage)
    state.page_current = Number(rawjobs.page)
  },
  refreshUStats (state, stats) {//user stats
    for (let index = 0; index < stats.length; index++) {
      if (stats[index].statname == 'salMin')
        state.uStats.salMin = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname == 'salAvg')
        state.uStats.salAvg = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname == 'salMax')
        state.uStats.salMax = stats[index].statvalue + stats[index].statcurrency
      else if (stats[index].statname.startsWith('top')) {
        let topIdx = parseInt(stats[index].statname.replace('top',''))
        state.uStats.tops[topIdx] = [
          stats[index].statlabel, 
          stats[index].statvalue + stats[index].statcurrency,
          stats[index].statlink
        ]
      }
    }
  },
  setJobDetails (state, job) {
    state.jobDetails = job
  },
  setCompanyDetails (state, company) {
    state.cdata = company
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
      username: '',
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

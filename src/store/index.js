import Vue from 'vue'
import Vuex from 'vuex'

import { axiosInstance } from 'boot/axios'

Vue.use(Vuex)

import state from './modules/state'
import mutations from './modules/mutations'
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const wordRegex = /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\\-]*$/


export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state,
    getters: {
      isResetShown(state) {
        let res = false
        if (state.jFilters.city != '') res = true
        else if (state.jFilters.salary.value != 'idc') res = true
        else if (state.jFilters.currency.value != 'idc') res = true
        else if (state.jFilters.exp.value != 'idc') res = true
        else if (state.jFilters.jcat.value != 0) res = true

        else if (state.jFilters.txt != '') res = true

        else if (state.jFilters.sort != 'new') res = true
        else if (state.jFilters.timerange != 'mon') res = true
        else if (state.jFilters.perpage != '25') res = true
        return res
      },
      query(state) {
        let params = []
        if (state.jFilters.txt !== '' && wordRegex.test(state.jFilters.txt)) params.push('txt=' + state.jFilters.txt)
        if (state.jFilters.sort !== 'new') params.push('sort=' + state.jFilters.sort)
        if (state.jFilters.timerange !== 'mon') params.push('timerange=' + state.jFilters.timerange)
        if (state.jFilters.perpage !== '25') params.push('perpage=' + state.jFilters.perpage)
        if (state.jFilters.city !== '' && wordRegex.test(state.jFilters.city)) params.push('city=' + state.jFilters.city)
        if (state.jFilters.exp.value !== 'idc') params.push('exp=' + state.jFilters.exp.value)
        if (state.jFilters.jcat.value !== 0) params.push('jcat=' + state.jFilters.jcat.value)
        if (state.jFilters.salary.value !== 'idc') params.push('sal=' + state.jFilters.salary.value)
        if (state.jFilters.currency.value !== 'idc') params.push('cur=' + state.jFilters.currency.value)
        return params.length == 0 ? '' : '?' + params.join('&')
      },
    },
    mutations,
    actions: {
      async updateCVUrl (context, cvurl) {
        context.commit('setCVUrl', cvurl)
      },
      resetFilters (context) {
        context.commit('resetFilters')
        context.dispatch('refreshjobs', {})
      },
      filterUpd (context, {prop, value}) {
        if (context.state.jFilters[prop] != value) {
          context.commit('setFilter', {prop, value})
          if (prop == 'timerange' || prop == 'sort' || prop == 'perpage') {
            context.dispatch('refreshjobs', {})
          }
        }
      },
      async refreshjobs (context, {param, param2}) {
        if (this.$router.currentRoute.name == 'jobpage' && param != 'logoclick') {
          //this condition maybe needs repair
          console.log('get one job app level (bluff)')
        } else {
          console.log('refresh ALL jobs app level', param, param2)
          let jobslistUrl = '/jobs.json'
          if (param !== 'init') {
            // console.log('cp55, ', context)
            jobslistUrl += context.getters.query
            // console.log(context.getters.query)
            if (param === 'page') {
              jobslistUrl += context.state.jFilters.query.length > 0 ? '&page=' : '?page='
              jobslistUrl += param2
            }
          }
          axiosInstance
            .get(jobslistUrl, null, {headers: {'Content-Type' : 'application/json' }})
            .then(response => {
              // this.$store.dispatch('refreshJobsDataLight', response.data)
              context.commit('refreshJobs', response.data)
            })
          axiosInstance
            .get('/salstats.json', null, {headers: {'Content-Type' : 'application/json' }})
            .then(response => {
              // this.$store.dispatch('refreshUStats', response.data)
              context.commit('refreshUStats', response.data)
            })
        }
      },
      regStateChange (context, value) {
        context.commit('setRegState', value)
      },
      setNameSurnameInSearch (context, mass) {
        // console.log(mass)
        context.commit('setNameSurnameInSearch', mass)
      },
      // setUserKeyProp (context, {key, prop}) {
      //   context.commit('setUserKeyProp', {key, prop})
      // },
      refreshJobsData (context, rawjobs) {
        context.commit('refreshJobs', rawjobs)
        context.commit('refreshUStats', rawjobs.stats)
      },
      refreshJobsDataLight (context, rawjobs) {
        context.commit('refreshJobs', rawjobs)
      },
      refreshUStats (context, stats) {
        context.commit('refreshUStats', stats)
      },
      setJobDetails (context, job) {
        context.commit('setJobDetails', job)
      },
      async fetchJobDetails (context, id) {
        console.log(id)
        let jobUrl = '/jobby.idjson=' + id
        return axiosInstance.get(jobUrl, null, {headers: {'Content-Type' : 'application/json' }})
          .then(({ data }) => {
            context.commit('setJobDetails', data)
          })
      },
      setCompanyDetails (context, company) {
        context.commit('setCompanyDetails', company)
      },
      async fetchCompanyDetails (context, id) {
        console.log(id)
        let jobUrl = '/companyby.idjson=' + id
        return axiosInstance.get(jobUrl, null, {headers: {'Content-Type' : 'application/json' }})
          .then(({ data }) => {
            context.commit('setCompanyDetails', data)
          })
      },
      storeAuth (context, user) {
        // console.log('SA SASDASD')
        context.commit('storeAuth', user)
      },
      async loginGo (context, user) {
        context.commit('storeAuth', user)
        if (user.role == 'subscriber') {
          //this.getOwnCVHits()
        } else if (user.role == 'company') {
          //getOWN JOBS???
        }
      },
      async resetUser (context) {
        //also reset subprofile, etc related data here
        context.commit('resetUser')
      },
      async setAuthStatus (context, newStatus) {
        context.commit('setAuthStatus', newStatus)
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}

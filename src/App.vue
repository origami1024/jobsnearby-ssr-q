<template>
  <div id="q-app">
    <div class="header-wrapper">
      <header>
        <router-link
          @click.native="refreshjobs('logoclick')" to="/"
          class="logolink"
        >
          <span class="logoText">
            G<span style="color: #8645FF; font-weight: bold;">OO</span>DWILL
          </span>
          <q-tooltip transition-show="rotate"
          transition-hide="rotate">
            <p style="font-size: 15px; margin: 0">{{$t('App.logoTooltip')}}</p>
          </q-tooltip>
        </router-link>
        <div class="lowres__header-right">
          <div id="nav">
            <router-link
              class="headerBtn"
              v-if="user.role === 'company' && isagency == true" to="/uploads"
              :style="{color: $route.name != 'uploads' ? 'green' : 'var(--violet-btn-color)'}"
            >
              <q-icon name="description" style="font-size: 32px;" class="nav-icon multipleUploadsHeader"></q-icon>
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('addJob.xlsBtn')}}</p>
              </q-tooltip>
            </router-link>
            <q-btn 
              @click.native="newJobInit"
              v-if="user.role == 'company'"
              class="headerBtns1 headerBtnRed"
              text-color="white" 
              :label="$t('App.newJobHint')"
              rounded
              to="/addJob"
            />
            <q-btn
              @click.native="authPls"
              v-else-if="user.role != 'subscriber'"
              class="headerBtns1 headerBtnRed"
              text-color="white" 
              :label="$t('App.newJobHint')"
              to="/registration"
            />            
          </div>
          <div id="authmenu">
            <div class="colx user-status-bar">
              <q-btn 
                style="background-color: var(--violet-btn-color);"
                class="headerBtns1 violetBtns"
                text-color="white"
                :label="$t('App.login')"
                @click.native="regState='login'"
                v-if="user.role && user.role.startsWith('guest')"
                to="/registration"
              />
              <router-link
                v-if="user.role && user.role === 'subscriber'"
                class="headerBtn marginLeft30pxOnBig"
                to="/subprofile"
                :style="{color: $route.name != 'subprofile' ? '' : 'var(--violet-btn-color)'}"
              >
                <q-icon name="person" style="font-size: 36px;" class="nav-icon"></q-icon>
                <q-tooltip>
                  <p style="font-size: 15px; margin: 0">{{$t('App.myProfile')}}</p>
                </q-tooltip>
              </router-link>

              <router-link
                @click.native="getOwnJobs"
                v-if="user.role && user.role === 'company' && $route.name == 'entprofile'"
                class="headerBtn marginLeft30pxOnBig"
                to="/entprofile"
                :style="{color: $route.name != 'entprofile' ? '' : 'var(--violet-btn-color)'}"
              >
                <q-icon name="person" style="font-size: 36px;" class="nav-icon"></q-icon>
                <q-tooltip>
                  <p style="font-size: 15px; margin: 0">{{$t('App.myProfile')}}</p>
                </q-tooltip>
              </router-link>
              <router-link
                v-if="user.role && user.role === 'company' && $route.name != 'entprofile'"
                class="headerBtn marginLeft30pxOnBig"
                to="/entprofile"
                :style="{color: $route.name != 'entprofile' ? '' : 'var(--violet-btn-color)'}"
              >
                <q-icon name="person" style="font-size: 36px;" class="nav-icon"></q-icon>
                <q-tooltip>
                  <p style="font-size: 15px; margin: 0">{{$t('App.myProfile')}}</p>
                </q-tooltip>
              </router-link>
              <router-link
                @click.native="logout"
                v-if="user.role && (user.role === 'company' || user.role === 'subscriber')"
                class="headerBtn"
                to="/"
              >
                <q-icon name="logout" style="font-size: 32px; font-weight: bold" class="nav-icon-logout"></q-icon>
                <q-tooltip>
                  <p style="font-size: 15px; margin: 0">{{$t('App.logoutHint')}}</p>
                </q-tooltip>
              </router-link>
            </div>
          </div>
          <LangChanger/>
        </div>
        <q-ajax-bar
          position="bottom"
          color="red"
          size="10px"
        />
      </header>
    </div>
    <keep-alive>
      <router-view class="r-view"/>
    </keep-alive>
    <footer class="main__footer">
      <ul class="footer__ul-top">
        <li>
          <h3>О нас</h3>
          <ul>
            <li><a href="#">Наши вакансии</a></li>
            <li><a href="#">Реклама на сайте</a></li>
          </ul>
        </li>
        <li>
          <h3>Соискателю</h3>
          <ul>
            <li><a href="#">Рассылка вакансий</a></li>
          </ul>
        </li>
        <li>
          <h3>Работодателю</h3>
          <ul>
            <li>
              <router-link @click.native="newJobInit();scrollTop()" v-if="role == 'company'" class="newlinks" to="/addJob">
              {{$t('App.newJobHint')}}
              </router-link>
              <router-link @click.native="newJobInit();scrollTop()" v-else-if="role != 'subscriber'" class="newlinks" to="/registration">
              {{$t('App.newJobHint')}}
              </router-link>
            </li>
          </ul>
        </li>
        <li>
          <h3>Контакты</h3>
          <ul>
            <li><router-link class="headerBtns1 violetBtns footerLinkFB" @click.native="scrollTop()" to="/feedback">{{$t('App.fbBtnLabel')}}</router-link></li>
            <!-- <li><a href="#">info@gmail.com</a></li> -->
          </ul>
        </li>
      </ul>
    </footer>
  </div>
</template>

<script>
import LangChanger from 'components/atoms/LangChanger'
import { mapState } from 'vuex'
export default {
  name: 'App',
  data: ()=>{return {
    dismiss: null,
  }},
  computed: {
    ...mapState(['user', ['role']]),
    ...mapState(['jFilters',['query']])
  },
  beforeDestroy() {
    window.removeEventListener("storage", this.onStorageUpdate)
  },
  
  mounted() {
    if (localStorage.lang) this.$i18n.locale = localStorage.lang
    if (this.$route.query.verified == 1) this.$q.notify({message: 'Email пользователя верифицирован.', icon: 'warning', color: 'green',timeout: 5000})
    if (this.$route.query.resender == 1) this.$q.notify({message: 'Повторное письмо со ссылкой для активации учетной записи отправлено.', icon: 'warning', color: 'green',timeout: 5000})
    if (this.$route.query.reset == 1) this.$q.notify({message: 'Пароль сброшен. Новый пароль отправлен на вашу почту.', icon: 'warning', color: 'green',timeout: 5000})

    let storageUserInit = {}
    if (localStorage.user) {
      storageUserInit.identity = localStorage.user
    }
    if (localStorage.role) {
      storageUserInit.role = localStorage.role
    }
    if (localStorage.user_id) {
      storageUserInit.user_id = Number(localStorage.user_id)
    }
    if (localStorage.username) {
      storageUserInit.username = localStorage.username
    }
    if (localStorage.surname) {
      storageUserInit.surname = localStorage.surname
    }
    if (localStorage.company) {
      storageUserInit.company = localStorage.company
    }
    if (localStorage.isagency) {
      storageUserInit.isagency = localStorage.isagency
    }
    if (localStorage.insearch) {
      storageUserInit.insearch = Boolean(localStorage.insearch)
    }
    if (localStorage.ownCVs) {
      storageUserInit.ownCVs = Array(localStorage.ownCVs)
    }
    this.$store.dispatch('setUserMass', storageUserInit)
    window.addEventListener("storage", this.onStorageUpdate)

    /* THIS NEEDS TO BE REDONE - !! - TRANSFERED TO PREFETCH, AND SERVERSIDE SYNCHRONIZED
    //send auth by cookies request
    axios
      .post(config.jobsUrl + '/auth', [], {withCredentials: true,})
      .then(response => {
        if (response.data === 'fail') {
          console.log('auth failed')
          this.status = 'Вход не выполнен'
          this.token = undefined
          this.user = 'Гость'
          this.user_id = -1
          this.role = 'guestUnau'
          this.surname = ''
          this.username = ''
          this.company = ''
          this.isagency = false
          this.insearch = false
          //this.likedJobs = []
          this.cvurl = ''
          //this.likedJobsList = []
          this.ownJobs = []
          this.ownCVs = []
        } else if (response.data && response.data[0] && response.data[1] && response.data[2]) {
          this.authIt(response.data)
          
        }
      })*/
      
  },
  methods: {
    authPls() {
      if (this.dismiss != null) this.dismiss()
      this.dismiss = this.$q.notify(this.$t('App.doAuthForPublishing'))
    },
    onStorageUpdate(event) {
      if (['identity','role','user_id','username','surname','company','isagency','insearch','cvurl','ownCvs'].includes(event.key)) {
        let newValue = event.newValue
        if (event.key === "user_id") newValue = Number(event.newValue)
        else if (event.key === "isagency" || event.key === "insearch") newValue = Boolean(event.newValue)
        else if (event.key === "ownCVs") newValue = Array(event.newValue)
        this.$store.dispatch('setUserKeyProp', {key: event.key,prop:newValue})
      }
    },
    refreshjobs(param, param2) {
      if (this.$router.currentRoute.name == 'jobpage' && param != 'logoclick') {
        //this condition maybe needs repair
        console.log('get one job app level (bluff)')
      } else {
        console.log('refresh ALL jobs app level', param, param2)
        let jobslistUrl = '/jobs.json'
        if (param !== 'init') {
          jobslistUrl += this.jFilters.query
          if (param === 'page') {
            jobslistUrl += this.query.length > 0 ? '&page=' : '?page='
            jobslistUrl += param2
          }
        }
        this.$axios
          .get(jobslistUrl, null, {headers: {'Content-Type' : 'application/json' }})
          .then(response => {
            this.$store.dispatch('refreshJobsDataLight', response.data)
          })

        //user stats тоже тут, может следует передвинуть
        this.$axios
          .get('/salstats.json', null, {headers: {'Content-Type' : 'application/json' }})
          .then(response => {
            // console.log('cp user stats 1 ', response.data)
            this.$store.dispatch('refreshUStats', response.data)
          })
      }
      
    },
    cvupd(e) {// CHANGE THIS TO USE VUEX
      this.cvurl = e
    },
    setSentState(state) {//CHANGE THIS VUEX &(&*(&))
      this.newJobSentState = state
    },
    newJobInit() { //CHANGE THIS
      this.newJobsPageType = 'new'
      this.jobEditId = -1
      this.jobEditedObj = {}
      this.newJobSentState = 'none'
    },
    editJob(jid) {//CHANGE THIS
      this.newJobsPageType = 'edit'
      this.jobEditId = jid

      let tmpObj = this.ownJobs.find(j => j.job_id == jid)
      let jcatOptions = this.$t('App.jcats')

      let jtypeOptions = this.$t('App.jtypeOptions')
      let expOptions = this.$t('App.expOpts')

      let curOpts = this.$t('App.curOpts')
      let searched
      
      searched = jcatOptions.find(c => c.value == tmpObj.jcategory)
      if (!searched) searched = jcatOptions[0]
      tmpObj.jcategory = searched

      searched = curOpts.find(c => c.value == tmpObj.currency)
      if (!searched) searched = curOpts[0]
      tmpObj.currency = searched
      
      searched = expOptions.find(c => c.value == tmpObj.experience)
      if (!searched) searched = expOptions[0]
      tmpObj.experience = searched

      searched = jtypeOptions.find(c => c.value == tmpObj.jtype)
      if (!searched) searched = jtypeOptions[0]
      tmpObj.jtype = searched
      this.jobEditedObj = Object.assign({}, tmpObj)
      if (this.jobEditedObj.contact_mail == null) this.jobEditedObj.contact_mail = ''
      if (this.jobEditedObj.contact_tel == null) this.jobEditedObj.contact_tel = ''
      
      this.$router.push('/addJob')
    },
    deleteJobById(jid) {//CHANGE THIS
      //console.log('cpcpcp ', jid)
      let indx = this.ownJobs.indexOf(this.ownJobs.find(val=>val.job_id == jid))
      //console.log(indx)
      this.ownJobs.splice(indx, 1)
      let url = config.jobsUrl + '/delJobBy.id?jid=' + jid
      this.ajaxLoading = true
      axios
        .post(url, [], {withCredentials: true,})
        .then(response => {
          this.ajaxLoading = false
        })
    },
    reopenJobById(jid) {//CHANGE THIS
      //console.log('cpcpcp ', jid)
      this.ownJobs.find(val=>val.job_id == jid).is_closed = false
      //console.log(indx)
      let url = config.jobsUrl + '/reopenJobBy.id?jid=' + jid
      this.ajaxLoading = true
      axios
        .post(url, [], {withCredentials: true,})
        .then(response => {
          this.ajaxLoading = false
        })
    },
    closeJobById(jid) {//CHANGE THIS
      //console.log('cpcpcp ', jid)
      this.ownJobs.find(val=>val.job_id == jid).is_closed = true
      //console.log(indx)
      let url = config.jobsUrl + '/closeJobBy.id?jid=' + jid
      this.ajaxLoading = true
      axios
        .post(url, [], {withCredentials: true,})
        .then(response => {
          this.ajaxLoading = false
        })
    },
    scrollTo(yyy) {//CHANGE THIS
      let el = document.documentElement
      const target = getScrollTarget(el)
      const offset = el.offsetTop + yyy
      const duration = 250
      setScrollPosition(target, offset, duration)
    },
    // scrollTop() {//CHANGE THIS
    //   let el = document.documentElement
    //   const target = getScrollTarget(el)
    //   const offset = el.offsetTop
    //   const duration = 250
    //   setScrollPosition(target, offset, duration)
    // },
    getOwnCVHits() {//CHANGE THIS
      let owncvhitsUrl = config.jobsUrl + '/getallcvuser'
      this.ajaxLoading = true
      axios
        .post(owncvhitsUrl, [], {withCredentials: true,})
        .then(response => {
          if (response.data.cvs) {
            //console.log('getOwnCVHits response cp621: ', response.data.cvs)
            this.ownCVs = response.data.cvs //wat
          }
          
          this.ajaxLoading = false
        })
    },
    hitcv(id) {//CHANGE THIS
      if (this.role == 'subscriber') {
        console.log('app hitOne', id)
        console.log(this.role)
        console.log(this.ownCVs)
      if (!this.cvurl || this.cvurl.length < 5) {
        this.$router.push("/subprofile")
        this.$q.notify(this.$t('App.firstCVNote'))
        return false
      }
      let hitcvUrl = config.jobsUrl + '/hitjobcv?jid=' + id
      this.ajaxLoading = true
      axios
        .post(hitcvUrl, {cvurl: this.cvurl}, {withCredentials: true,})
        .then(response => {
          if (response && response.data && response.data.cvhit_id) {
            this.ownCVs.push(response.data)
          }
          //console.log('getOwnJobs response cp61: ', response.newCV, response.data)
          this.ajaxLoading = false
        })
      } else
      if (this.role != 'company') {
        this.$router.push("/registration")
        this.$q.notify({html: true, message: this.$t('App.onlyRegisteredCV')})
        return false
      }
    },
    authIt: function(token) {//CHANGE THIS
      this.status = 'Вход выполнен'//имя пользователя?
      this.user = token[0]
      this.user_id = token[1]
      this.role = token[2]
      this.modalShown = 'none'
      this.ownJobs = []
      if (token[2] === 'subscriber') {
        this.username = token[3]
        this.surname = token[4]
        this.insearch = token[5]
        //this.likedJobs = token[6]
        this.cvurl = token[7]
        setTimeout(()=>{this.getOwnCVHits()}, 50)
      } else
      if (token[2] === 'company') {
        this.company = token[3]
        this.isagency = token[4]
        //this.likedJobs = []
      }
      //console.log('cp111')
    },
    uDataChangeFromSubProfile(udata) {//CHANGE THIS
      this.username = udata.username
      this.surname = udata.surname
      this.insearch = udata.insearch
    },
    logoutAndRetry: function() {
      //this is logout when logout has happened on different tab - no need to send data to server
      console.log('logoutandretry')
      this.status = 'Выход...'//имя пользователя?
      this.user = 'Гость'
      this.user_id = -1
      this.role = 'guest'
      this.status = 'Вход не выполнен'
      this.cvurl = ''
      this.token = undefined
      this.surname = ''
      this.username = ''
      this.company = ''
      this.isagency = false
      this.insearch = false
      //this.likedJobs = []
      this.cvurl = ''
      //this.likedJobsList = []
      this.ownJobs = []
      this.ownCVs = []
      //console.log(this.$route)
      
      if (this.$route.name != 'home') {
        this.$router.push("/")
        // this.refreshjobs()
      }
      //this.$destroy() try this to flush data on logout
    },
    logout: function() {
      if (this.user_id !== -1) {
        this.status = 'Выход...'//имя пользователя?
        this.user = 'Гость'
        this.user_id = -1
        this.role = 'guest'
        this.status = 'Вход не выполнен'
        this.cvurl = ''
        this.token = undefined
        this.surname = ''
        this.username = ''
        this.company = ''
        this.isagency = false
        this.insearch = false
        //this.likedJobs = []
        this.cvurl = ''
        //this.likedJobsList = []
        this.ownJobs = []
        this.ownCVs = []
        console.log('cplogout1: ', this.ownCVs)
        axios
          .post(config.jobsUrl + '/out', [], {withCredentials: true})
          .then(response => {
            this.status = 'Вход не выполнен'
            //console.log(this.$route)
            if (this.$route.name != 'home') this.$router.push("/")
            this.refreshjobs()
          })
      }
    },
    
    getOwnJobs() {
      console.log('getOwnJobs app level')
      let jobslistUrl = config.jobsUrl + '/getOwnJobs.json'
      this.ajaxLoading = true
      axios
        .post(jobslistUrl, [], {withCredentials: true,})
        .then(response => {
          
          if (response.data && response.data.rows) {
            this.ownJobs = response.data.rows
          } else
          if (response.data && response.data.startsWith('logout')) {
            console.log('logged out on different tab')
            this.logoutAndRetry()
          }
          this.ajaxLoading = false
        })
    },
    updQue(params) {
      this.query = params
      console.log(this.query)
    },
  },
  watch:{
    $route (to, from){//CHANGE THIS TO PREFETCH IF POSSIBLE
      if (to.name === 'uploads') {
        this.getOwnJobs()
      } else
      if (to.name === 'addjob') {
        this.newJobSentState = 'none'
      }
    },
    //THERE ARE MANY LOCALSTORAGE INSERTS, MOVE IT INTO WHEN DATA IS RECEIVED (AUTH RELATED!)
    //!!!!!!!!!!!IMPORTANT!!!!!!!!!! CUZ HERE THEY CAN DUPLICATE OPERATION ON OTHER OPEN TABS
  },
  components: {
    LangChanger
  }
}
</script>

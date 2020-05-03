<template>
  <div id="q-app">
    <div class="header-wrapper">
      <header>
        <router-link
          @click.native="$store.dispatch('refreshjobs', {param: 'logoclick'}); $store.dispatch('filtersOff')" to="/"
          class="logolink"
        >
          <span class="logoText">
            HUNAR<span style="color: #8645FF;">MEN</span>
          </span>
          <q-tooltip transition-show="rotate"
          transition-hide="rotate">
            <p style="font-size: 14px; margin: 0">{{$t('App.logoTooltip')}}</p>
          </q-tooltip>
        </router-link>
        <!-- <div class="lowres__header-right"> -->
          <div id="nav">
            <router-link
              class="headerBtn"
              style="margin-right: 5px;"
              v-if="user.role === 'company' && user.isagency == true" to="/uploads"
              :style="{color: $route.name != 'uploads' ? 'green' : 'var(--violet-btn-color)'}"
            >
              <q-icon name="description" style="font-size: 32px;" class="nav-icon-upl multipleUploadsHeader"></q-icon>
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('addJob.xlsBtn')}}</p>
              </q-tooltip>
            </router-link>
            <q-btn 
              @click.native="$store.dispatch('newJobInitAJ')"
              v-if="user.role == 'company'"
              class="headerBtns1 headerBtnRed addJobMargin550"
              text-color="white"
              :label="$t('App.newJobHint')"
              rounded
              to="/addJob"
            />
            <q-btn
              @click.native="authPls"
              v-else-if="user.role != 'subscriber'"
              class="headerBtns1 headerBtnRed addJobMargin550"
              text-color="white" 
              :label="$t('App.newJobHint')"
              to="/registration"
            />            
          </div>
          <div id="authmenu">
            <div class="colx user-status-bar">
              <!-- <q-btn 
                style="background-color: var(--violet-btn-color);"
                class="headerBtns1 violetBtns"
                text-color="white"
                :label="$t('App.login')"
                @click.native="regState='login'"
                v-if="user.role && user.role.startsWith('guest')"
                to="/registration"
              /> -->
              <router-link 
                style="font-family: Montserrat, sans-serif; padding: 0 20px; font-weight: 600; font-size: 14px;
                  color: #fff; line-height: 40px; text-transform: uppercase; text-decoration: none;"
                class="headerBtns1 violetBtns loginbtn"
                @click.native="regState='login'"
                v-if="user.role && user.role.startsWith('guest')"
                to="/registration"
              >
                <span class="noshow-below550">{{$t('App.login')}}</span>
              </router-link>
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
                @click.native="$store.dispatch('getOwnJobs')"
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
                @click.native="logout(true)"
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
          <LangChanger class="header__langchanger" />
        <!-- </div> -->
        <q-ajax-bar
          position="bottom"
          color="red"
          size="10px"
        />
      </header>
    </div>
    <keep-alive>
      <router-view class="r-view" @scrollTo="scrollTo"/>
    </keep-alive>
    <footer class="main__footer">
      <ul class="footer__ul-top">
        <li class="li1">
          <h3>О нас</h3>
          <ul>
            <li><a href="#">Наши вакансии</a></li>
            <li><router-link to="/feedback">Реклама на сайте</router-link></li>
          </ul>
        </li>
        <li class="li2">
          <h3>Соискателю</h3>
          <ul>
            <li><a href="#">Рассылка вакансий</a></li>
          </ul>
        </li>
        <li class="li3">
          <h3>Работодателю</h3>
          <ul>
            <li>
              <router-link @click.native="$store.dispatch('newJobInitAJ')" v-if="user.role == 'company'" class="newlinks" to="/addJob">
                {{$t('App.newJobHint')}}
              </router-link>
              <router-link @click.native="$store.dispatch('newJobInitAJ')" v-else-if="user.role != 'subscriber'" class="newlinks" to="/registration">
                {{$t('App.newJobHint')}}
              </router-link>
            </li>
          </ul>
        </li>
        <li class="li4">
          <h3 class="noshow-below550">Контакты</h3>
          <ul>
            <li>
              <q-btn
                class="headerBtns1 violetBtns footerLinkFB"
                to="/feedback"
                :label="$t('App.fbBtnLabel')"
              />
            </li>
            <!-- <li><a href="#">info@gmail.com</a></li> -->
          </ul>
        </li>
      </ul>
    </footer>

  </div>
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, setScrollPosition } = scroll

import LangChanger from 'components/atoms/LangChanger'
import { mapState } from 'vuex'
export default {
  name: 'App',
  data: ()=>{return {
    dismiss: null,
  }},
  computed: {
    ...mapState(['user']),
    ...mapState(['jFilters']),
  },
  beforeDestroy() {
    window.removeEventListener("storage", this.onStorageUpdate)
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    if (ssrContext && typeof ssrContext.req.userData === 'object' && ssrContext.req.userData !== null) {
      return store.dispatch('storeAuth', ssrContext.req.userData)
    }
  },
  mounted() {
    if (localStorage.lang) this.$i18n.locale = localStorage.lang
    if (this.$route.query.verified == 1) this.$q.notify({message: 'Email пользователя верифицирован.', icon: 'warning', color: 'green',timeout: 5000})
    if (this.$route.query.resender == 1) this.$q.notify({message: 'Повторное письмо со ссылкой для активации учетной записи отправлено.', icon: 'warning', color: 'green',timeout: 5000})
    if (this.$route.query.reset == 1) this.$q.notify({message: 'Пароль сброшен. Новый пароль отправлен на вашу почту.', icon: 'warning', color: 'green',timeout: 5000})

    window.addEventListener("storage", this.onStorageUpdate)

  },
  methods: {
    authPls() {//OK
      if (this.dismiss != null) this.dismiss()
      this.dismiss = this.$q.notify(this.$t('App.doAuthForPublishing'))
    },
    onStorageUpdate(event) {//OK
      // console.log('on stoarge updoto', JSON.parse(event.newValue))
      if (event.key == 'userData') {
        let userData = JSON.parse(event.newValue)
        this.$store.dispatch('storeAuth', userData)
      }
    },
    logout(retry) {//OK
      if (this.user_id !== -1) {
        this.$axios
          .post('/out', [], {withCredentials: true})
      }
      this.$store.dispatch('resetUser')
      localStorage.setItem('userData',JSON.stringify({
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
        }))
      if (this.$route.path != '/') {
        this.$router.push("/")
        if (retry === true) this.$store.dispatch('refreshjobs', {})
      }
    },
    scrollTo(yyy) {//Ok?
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
  },
  watch:{
    $route (to, from){//CHANGE THIS TO PREFETCH IF POSSIBLE
      if (to.path === '/uploads') {
        this.$store.dispatch('getOwnJobs')
        console.log('getOwnJobs dispatched')
      } else
      if (to.path === '/addjob') {
        this.$store.dispatch('setAJSentState', 'none')
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

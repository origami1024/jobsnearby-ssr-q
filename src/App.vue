<template>
  <div id="q-app">
    <PwaInstall />
    <Header  />
    <keep-alive>
      <router-view class="r-view" @scrollTo="scrollTo"/>
    </keep-alive>
    <footer class="main__footer">
      <ul class="footer__ul-top">
        <li class="li1">
          <h3>{{$t('App.footerHAboutUs')}}</h3>
          <ul>
            <li><a href="#">{{$t('App.footerOurJobs')}}</a></li>
            <li><router-link to="/feedback">{{$t('App.footerAdsHere')}}</router-link></li>
          </ul>
        </li>
        <li class="li2">
          <h3>{{$t('App.footerHForSubs')}}</h3>
          <ul>
            <li><a href="#">{{$t('App.footerMailing')}}</a></li>
          </ul>
        </li>
        <li class="li3">
          <h3>{{$t('App.footerHForEmp')}}</h3>
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
          <h3 class="noshow-below550">{{$t('App.footerHContacts')}}</h3>
          <ul>
            <li>
              <a class="social-link" target="_blank" href="https://www.instagram.com/hunarmenn/">
                <svg class="social-icon insta" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                  d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
              <a class="social-link" target="_blank" href="https://t.me/hunarmenn" title="https://t.me/@hunarmenn">
                <svg class="social-icon tg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z"/>
                </svg>
              </a>
              <a class="social-link" target="_blank" href="https://vk.com/hunarmen" title="vk.com/hunarmen">
                <svg class="social-icon vk" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm.25 16.996h-2.134c-1.205 0-1.409-.687-2.401-1.679-.897-.897-1.395-.209-1.374 1.068.006.339-.161.611-.566.611-1.264 0-3.08.178-4.918-1.806-1.883-2.033-3.857-6.111-3.857-6.513 0-.237.196-.344.524-.344h2.17c.574 0 .623.284.783.649.667 1.521 2.265 4.574 2.69 2.87.244-.978.344-3.245-.703-3.44-.594-.11.452-.746 1.968-.746.377 0 .786.041 1.205.137.769.179.771.523.761 1.026-.039 1.903-.269 3.184.233 3.507.479.31 1.739-1.717 2.403-3.281.183-.433.219-.722.734-.722h2.654c1.39 0-.182 1.997-1.383 3.557-.968 1.255-.916 1.28.209 2.324.803.744 1.75 1.76 1.75 2.336.002.272-.21.446-.748.446z"/>
                </svg>
              </a>
            </li>
            <li>
              <q-btn
                class="headerBtns1 violetBtns footerLinkFB"
                to="/feedback"
                :label="$t('App.fbBtnLabel')"
              />
            </li>
          </ul>
        </li>
      </ul>
    </footer>
  </div>
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, setScrollPosition } = scroll

import Header from 'components/organisms/Header'
import PwaInstall from "components/atoms/PwaInstall";
import { mapState } from 'vuex'
export default {
  name: 'App',
  data: () => { return {
    dismiss: null
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
    onStorageUpdate(event) {//OK
      // console.log('on stoarge updoto', JSON.parse(event.newValue))
      if (event.key == 'userData') {
        let userData = JSON.parse(event.newValue)
        this.$store.dispatch('storeAuth', userData)
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
      } else
      if (to.path === '/addjob') {
        this.$store.dispatch('setAJSentState', 'none')
      }
    },
  },
  components: {
    PwaInstall,
    Header
  }
}
</script>

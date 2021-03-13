<template>
  <div class="header-wrapper">
    <header itemscope="" itemtype="http://schema.org/Organization">
      <Logo />
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
          class="headerBtns1 headerBtnRed addJobMargin550 addJobSpecific"
          text-color="white"
          :label="$t('App.newJobHint')"
          rounded
          to="/addJob"
        />
        <q-btn
          @click.native="authPls"
          v-else-if="user.role != 'subscriber'"
          class="headerBtns1 headerBtnRed addJobMargin550 addJobSpecific"
          text-color="white" 
          :label="$t('App.newJobHint')"
          to="/registration"
        />
      </div>
      <div id="authmenu">
        <div class="colx user-status-bar">
          <router-link 
            style="padding: 0 20px; font-size: 14px;
              color: #fff; line-height: 40px; text-transform: uppercase; text-decoration: none;"
            class="headerBtns1 violetBtns loginbtn"
            @click.native="$store.dispatch('regStateChange', 'login')"
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
            <q-icon name="person" style="font-size: 36px;" class="nav-icon"/>
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
      <q-ajax-bar
        position="bottom"
        color="red"
        size="10px"
      />
    </header>
  </div>
</template>

<script>
import LangChanger from 'components/atoms/LangChanger'
import Logo from 'components/atoms/Logo'
import { mapState } from 'vuex'

export default {
  name: 'Header',
  computed: {
    ...mapState(['user']),
  },
  components: {
    LangChanger,
    Logo
  },
  data () {
    return {
      dismiss: null
    }
  },
  methods: {
    authPls() {
      if (this.dismiss != null) this.dismiss()
      this.dismiss = this.$q.notify(this.$t('App.doAuthForPublishing'))
    },
    logout(retry) {
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
  }
}
</script>

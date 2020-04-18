<template>
  <div v-if="user.role === 'subscriber'" class="subprofile">
    <div class="subprofile__inner">
      <ProfileNav
        :localRoute="tab"
        @setLocalRoute="setLocalRoute"
        :localroutes="[{r: 'cv', l: $t('sub.navCV')}, {r: 'sentCVS', l: $t('sub.navSentCVs')}, {r: 'personal', l: $t('sub.navPersonal')}]"
        :localroutesX="{r: 'settings', l: $t('sub.navSettings')}"
      />
      <q-tab-panels
        class="qtpans"
        v-model="tab"
        animated
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel name="cv" class="subprofile__cv">
          
          <div class="line" style="display: flex; width: 100%;">
            <div style="width:300px; margin-bottom: 20px;">

              <label for="cvInp" class="uploaderWrapper" tabindex="0">
                <!-- class="uploaderWrapper" -->
                <input id="cvInp" ref="cvUplInp" @change="uploadCV($refs.cvUplInp.files)" type="file" style="display:none" accept=".doc, .docx, .pdf, .rtf"/>
                <span>{{$t('sub.loadCVHeader')}}</span>
              </label>
              <div class="urlpanel" style="display: flex; justify-content: space-between; align-items: center; font-size: 16px;">
                {{(user.cvurl != null && user.cvurl != '') ? $t('sub.cvurlUploaded') + ':' : $t('sub.cvurlNone')}}
                <a v-if="user.cvurl != null && user.cvurl != ''" :href="'https://docs.google.com/viewerng/viewer?url=' + user.cvurl" target="_blank">
                  <q-icon color="blue-10" size="32px" name="assignment">
                  </q-icon>
                </a>
              </div>
            </div>
          </div>
          {{user.cvurl}}
          <q-btn class="headerBtns1" v-if="user.cvurl != null && user.cvurl != ''" color="red-10" :label="$t('sub.deleteCVBtn')" @click="cvdel" />
        </q-tab-panel>
        <q-tab-panel name="sentCVS">
          <HitsList
            :cvhitsHistory="cvhitsHistory"
          />
        </q-tab-panel>
        <q-tab-panel class="subprofile__settings" name="personal">
          
          <q-input
            class="subprofile__inp"
            color="deep-purple-10"
            square outlined bottom-slots 
            v-model="userdata.username" :label="$t('sub.name')"
            counter maxlength="35"  />
          <q-input
            class="subprofile__inp"
            color="deep-purple-10"
            square outlined bottom-slots
            v-model="userdata.surname" :label="$t('sub.surname')"
            counter maxlength="35"  />
          <q-btn class="headerBtns1" color="red-10" @click="tryChangeUData" :label="$t('sub.change')"/>
        </q-tab-panel>


        <q-tab-panel class="subprofile__settings" name="settings">
          <q-input
            type="email" class="subprofile__inp" 
            square outlined bottom-slots
            color="deep-purple-10" 
            :value="user.identity"
            :label="$t('sub.email')"
            counter maxlength="50"
          />
          <q-input square color="deep-purple-10"  :type="isPwd ? 'password' : 'text'" class="subprofile__inp" outlined bottom-slots v-model="mailpw.oldpw" :label="$t('sub.oldPW')" counter maxlength="25" >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input 
            square color="deep-purple-10" 
            :type="isPwd ? 'password' : 'text'" 
            class="subprofile__inp" outlined bottom-slots 
            v-model="mailpw.newpw" :label="$t('sub.newPW')" counter maxlength="25" >
          </q-input>
          <q-btn class="headerBtns1" color="red-10" @click="tryChangePw" :label="$t('sub.change')"/>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import HitsList from 'components/organisms/HitsList.vue'
import ProfileNav from 'components/molecules/ProfileNav.vue'

import { mapState } from 'vuex'

export default {
  name: 'SubProfile',
  props: {
    ownCVs: {type: Array, default: ()=>[]},
  },
  computed: {
    ...mapState(['user']),
  },
  data: ()=>{return {
    cvhitsHistory: [],
    sentCVJobsList: [],
    cvurlnew: '',
    cv_upload_error: '',
    userdata: {
      username: '',
      surname: '',
      insearch: false
    },
    mailpw: {
      // oldemail: '', - заменено на user props из app
      newpw: '',
      oldpw: ''
    },
    isPwd: true,
    tab: 'cv'
  }},
  components: {
    HitsList,
    ProfileNav
  },
  deactivated() {
    this.$destroy()
  },
  methods: {
    getCVHitsHistory() {//OK
      let url = '/getcvhitshistory'
      this.$axios
        .post(url, null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data && response.data.rows) {
            this.cvhitsHistory = response.data.rows
          } else {
            console.log('cp124 - ошибка cvhitsHistory')
            this.$q.notify('Ошибка, не удалось получить данные')
          }
          
          //if error, show like popup or status update
      })
    },
    // getSentCVJobs() { turned off 17-APR-20 - couldnt find what runs this func
    //   let url = config.jobsUrl + '/getcvedjobs'
    //   axios
    //     .post(url, null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
    //     .then(response => {
    //       if (response.data && response.data.jobs) {
    //         this.sentCVJobsList = response.data.jobs
    //       } else console.log('cp123 - ошибка getsentcvjobs')
    //   })
    // },
    updateCVLink() {//OK
      let url = '/cvupdate.json'
      this.$axios
        .post(url, {cvurl: this.cvurlnew}, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data == 'OK') {
            this.$q.notify(this.$t('sub.dataChanged'))
            // this.$emit('cvupd', this.cvurlnew)
            this.$store.dispatch('updateCVUrl', this.cvurlnew)
            console.log(this.$store.state.user)
            localStorage.setItem('userData',JSON.stringify(this.$store.state.user))
          } else this.$q.notify(this.$t('sub.dataError'))
          this.cvurlnew = ''
          //if error, show like popup or status update
      })
    },
    cvdel() {//OK
      let url = '/cvdelete.json'
      this.$axios
        .post(url, null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data == 'OK') {
            this.$q.notify(this.$t('sub.cvDeleted'))
            this.$store.dispatch('updateCVUrl', '')
          } else this.$q.notify(this.$t('sub.dataError'))
          this.cvurlnew = ''
          //if error, show like popup or status update
      })
    },
    uploadCV(val) {//ok
      let dumper = 'https://decreed-silk.000webhostapp.com/cvu.php'
      //logoUploader
      console.log('start cvu')
      var formData = new FormData()
      formData.append("cv", val[0])
      //this.$refs.cvForm.reset()
      this.$refs.cvUplInp.value = null
      this.$axios
        .post(dumper, formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(resp => {
          if (resp.data && resp.data.startsWith('link:')) {
            this.logo_upload_error = null
            this.cvurlnew = resp.data.replace('link:', '')
            //this.$q.notify('Резюме загружено')
            this.updateCVLink()
          } else {
            console.log('error cv uploading: ', resp.data)
            if (resp.data.startsWith('Error in file size')) {
              this.cv_upload_error = this.$t('sub.cvTooBig')
              this.$q.notify(this.$t('sub.cvTooBig'))
            } else {
              this.cv_upload_error = this.$t('sub.dataError')
              this.$q.notify(this.$t('sub.dataError'))
            }
          }
          //if (response.data === 'OK') {} else 
        })
    },
    tryChangeUData() {//ok
      let url = '/changeuserstuff'
      let udata = this.userdata
      
      this.$axios
        .post(url, udata, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          console.log('tryChangeUData', response.data)
          if (response.data == 'OK') {
            // this.$emit('changeUDataSub', udata)
            this.$store.dispatch('setNameSurnameInSearch', udata)
            this.$q.notify(this.$t('sub.dataChanged'))
          }
          else this.$q.notify(this.$t('sub.wrongData'))
          //if ok show like compnenet
          //reset fields
          //error like validation
      })
    },
    tryChangePw() {
      let url = '/changepw'
      let udata = { oldmail: this.user, oldpw: this.mailpw.oldpw, newpw: this.mailpw.newpw }
      this.$axios
        .post(url, udata, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          console.log('trychpw', response.data)
          if (response.data == 'OK') {
            this.$q.notify(this.$t('sub.pwChanged'))
          }
          else this.$q.notify(this.$t('sub.wrongData'))
      })
    },
    setLocalRoute(rou) {
      if (rou == 'personal') {
        this.userdata.username = this.user.username
        this.userdata.surname = this.user.surname
        this.userdata.insearch = this.user.insearch
      } else
      if (rou == 'sentCVS') {
        //do axious shiet to get the listOfSentJobs
        this.getCVHitsHistory()
      }
      
      this.tab = rou
    },
  },
  mounted(){
    //console.log('cp11: ', this.insearch)
    this.userdata.username = this.user.username
    this.userdata.surname = this.user.surname
    this.userdata.insearch = this.user.insearch
    //this.cvurlnew = this.cvurl
  },
  // watch: {
  //   username(newu) {
  //     this.newusername = newu
  //   },
  //   surname(news) {
  //     this.newsurname = news
  //   },
  // }
}
</script>

<style scoped lang="stylus">
.qtpans
  width 100%
  min-height 75vh
  box-shadow 0 0 4px 1px var(--main-borders-color)
  border-radius 4px
.subprofile
  max-width 900px
  padding 0 10px
  padding-top 10px
  display flex
  flex-direction column
  justify-content center
  p
    margin-bottom 15px
  &__inner
    display flex
  &__inp
    width 300px
  &__header
    display flex
    justify-content flex-end
  .tabs
    // border-top-left-radius 15px
    // border-top-right-radius 15px
    justify-content center
    animation-duration 0.3s
    transition-duration 0.3s
  .subprofile__cv
    //background-color #eee
    display flex
    flex-direction column
    align-items flex-start
  .subprofile__settings
    //background-color #eee
    display flex
    flex-direction column
    align-items flex-start
  .anim1
    animation-duration 0.3s
    transition-duration 0.3s
  *
    margin 0
.uploaderWrapper
  display block
  border 1px solid rgba(0,0,0,0.24)
  padding 12px
  transition-duration 0.3s
  min-width 300px
  margin-bottom 15px
  cursor pointer
  box-sizing border-box
  background-color white//#ede7f6
  &:focus
    outline none
    box-shadow inset 0px 0px 0px 2px var(--color1) !important
  &:hover
    border-color var(--color1)
    // background-color var(--violet-btn-color)
  &:hover>.logo-placeholder
    outline 1px solid var(--color1)
    //border-color var(--color1)
</style>

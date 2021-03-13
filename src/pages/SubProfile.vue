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
        <q-tab-panel name="cv" class="subprofile__cv subProfilePaddings" @drop="cvDrop">
          
          <div class="line" style="display: flex; width: 100%;">
            <div style="max-width: 300px; width: 100%; margin-bottom: 20px;">

              <!-- <label for="cvInp" class="uploaderWrapper" tabindex="0">
                <input id="cvInp" ref="cvUplInp" @change="uploadCV($refs.cvUplInp.files)" type="file" style="display:none" accept=".doc, .docx, .pdf, .rtf"/>
                <span>{{$t('sub.loadCVHeader')}}</span>
              </label> -->
              <label for="cvInpX" class="uploaderWrapper" tabindex="0">
                <input id="cvInpX" ref="cvUplInpX" @change="uploadCVX($refs.cvUplInpX.files)" type="file" style="display:none" accept=".doc, .docx, .pdf, .rtf"/>
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
          <!-- <div style="margin-bottom: 15px;">{{user.cvurl}}</div> -->
          <div style="max-width: 300px; display: flex; width: 100%;">
            <q-btn style="margin-left: auto;" dense class="headerBtns1" v-if="user.cvurl != null && user.cvurl != ''" color="red-10" :label="$t('sub.deleteCVBtn')" @click="cvdel" />
          </div>

          <q-btn 
            v-if="user.role === 'subscriber'"
            class="headerBtns1 headerBtnRed addJobMargin550 addJobSpecific"
            text-color="white"
            :label="$t('sub.newCvHint')"
            rounded
            to="/cv/new"
          />
        </q-tab-panel>
        <q-tab-panel name="sentCVS">
          <HitsList
            :cvhitsHistory="cvhitsHistory"
          />
        </q-tab-panel>
        <q-tab-panel class="subprofile__settings subProfilePaddings" name="personal">
          <label for="subprofile__uname" class="input-label">{{$t('sub.name')}}</label>
          <q-input
            for="subprofile__uname"
            class="subprofile__inp"
            color="deep-purple-10"
            bg-color="white"
            dense outlined bottom-slots
            v-model="userdata.username"
            :placeholder="$t('sub.namePh')"
            counter maxlength="35"  />
          <label for="subprofile__usurname" class="input-label">{{$t('sub.surname')}}</label>
          <q-input
            for="subprofile__usurname"
            class="subprofile__inp"
            color="deep-purple-10"
            bg-color="white"
            dense outlined bottom-slots
            v-model="userdata.surname"
            :placeholder="$t('sub.surnamePh')"
            counter maxlength="35"  />
          <q-btn class="headerBtns1" color="red-10" @click="tryChangeUData" :label="$t('sub.change')"/>
        </q-tab-panel>


        <q-tab-panel class="subprofile__settings subProfilePaddings" name="settings">
          <label for="subprofile__email" class="input-label">{{$t('sub.email')}}</label>
          <q-input
            for="subprofile__email"
            type="email" class="subprofile__inp" 
            dense outlined bottom-slots
            color="deep-purple-10"
            bg-color="white"
            :value="user.identity"
            readonly
            placeholder="aa@bb.cc"
            counter maxlength="50"
          />
          <label for="subprofile__oldPW" class="input-label">{{$t('sub.oldPW')}}</label>
          <q-input for="subprofile__oldPW" placeholder="******" dense color="deep-purple-10" bg-color="white" :type="isPwd ? 'password' : 'text'" class="subprofile__inp" outlined bottom-slots v-model="mailpw.oldpw" counter maxlength="25" >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <label for="subprofile__newPW" class="input-label">{{$t('sub.newPW')}}</label>
          <q-input
            for="subprofile__newPW"
            color="deep-purple-10"
            bg-color="white"
            dense
            placeholder="******"
            :type="isPwd ? 'password' : 'text'" 
            class="subprofile__inp" outlined bottom-slots 
            v-model="mailpw.newpw" counter maxlength="25" >
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
    // sentCVJobsList: [],
    cvurlnew: '',
    cv_upload_error: '',
    userdata: {
      username: '',
      surname: '',
      insearch: false
    },
    mailpw: {
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
    cvDrop(e) {
      if (e.dataTransfer.files.length == 1) {
        let n = e.dataTransfer.files[0].name
        let ext = n.substr(n.lastIndexOf(".")).toLowerCase()
        if (['.doc','.docx','.pdf','.rtf','.md','.txt'].includes(ext)) {
          this.uploadCV(e.dataTransfer.files)
        } else this.$q.notify('Неправильный формат файла')
        window.console.log(e.dataTransfer.files[0])
      }
      window.console.log(e)
    },
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

      })
    },
    // updateCVLink() {//OK
    //   let url = '/cvupdate.json'
    //   this.$axios
    //     .post(url, {cvurl: this.cvurlnew}, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
    //     .then(response => {
    //       if (response.data == 'OK') {
    //         this.$q.notify(this.$t('sub.dataChanged'))
    //         // this.$emit('cvupd', this.cvurlnew)
    //         this.$store.dispatch('updateCVUrl', this.cvurlnew)
    //         console.log(this.$store.state.user)
    //         localStorage.setItem('userData',JSON.stringify(this.$store.state.user))
    //       } else this.$q.notify(this.$t('sub.dataError'))
    //       this.cvurlnew = ''
    //       //if error, show like popup or status update
    //   })
    // },
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
    // uploadCV(val) {//ok
    //   let dumper = 'https://decreed-silk.000webhostapp.com/cvu.php'
    //   //logoUploader
    //   console.log('start cvu')
    //   var formData = new FormData()
    //   formData.append("cv", val[0])
    //   //this.$refs.cvForm.reset()
    //   this.$refs.cvUplInp.value = null
    //   this.$axios
    //     .post(dumper, formData, {
    //       headers: {'Content-Type': 'multipart/form-data'}
    //     })
    //     .then(resp => {
    //       if (resp.data && resp.data.startsWith('link:')) {
    //         this.logo_upload_error = null
    //         this.cvurlnew = resp.data.replace('link:', '')
    //         //this.$q.notify('Резюме загружено')
    //         this.updateCVLink()
    //       } else {
    //         console.log('error cv uploading: ', resp.data)
    //         if (resp.data.startsWith('Error in file size')) {
    //           this.cv_upload_error = this.$t('sub.cvTooBig')
    //           this.$q.notify(this.$t('sub.cvTooBig'))
    //         } else {
    //           this.cv_upload_error = this.$t('sub.dataError')
    //           this.$q.notify(this.$t('sub.dataError'))
    //         }
    //       }
    //       //if (response.data === 'OK') {} else 
    //     })
    // },
    uploadCVX(files) {//ok
      // let dumper = 'https://decreed-silk.000webhostapp.com/cvu.php'
      if (files && files[0]) {
        if (files[0].size < 409601) {
          let url1 = '/cvupdx.json'
          var formData = new FormData()
          formData.append("cv", files[0])

          this.$axios
            .post(url1, formData, {
              headers: {'Content-Type': 'multipart/form-data'}
            })
            .then(resp => {
              console.log('cp CVX', resp)
              if (resp.data && resp.data.success === true && resp.data.link) {
                this.$store.dispatch('updateCVUrl', resp.data.link)
                this.$q.notify(this.$t('sub.dataChanged'))
                localStorage.setItem('userData',JSON.stringify(this.$store.state.user))

              } else {
                this.$q.notify(this.$t('sub.dataError'), resp.data.msg)
                this.$refs.cvUplInpX.value = ''
              }
            })

        } else {
          
          this.$q.notify(this.$t('sub.cvTooBig'))
          this.$refs.cvUplInpX.value = ''
        }
        
      }
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
    tryChangePw() {//ok
      let url = '/changepw'
      let udata = { oldmail: this.user.identity, oldpw: this.mailpw.oldpw, newpw: this.mailpw.newpw }
      this.$axios
        .post(url, udata, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          // console.log('trychpw', response.data)
          if (response.data == 'OK') {
            this.$q.notify(this.$t('sub.pwChanged'))
          }
          else this.$q.notify(this.$t('sub.wrongData'))
      })
    },
    setLocalRoute(rou) {//ok
      if (rou == 'personal') {
        
        this.userdata.username = this.user.name
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
    this.userdata.username = this.user.name
    this.userdata.surname = this.user.surname
    this.userdata.insearch = this.user.insearch

    //без этого дропать файлы нельзя
    window.addEventListener("dragover",function(e){
      e = e || event;
      e.preventDefault()
    },false)
    window.addEventListener("drop",function(e){
      e = e || event;
      e.preventDefault()
    },false)
  },
}
</script>

<style scoped lang="stylus">
.qtpans
  width 100%
  min-width 864px
  min-height 60vh
  background var(--menubg-color)
  border: 0.5px solid #C2C2C6
  box-sizing: border-box
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
  @media screen and (max-width 550px)
    min-width auto
.subprofile
  max-width 900px
  padding 0 10px
  padding-top 10px
  display flex
  flex-direction column
  justify-content center
  @media screen and (max-width 550px)
    padding 20px
    padding-top 0
    min-width 100%
  p
    margin-bottom 15px
  &__inner
    display flex
    @media screen and (max-width 550px)
      flex-direction column
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
  border 1px dashed gray
  border-radius 10px
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
    color var(--color1)
    // background-color var(--violet-btn-color)
  &:hover>.logo-placeholder
    outline 1px solid var(--color1)
    //border-color var(--color1)
  @media screen and (max-width 550px)
    min-width auto
    width 100%
.input-label
  color var(--color1)
  font-family: Montserrat, sans-serif
  font-weight: 500;
  font-size: 15px;
  line-height: 17px;
  text-align: left;
  margin-bottom: 7px;
  display: block
.subprofile__inp
  width 100%

.subProfilePaddings
  padding: 40px 80px 35px 80px
  @media screen and (max-width 550px)
    padding 30px 34px
</style>
<style lang="stylus">
.subprofile__inp .q-field--outlined .q-field__control:before
  border 0 !important
.subprofile__inp .q-field__control
  // outline 2px solid orange
  font-size: 15px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
.subprofile__inp .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.subprofile__inp .q-field__native input
  height 36px
.subprofile__inp .q-field__append
  height 36px
.subprofile__inp .q-field__bottom
  padding-right 0

.subprofile__inp .q-input
  margin-bottom 0px !important
</style>

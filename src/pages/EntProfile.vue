<template>
  <div v-if="user.role === 'company'" class="entprofile">
    <p class="pageHeader" >{{$t('entProfile.entProfileTitle')}}</p>
    <div class="entprofile__inner">
      <ProfileNav
        :localRoute="tab"
        @setLocalRoute="setLocalRoute"
        :localroutes="[{r: 'published', l: $t('entProfile.navPublishedLabel')}, {r: 'responses', l: $t('entProfile.navResponsesLabel'), badges: newcvhitscount}, {r: 'cabout', l: $t('entProfile.navAboutLabel')}]"
        :localroutesX="{r: 'settings', l: $t('entProfile.navSettingsLabel')}"
      />
      <q-tab-panels
        class="qtpans"
        @before-transition="changeTabs"
        v-model="tab"
        animated
      >
        <q-tab-panel name="published" class="entprofile__published entprofile__mid">
          <h4 class="entprofile__header">{{$t('entProfile.publishedHeader')}}({{user.ownJobs.length}}):</h4>
          <JobsStats/>
        </q-tab-panel>
        <q-tab-panel name="responses" class="entprofile__mid" style="display: flex; padding: 60px 80px 35px 80px;">
          <div class="line" style="width: 100%; border-radius: 10px;">
            <!-- expand-icon="none" -->
            <q-expansion-item
              v-for="item in Object.keys(respsJreformat)"
              :key="item"
              class="respExps"
              style="background-color: white; border-radius: 10px; margin-bottom: 10px;"
            >
              <template v-slot:header>
                <div style="display: flex; align-items: center; font-weight: 500;">
                <a class="responseLinkLvl1" :href="'/jobpage?id=' + item" target="_blank" style="display: flex;">
                  {{resps.find(val=>val.cvjob_id == item).title}}
                </a>
                <span style="margin-left: 5px; font-family: Montserrat, sans-serif; font-size: 14px; line-height: 17px;">({{respsJreformat[item].cvhits.length}})</span>
                </div>
                <q-badge v-if="respsJreformat[item].hasNew > 0" style="background-color: var(--btn-color); border-radius: 100%; margin-left: auto; width: 23px; height: 23px; text-align: center; justify-content: center; border-font-family: Montserrat, sans-serif; font-weight: bold; font-size: 14px; line-height: 17px; color: white; align-self: start;"  :label="respsJreformat[item].hasNew"/>
              </template>
              
              <ol style="padding: 8px 15px; padding-bottom: 15px; margin: 0 28px; font-family: Montserrat, sans-serif; font-size: 14px; line-height: 17px;">
                <li style="background-color: white !important; text-align: left; margin-bottom: 7px;" v-for="hit in respsJreformat[item].cvhits" :key="hit" :style="{backgroundColor: resps.find(val=>val.cvhit_id == hit).date_checked == null ? 'var(--color-graypink)' : 'white'}">
                  <span style="display: block; margin-bottom: 6px;">
                    <a class="responseLinkLvl2" @click="viewHit(hit)" :href="'https://docs.google.com/viewerng/viewer?url=' + resps.find(val=>val.cvhit_id == hit).cv_url" target="_blank">
                      {{
                        resps.find(val=>val.cvhit_id == hit).name + ' ' + 
                        resps.find(val=>val.cvhit_id == hit).surname
                      }}
                    </a>
                    <span class="newhit" v-if="resps.find(val=>val.cvhit_id == hit).date_checked == null">*</span>
                  </span>
                  <div style="margin-bottom: 3px;">
                    {{
                      $t('entProfile.cvSent') + ' ' +
                      formatDate(resps.find(val=>val.cvhit_id == hit).date_created)
                    }}
                  </div>
                  <div>
                    {{
                      resps.find(val=>val.cvhit_id == hit).date_checked != null
                        ? $t('entProfile.cvSeen') + ' ' + formatDate(resps.find(val=>val.cvhit_id == hit).date_checked)
                        : $t('entProfile.cvNotSeen')
                    }}
                    <!-- <q-btn
                      style="margin-left: 5px; background-color: var(--violet-btn-color); color: white;"
                      v-if="resps.find(val=>val.cvhit_id == hit).date_checked == null"
                      round
                      size="sm"
                      icon="visibility"
                      @click="viewHit(hit)"
                    /> -->
                  </div>
                </li>
              </ol>
              
            </q-expansion-item>
            <div v-if="resps.length == 0">Пока нет ни одного отклика</div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="cabout" class="entprofile__mid" style="padding: 60px 80px 35px 80px;">
          <div>
            <label for="companyInp" class="cabout-label">{{$t('entProfile.cname')}}</label>
            <q-input
              for="companyInp"
              class="entprofile__inp"
              dense outlined bottom-slots
              bg-color="white" color="deep-purple-10"
              :value="cabout.company"
              :placeholder="$t('entProfile.cPh')"
              @input="$store.dispatch('caboutPropUpd', {prop: 'company', value: $event})"
              counter maxlength="80"
            />
          </div>
          <div class="line" ref="fileInputWrap" style="display: flex; width: 100%; justify-content: space-between;" @drop="picDrop" >
            <div style="width:100%">
              <label for="fileInp" class="cabout-label">{{$t('entProfile.dragLogo')}}</label>
              <label class="uploaderWrapper" tabindex="0">
              <input id="fileInp" ref="fileInput" @change="readUrl($refs.fileInput.files)" type="file" style="display:none" accept=".gif,.jpg,.jpeg,.png,.webp,.svg"/>
              <div class="logo-placeholder" :style="{ 'background-image' : `url('${ cabout.logo_url ? cabout.logo_url : 'statics/logoph.png'}')` } " ></div>
              </label>
            </div>
          </div>
          <label for="siteInp" class="cabout-label">{{$t('entProfile.siteLabel')}}</label>
          <q-input for="siteInp" :placeholder="$t('entProfile.sitePh')" bg-color="white" color="deep-purple-10" dense class="entprofile__inp" outlined :value="cabout.website" @input="$store.dispatch('caboutPropUpd', {prop: 'website', value: $event})" counter maxlength="80"/>
          <label for="domainsInp" class="cabout-label">{{$t('entProfile.catPH')}}</label>
          <q-select
            for="domainsInp"
            multiple
            use-chips
            outlined
            dropdown-icon="none"
            class="entprofile__domains-inp dropdown-padding-adjust"
            bg-color="white" color="deep-purple-10"
            :style="{width: '100%'}"
            max-values="3"
            :value="cabout.domains"
            @input="$store.dispatch('caboutPropUpd', {prop: 'domains', value: $event})"
            :options="$t('entProfile.companyDomains')"
            :hint="null"
          />
          <label for="descInp" class="cabout-label">{{$t('entProfile.descLabel')}}</label>
          <q-input
            for="descInp"
            class="entprofile__desc-inp"
            :value="cabout.full_description"
            @input="$store.dispatch('caboutPropUpd', {prop: 'full_description', value: $event})"
            outlined dense bg-color="white" color="deep-purple-10"
            type="textarea"
            counter maxlength="2000"
            :placeholder="$t('entProfile.descPh')"
          />
          <q-btn 
            class="headerBtns1" 
            style="margin-top: 10px; align-self: center; background-color: var(--violet-btn-color); color: white; font-size: 12px; font-height: 15px;"
            @click="updateCompanyData"
          >
            {{$t('entProfile.sendChanges')}}
          </q-btn>
        </q-tab-panel>
        <q-tab-panel class="entprofile__settings entprofile__mid" name="settings" style="padding: 60px 80px 35px 80px;">
          <h3 style="width: 100%; marginBottom: 10px; text-align: center;">{{$t('entProfile.settingsLabel')}} <strong>{{user.company}}</strong></h3>
          <label for="descInp" class="cabout-label">{{$t('entProfile.emailLabel')}}</label>
          <q-input color="deep-purple-10" bg-color="white" type="email" class="entprofile__inp" placeholder="aa@bb.cc" dense outlined bottom-slots :value="user.identity" counter maxlength="50" />
          <label for="descInp" class="cabout-label">{{$t('entProfile.oldPWLabel')}}</label>
          <q-input color="deep-purple-10" placeholder='******' bg-color="white" :type="isPwd ? 'password' : 'text'" class="entprofile__inp" dense outlined bottom-slots v-model="oldpw" counter maxlength="25">
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <label for="descInp" class="cabout-label">{{$t('entProfile.newPWLabel')}}</label>
          <q-input dense bg-color="white" color="deep-purple-10" :type="isPwd ? 'password' : 'text'" class="entprofile__inp" outlined bottom-slots v-model="newpw" placeholder="******" counter maxlength="25"/>
          <q-btn color="red-10" class="headerBtns1 headerBtnRed" @click="tryChangePw" :label="$t('entProfile.changeSettingsBtn')"/>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>


import JobsStats from 'components/organisms/JobsStats.vue'
import ProfileNav from 'components/molecules/ProfileNav.vue'

import { mapState } from 'vuex'


export default {
  name: 'EntProfile',
  data() {return {
    respsJreformat: [],
    resps: [],
    logo_upload_error: null,
    logofile: null,
    oldpw: '',
    newpw: '',
    isPwd: true,
    tab: 'published',
  }},
  computed: {
    ...mapState(['user']),
    ...mapState(['cabout']),
    newcvhitscount() {
      var count = 0
      for(var i = 0; i < this.resps.length; ++i){
        if(this.resps[i].date_checked == null)
          count++;
      }
      return count
    }
  },
  deactivated() {
    this.$destroy()
  },
  components: {
    JobsStats,
    ProfileNav
  },
  methods: {
    picDrop(e) {//ok
      if (e.dataTransfer.files.length == 1) {
        let n = e.dataTransfer.files[0].name
        let ext = n.substr(n.lastIndexOf(".")).toLowerCase()
        if (['.gif','.jpg','.jpeg','.png','.webp','.svg'].includes(ext)) {
          this.readUrl(e.dataTransfer.files)
        } else this.$q.notify('Неправильный формат картинки')
        window.console.log(e.dataTransfer.files[0])
      }
      window.console.log(e)
    },
    readUrl(files) {//ok
      if (files && files[0]) {
        this.logofile = files[0]
      
        let dumper = 'https://decreed-silk.000webhostapp.com/outer.php'
        console.log('start uploa1')
        var formData = new FormData()
        formData.append("image", this.logofile)
        this.$axios
          .post(dumper, formData, {
            headers: {'Content-Type': 'multipart/form-data'}
          })
          .then(resp => {
            if (resp.data && resp.data.startsWith('link:')) {
              this.logo_upload_error = null
              // this.cabout.logo_url = )
              this.$store.dispatch('caboutPropUpd',{prop: 'logo_url', value: resp.data.replace('link:', '')})
              this.$q.notify(this.$t('entProfile.picLoaded'))
              // console.log(this.cabout.logo_url)
              this.updateCompanyPic()
            } else {
              console.log('error uploading: ', resp.data)
              if (resp.data.startsWith('Error in file size')) {
                this.logo_upload_error = this.$t('entProfile.picTooBig')
                this.$q.notify(this.$t('entProfile.picTooBig'))
              }
            }
          })
      }
    },
    viewHit(hit) {//ok
      if (this.resps.find(val=>val.cvhit_id == hit).date_checked == null) {
        let url = '/viewhit'
        this.$axios
          .post(url, [hit], {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            if (response.data == 'OK') {
              this.resps.find(val=>val.cvhit_id == hit).date_checked = Date.now()
              //this.$q.notify('Пароль изменен')
            }
            // else this.$q.notify('Неправильные данные')
        })
      } else console.log('trying to hit second time')
    },
    formatDate(e) {//ok
      let d = new Date(e)
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    },
    getResps() {//ok
      let url = '/getresps'
      this.$axios
        .post(url, null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data && response.data.rows) {
            this.resps = response.data.rows
            let dic1 = { 
            }
            for (let x of response.data.rows) {
              dic1[x.cvjob_id] = {}
              dic1[x.cvjob_id]['cvhits'] = []
              dic1[x.cvjob_id]['hasNew'] = 0
            }
            
            for (let x of response.data.rows) {
              dic1[x.cvjob_id]['cvhits'].push(x.cvhit_id)
              //console.log(JSON.stringify(x))
              if (x.date_checked == null) {
                dic1[x.cvjob_id]['hasNew'] += 1
              }
            }
            this.respsJreformat = dic1
          }
      })
    },
    tryChangePw() {//ok
      let url = '/changepw'
      let udata = { oldmail: this.user.identity, oldpw: this.oldpw, newpw: this.newpw }
      this.$axios
        .post(url, udata, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data == 'OK') {
            this.$q.notify(this.$t('entProfile.pwChanged'))
          }
          else this.$q.notify(this.$t('entProfile.pwWrongData'))
      })
    },
    updateCompanyData() {//ok
      let url = '/companyUpdate.json'
      this.$axios
        .post(url, this.cabout, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data == 'OK') {
            this.$q.notify(this.$t('entProfile.dataChanged'))
          } else this.$q.notify(this.$t('entProfile.dataError'))
      })
    },
    updateCompanyPic() {//ok
      let url = '/companyupdpic.json'
      this.$axios
        .post(url, {logo_url: this.cabout.logo_url}, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data == 'OK') {
            this.$q.notify(this.$t('entProfile.picUploaded'))
          } else this.$q.notify(this.$t('entProfile.dataError'))
      })
    },
    changeTabs(newT) {//ok
      //if (newT == 'published') this.$emit('getOwnJobs')
      newT != 'published' || this.$store.dispatch('getOwnJobs')
    },
    setLocalRoute(rou) {
      if (rou == 'cabout') {
        this.logo_upload_error = null
        this.$store.dispatch('getOwnCAbout')
      } else
      if (rou == 'responses') {
        this.getResps()
      }
      this.tab = rou
    },
  },
  mounted(){
    //без этого дропать файлы нельзя
    window.addEventListener("dragover",function(e){
      e = e || event;
      e.preventDefault()
    },false)
    window.addEventListener("drop",function(e){
      e = e || event;
      e.preventDefault()
    },false)
    this.$store.dispatch('getOwnJobs')
    setTimeout(()=>{this.getResps()},100)
  },
  watch: {//ok
    $route (to, from){
      if (to.path === '/entprofile') {
        if (this.tab == 'cabout') {
          this.$store.dispatch('getOwnCAbout')
        }      
      }
    }
  }
}
</script>

<style scoped lang="stylus">
.qtpans
  width 100%
  min-width 864px
  min-height 60vh
  // box-shadow 0 0 4px 1px var(--main-borders-color)
  // border-radius 4px
  background var(--menubg-color)
  border: 0.5px solid #C2C2C6
  box-sizing: border-box
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
.entprofile
  max-width 900px
  padding 20px 0px
  padding-top 5px
  display flex
  flex-direction column
  justify-content center
  &__inner
    display flex
  &__mid
    width 100%
  p
    margin-bottom 15px
  &__inp
    width 100%
    margin-bottom 12px !important
  &__header
    display flex
    justify-content flex-end
    align-self center
    font-size 18px
    padding-bottom 15px
  .tabs
    // border-top-left-radius 15px
    // border-top-right-radius 15px
    justify-content center
    animation-duration 0.3s
    transition-duration 0.3s
  .entprofile__published
    width 100%
    //background-color #eee
    display flex
    flex-direction column
    align-items flex-start
  .entprofile__settings
    //background-color #eee
    display flex
    flex-direction column
    align-items flex-start
  .anim1
    animation-duration 0.3s
    transition-duration 0.3s
  .logo-placeholder
    min-width 110px
    min-height 110px
    // height 90px
    // line-height 90px
    max-height 110px
    //background-size 180px 80px
    //box-shadow 0 0 3px 0
    //line-height 50px
    background-size contain
    background-repeat no-repeat
    background-position center
    // outline 1px solid rgba(0,0,0,0.24)
    box-sizing border-box
    transition-duration 0.3s
    // background-image url('~assets/logoph.jpg')
  .responseLinkLvl1
    color var(--color1)
    text-decoration none
    // margin-right 10px
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    font-family: Montserrat, sans-serif
    font-weight: normal;
    font-size: 14px;
    line-height: 17px;
    font-weight: 500;
    &:hover
      color var(--btn-color) !important
  .responseLinkLvl2
    color var(--violet-btn-color)
    text-align left
    font-family: Montserrat, sans-serif
    font-weight: normal;
    font-size: 14px;
    line-height: 17px;
    margin-right 5px
    margin-bottom 5px
    &:hover
      color var(--btn-color) !important
  *
    margin 0
.uploaderWrapper
  display block
  // border 1px solid rgba(0,0,0,0.24)
  padding 10px
  transition-duration 0.3s
  min-width 130px
  width 130px
  height 130px
  margin-bottom 15px
  cursor pointer
  box-sizing border-box
  background-color white//#ede7f6
  border: 1px dashed #A7A7A7
  border-radius 10px
  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1)
  &:focus
    outline none
    box-shadow inset 0px 0px 0px 2px var(--color1) !important
  &:hover
    border-color var(--color1)
    // background-color var(--violet-btn-color)
  &:hover>.logo-placeholder
    outline 1px dashed var(--color1)
    //border-color var(--color1)

.newhit
  color red
.cabout-label
  color var(--color1)
  font-family: Montserrat, sans-serif
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;
  margin-bottom: 7px;
  display: block

</style>
<style lang="stylus">
.q-tab-panel .q-item.q-focusable .q-focus-helper
  border-radius 10px
  &:hover
    background-color var(--violet-light) !important
.respExps .q-item
  display flex
  justify-content space-between
  &:hover
    background-color var(--violet-light) !important
    border-radius 10px
.respExps .q-item .q-item__section
  padding-right 0
  border-radius 10px
.respExps .q-item
  padding 7px 10px 7px 17px !important
  min-height 37px
  border-radius 10px
.respExps .q-expansion-item__toggle-icon
  height 17px
.respExps.q-expansion-item--expanded a.responseLinkLvl1
  font-weight bold !important
  
//инпуты для cabout
.entprofile .q-field--outlined .q-field__control:before
  border 0 !important
.entprofile__inp .q-field__control
  // outline 2px solid orange
  font-size: 12px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
.entprofile__inp .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.entprofile__inp .q-field__native input
  height 36px
.entprofile__inp .q-field__append
  height 36px
.entprofile__inp .q-field__bottom
  padding-right 0

.entprofile .q-input
  margin-bottom 0px !important

.entprofile__desc-inp .q-field__control
  // outline 2px solid orange
  font-size: 12px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  padding 10px
  min-height 160px !important
.entprofile__desc-inp .q-field__native
  padding 0 !important
.entprofile__desc-inp .q-field__bottom
  padding-right 0

.entprofile__domains-inp .q-field__control
  font-size: 12px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  padding 0px
  min-height 36px !important
.entprofile__domains-inp .q-field__native
  padding 0 !important
  min-height 36px !important
  // height 36px !important
.entprofile__domains-inp .q-field__bottom
  padding-right 0
.entprofile__domains-inp .q-field__append
  height 36px
  // display none !important
.entprofile__domains-inp .q-select__dropdown-icon
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position center center
.dropdown-padding-adjust .q-field__control
  padding-right 4px !important

.entprofile .headerBtns1
  font-weight 500 !important



.entprofile .expansion1 .q-item__section--side
  display none
.entprofile .expansion1 .q-item__section--main
  height 22px
  margin-left auto
  border-bottom 1px solid var(--violet-btn-color)
  max-width fit-content
  padding-right 14px
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position right 1px center
.entprofile .expansion1 .q-expansion-item__container .q-link.q-item--dense
  height 22px !important
  padding 0
.entprofile .expansion1 .q-expansion-item__container .q-focus-helper
  height 22px !important
  padding 0
</style>

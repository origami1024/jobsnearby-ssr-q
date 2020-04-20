<template>
  <div class="addJob">
    <transition name="bounce">
      <div v-if="user.role === 'company' && props.sent == 'none'" class="jobpage__wrapper" :key="1">
        <p style="fontSize: 20px; marginBottom: 22px" v-if="props.newJobsPageType === 'new'">{{$t('addJob.pTypeNewLabel')}}</p>
        <p style="fontSize: 20px; marginBottom: 22px" v-else>{{$t('addJob.pTypeEditLabel')}}</p>
        <div class="line">
          <p class="star">*</p>
          <p class="startP" style="min-width: 140px; textAlign: left">{{$t('addJob.titleLabel')}}</p>
          <q-input
            square
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            :style="{width: '100%'}"
            :hint="null"
            v-model="job.title"
            ref="title"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addJob.titleValidationRequired'),
              val => (lazyRulesAll || val.length > 1) || $t('addJob.titleValidationMin'),
              val => val.length < 76 || $t('addJob.titleValidationMax'),
              val => /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\+\$\%\(\)\№\:\#\/]*$/.test(val) || $t('addJob.titleValidationSymbols'),
              ]"
            :lazy-rules="lazyRulesAll"
            
          />
        </div>
        <div class="line">
          <p class="star">*</p>
          <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.salaryLabel')}}</p>
          <q-input
            :disable="salaryOn"
            :style="{width: '110px', marginRight: '10px'}"
            square dense outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.salary_min"
            ref="salary_min"
            :placeholder="$t('addJob.salaryMinPH')" :hint="null"
            @input="salaryValidated = true; $refs.salary_max.validate()"
            :rules="[sal => (sal >= 0 && String(sal).length < 6 && sal < 100000) || $t('addJob.salaryValidationRange')]"
          />
          <q-input
            :disable="salaryOn"
            :style="{width: '110px', marginRight: '10px'}"
            square dense outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.salary_max"
            ref="salary_max"
            :placeholder="$t('addJob.salaryMaxPH')" :hint="null"
            @input="salaryValidated = true"
            :rules="[
              sal => (sal >= 0 && String(sal).length < 6 && sal < 100000) || $t('addJob.salaryValidationRange'),
              sal => salaryValidated || $t('addJob.salaryValidationEnter')
            ]"
          />
          <q-select
            :disable="salaryOn"
            square
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.currency"
            style="width: 95px; lineHeight: 3.2;color: white !important"
            :options="[
              {label: $t('addJob.manat'), value: 'm'},
              {label: $t('addJob.dollars'), value: '$'},
            ]"
            :hint="null"
          />
          <q-checkbox
            style="marginBottom: 12px; alignSelf: center"
            color="red-10"
            v-model="salaryOn"
            @input="$refs.salary_min.resetValidation();
            $refs.salary_max.resetValidation();
            salaryValidated = true"
          >
            <q-tooltip>
              <p style="font-size: 15px; margin: 0">{{$t('addJob.salaryCB1Hint')}}</p>
            </q-tooltip>
          </q-checkbox>
        </div>
        <div class="line">
          <p class="star">*</p>
          <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.contactsLabel')}}</p>
          <q-input
            square dense outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.contact_mail"
            :placeholder="$t('addJob.emailPH')"
            type="email"
            style="marginRight: 10px"
            :hint="null"
            ref="contact_mail"
            @input="contactsValidated = true; $refs.contact_mail.validate()"
            :rules="[
              val => val.length < 41 || $t('addJob.emailValidationLength'),
              val => (val.length < 1 || isValidMail(val)) || $t('addJob.emailValidationFormat'),
              val => contactsValidated || $t('addJob.emailValidationEnter')
              ]"
            :lazy-rules="lazyRulesAll"
          />
          <q-input
            square
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.contact_tel"
            :placeholder="$t('addJob.telPH')"
            type="tel"
            :hint="null"
            ref="contact_tel"
            @input="contactsValidated = true; $refs.contact_mail.validate()"
            :rules="[
              val => val.length < 16 || $t('addJob.telValidationLengthMax'),
              val => (val.length == 0 || val.length > 4) || $t('addJob.telValidationLengthMin'),
              val => (val.length < 1 || /^[\+0-9\-\(\)]*$/.test(val)) || $t('addJob.telValidationFormat'),
            ]"
            :lazy-rules="lazyRulesAll"
          />
        </div>
        <div class="line">
          <!-- <p class="startP">Город</p> -->
          <p class="star"> </p>
          <p class="startP" style="width: 140px; min-width: 140px; textAlign: left">{{$t('addJob.jcatLabel')}}</p>
          <q-select
            v-model="job.jcategory"
            style="width: 100%"
            square
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            :options="$t('App.jcats')"
            :hint="null"
          />
        </div>
        <div class="line">
          <!-- <p class="startP">Город</p> -->
          <p class="star"> </p>
          <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.cityLabel')}}</p>
          <q-select
            :value="job.city"
            @input="cityUpd"
            square
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            use-input
            input-debounce="0"
            fill-input
            hide-selected
            ref="city"
            :options="cityOptions"
            @filter="filterFn"
            :hint="null"
            @keyup="addNewCity"
            :rules="[
              val => val.length < 71 || $t('addJob.cityValidationLength'),
              val => /^[a-zA-Zа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\(\)]*$/.test(val) || $t('addJob.cityValidationFormat')
            ]"
            :lazy-rules="lazyRulesAll"
          />
        </div>
        <p style="fontSize: 16px; marginBottom: 10px">{{$t('addJob.descLabel')}}<span style="color: #c10015"> {{descError}}</span></p>
        <div class="line">
          
          <div class="desc-col-wrap" style="textAlign: left; width: 100%">
            <q-no-ssr placeholder="Loading Your Editor...">
              <!-- <vue-editor
                v-model="job.description"
                @blur="descBlur"
                @input="descUpd"
                :editorToolbar="customToolbar"
              /> -->
            </q-no-ssr>
            <div class="hint" :style="{color: job.description.length > 2000 ? '#c10015' : 'inherit'}">{{job.description.length}} / 2000</div>
          </div>
        </div>
        <q-expansion-item
          ref="exp1"
          expand-separator
          :label="$t('addJob.moreLabel')"
          style="marginBottom: 10px; font-size: 16px;text-align:right;"
        >
        
          <div class="line" style="marginTop: 10px">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.expLabel')}}</p>
            <q-select
              v-model="job.experience"
              style="width: 180px"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              :options="$t('App.expOpts')"
              :hint="null"
            />
          </div>
          <div class="line">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.jobTypeLabel')}}</p>
            <q-select
              v-model="job.jtype"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              :options="$t('App.jtypeOptions')"
              :hint="null"
              style="width: 180px"
            />
          </div>
          <div class="line">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.ageLabel')}}</p>
            <q-input
              :style="{width: '110px', marginRight: '10px'}"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.age1"
              ref="age1"
              :placeholder="$t('addJob.genericFrom')"
              :hint="null"
              :rules="[
                val => isNaN(val) == false || $t('addJob.genericEnterNumber'),
                val => (val == undefined || val == '' || val >= 18) || $t('addJob.genericFrom18'),
                val => val < 100 || $t('addJob.genericTooMuch'),
              ]"
              :lazy-rules="lazyRulesAll"
            />
            <q-input
              :style="{width: '110px', marginRight: '10px'}"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.age2"
              :placeholder="$t('addJob.genericTo')"
              :hint="null"
              ref="age2"
              :rules="[
                val => isNaN(val) == false || $t('addJob.genericEnterNumber'),
                val => (val == undefined || val == '' || val >= 18) || $t('addJob.genericFrom18'),
                val => val < 100 || $t('addJob.genericTooMuch'),
              ]"
              :lazy-rules="lazyRulesAll"
            />
          </div>
          <div class="line">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.labelSchedule')}}</p>
            <q-input
              :style="{width: '110px', marginRight: '10px'}"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.worktime1"
              ref="worktime1"
              :placeholder="$t('addJob.genericFrom')"
              :hint="null"
              :rules="[
                val => isNaN(val) == false || $t('addJob.genericEnterNumber'),
                val => val == (val | 0) || $t('addJob.genericWholeNumber'),
                val => (val == undefined || val == '' || val >= 0) || $t('addJob.genericPositiveNumber'),
                val => val < 25 || $t('addJob.generic24Max'),
              ]"
              :lazy-rules="lazyRulesAll"
            />
            <q-input
              :style="{width: '110px', marginRight: '10px'}"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.worktime2"
              :placeholder="$t('addJob.genericTo')"
              :hint="null"
              ref="worktime2"
              :rules="[
                val => isNaN(val) == false || $t('addJob.genericEnterNumber'),
                val => val == (val | 0) || $t('addJob.genericWholeNumber'),
                val => (val == undefined || val == '' || val >= 0) || $t('addJob.genericPositiveNumber'),
                val => val < 25 || $t('addJob.generic24Max'),
              ]"
              :lazy-rules="lazyRulesAll"
            />
            <q-select
              :value="job.schedule"
              @input="scheduleUpd"
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              style="max-width: 110px"
              use-input
              input-debounce="0"
              fill-input
              hide-selected
              :placeholder="$t('addJob.schedulePH')"
              ref="schedule"
              :options="scheduleOptions"
              @filter="filterSchedule"
              :hint="null"
              @keyup="addNewSchedule"
              :rules="[
                val => val.length < 11 || $t('addJob.scheduleValidationLengthMax'),
                val => /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\(\)\\\/]*$/.test(val) || $t('addJob.scheduleValidationFormat')
              ]"
              :lazy-rules="lazyRulesAll"
            />
          </div>
          <div class="line">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.eduLabel')}}</p>
            <q-input
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.edu"
              style="marginRight: 10px"
              :hint="null"
              ref="edu"
              :rules="[
                val => val.length < 21 || $t('addJob.eduValidationLengthMax'),
                val => /^[a-zA-Zа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\(\)]*$/.test(val) || $t('addJob.eduValidationFormat')
              ]"
              :lazy-rules="lazyRulesAll"
            >
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('addJob.eduTooltip')}}</p>
              </q-tooltip>
            </q-input>
            
          </div>
          <div class="line">
            <p class="star"> </p>
            <p class="startP" style="width: 140px; textAlign: left">{{$t('addJob.langsLabel')}}</p>
            <q-select
              multiple
              use-chips
              square
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              :style="{width: '400px'}"
              max-values="3"
              v-model="job.langs"
              :options="$t('addJob.langOptions')"
              :hint="null"
            />
          </div>
        </q-expansion-item>
        <q-btn
          color="red-10" class="headerBtns1 headerBtnRed" 
          :label="props.newJobsPageType == 'new' ? $t('addJob.sendJobBtnLabelNew') : $t('addJob.sendJobBtnLabelUpdate')"
          @click="tryAdd"
        />
      </div>
      <div v-else-if="props.sent == 'goodNew'" :key="2" class="jobpage__wrapper">
        <p>{{$t('addJob.sendJobSuccess1')}}<a :href="'/jobpage?id=' + returned.job_id" target="_blank">{{returned.title}}</a>{{$t('addJob.sendJobSuccess2')}}</p>
        <q-btn color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="props.sent == 'goodEdited'" :key="2" class="jobpage__wrapper">
        <p>{{$t('addJob.sendJobSuccess1x')}}<a :href="'/jobpage?id=' + returned.job_id" target="_blank">{{returned.title}}</a>{{$t('addJob.sendJobSuccess2x')}}</p>
        <q-btn color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="props.sent == 'fail'" :key="3" class="jobpage__wrapper">
        <p>{{$t('addJob.sendJobError1')}}</p>
        <q-btn color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="user.role == 'guestUnau' | user.role == 'guest'" :key="4" class="jobpage__wrapper">
        {{$t('addJob.unauthorized')}}
      </div>
    </transition>
  </div>
</template>

<script>
// let VueEditor
// if (process.env.CLIENT) {
//   VueEditor = require('vue2-editor').VueEditor
// }

export default {
  name: 'addJob',
  computed: {
    user() {
      return { role: this.$store.state.user.role }
    },
    props() {
      return this.$store.state.addJob
    },
    jobEditedObj() {
      return this.$store.state.addJob.jobEditedObj
    },
  },
  data() {
    return {
      salaryOn: false,
      returned: {
        title: '',
        job_id: -1
      },
      jobInit: {
        title: '',
        salary_min: '',
        salary_max: '',
        currency: this.$t('addJob.currDefault'),
        jcategory: {label: '', value: 0},
        city: '',
        age1: '',
        age2: '',
        worktime1: '',
        worktime2: '',
        schedule: '',
        langs: [],
        edu: '',
        experience: this.$t('App.expOpts[0]'),
        description: '',
        contact_mail: '',
        contact_tel: '',
        jtype: this.$t('App.jtypeOptions[0]'),
      },
      cityList: this.$t('App.cityList'),//["Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"],
      scheduleList: this.$t('addJob.scheduleList'),//["5/2", "6/1", "2/2", "3/2", "3/1", "15/15"],
      lazyRulesAll: true,
      pageTypes: {
        'new': {label: this.$t('addJob.pTypeNewLabel')},
        'edit': {label: this.$t('addJob.pTypeEditLabel')}
      },
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ size: [ 'small', false, 'large']}],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ 'align': [] }],
        ['clean']
      ],
      job: {
        title: '',
        salary_min: '',
        salary_max: '',
        currency: this.$t('addJob.currDefault'),
        jcategory: {label: '', value: 0},
        city: '',
        age1: '',
        age2: '',
        worktime1: '',
        worktime2: '',
        schedule: '',
        langs: [],
        edu: '',
        experience: this.$t('App.expOpts[0]'),
        description: '',
        contact_mail: '',
        contact_tel: '',
        jtype: this.$t('App.jtypeOptions[0]'),
      },
      contactsValidated: true,
      salaryValidated: true,
      descError: '',
      cityOptions: this.cityList,
      scheduleOptions: this.scheduleList,
    }
  },
  
  watch: {
    $route (to, from){
      if (to.name === 'addjob') {
        console.log('cp route addjob - fields reset')
        this.resetFields()
      }
    },
    jobEditedObj(newObj) {
      console.log('jobEditorWatcher cp0')
      if (this.props.newJobsPageType == 'edit') {
        this.job = Object.assign({}, this.jobInit, newObj)
        console.log('jobEditorWatcher cp')
      } else {
        this.job = Object.assign({}, this.jobInit)
      }
      this.$store.dispatch('setAJSentState', 'none')
    },
    
  },
  mounted(){
    if (this.props.newJobsPageType == 'edit') {
      this.job = Object.assign({}, this.jobInit, this.props.jobEditedObj)
    } else {
      this.job = Object.assign({}, this.jobInit)
    }
  },
  methods:{
    descUpd(e) {//Ok
      if (e.length < 2001) this.descError = ''
    },
    descBlur(e) {//Ok
      if (e.root.innerHTML.length > 2000) {this.descError = this.$t('addJob.descValidation2000')}
    },
    resetFields() {//Ok
      this.job = Object.assign({}, this.jobInit)
      this.salaryOn = false
      this.lazyRulesAll = true
    },
    tryAdd() {
      this.lazyRulesAll = false
      let scrollPos
      //title
      this.$refs.title.validate()
      if (this.$refs.title.hasError) {
        scrollPos = 130
      }
      //salary
      if (!this.salaryOn) {
        if ((this.job.salary_min > 0) || (this.job.salary_max > 0))
          this.salaryValidated = true
        else
          this.salaryValidated = false

        this.$refs.salary_min.validate()
        this.$refs.salary_max.validate()
        
        if (this.$refs.salary_min.hasError || this.$refs.salary_max.hasError) {
          if (!scrollPos) scrollPos = 150
        }
      }
      //contacts
      if ((this.job.contact_mail && this.job.contact_mail.length > 0) || (this.job.contact_tel && this.job.contact_tel.length > 0))
        this.contactsValidated = true
      else
        this.contactsValidated = false
      this.$refs.contact_mail.validate()
      this.$refs.contact_tel.validate()
      if (this.$refs.contact_mail.hasError || this.$refs.contact_tel.hasError || this.contactsValidated == false) {
        if (!scrollPos) scrollPos = 160
      }
      //city
      this.$refs.city.validate()
      if (this.$refs.city.hasError) {
        scrollPos = 190
      }
      //description
      if (this.job.description.length > 2000) {
        this.descError = this.$t('addJob.descValidation2000')
        scrollPos = 340
      }
      //age
      this.$refs.age1.validate()
      this.$refs.age2.validate()
      if (this.$refs.age1.hasError || this.$refs.age2.hasError) {
        scrollPos = 520
        this.$refs.exp1.show()
      }
      //worktime
      this.$refs.worktime1.validate()
      this.$refs.worktime2.validate()
      if (this.$refs.worktime1.hasError || this.$refs.worktime2.hasError) {
        scrollPos = 580
        this.$refs.exp1.show()
      }
      //edu
      this.$refs.edu.validate()
      if (this.$refs.edu.hasError) {
        scrollPos = 620
        this.$refs.exp1.show()
      }
      if (scrollPos)
        this.$emit('scrollTo', scrollPos)
      else {
        if (this.props.newJobsPageType == 'new') this.addOneJob()
        else this.editJobSend()
      }
    },
    editJobSend() {//Ok
      let j = Object.assign({}, this.job)
      if (!this.salaryOn) {
        if (Number(j.salary_min) > Number(j.salary_max)) j.salary_max = j.salary_min
      } else j.salary_min = '', j.salary_max = ''
      j.currency = j.currency.value
      j.experience = j.experience.value
      j.jtype = j.jtype.value
      j.jcategory = j.jcategory.value
      j.description = j.description.split("\t").join("&emsp;")
      if (j.title != '' && j.title.length > 1) {
        this.$axios
          .post('/updateJob', j, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            if (response.data && response.data.result == 'OK') {
              this.returned.title = response.data.title
              this.returned.job_id = response.data.job_id
              this.$store.dispatch('setAJSentState', 'goodEdited')
              console.log('cp editJob: OK')
            } else {this.$store.dispatch('setAJSentState', 'fail'); console.log('trespasser')}
            
          })
      } else console.log('NO TITLE in edit')
    },
    addOneJob() {//Ok
      let j = Object.assign({}, this.job)
      if (!this.salaryOn) {
        if (Number(j.salary_min) > Number(j.salary_max)) j.salary_max = j.salary_min
      } else j.salary_min = '', j.salary_max = ''
      j.currency = j.currency.value
      j.experience = j.experience.value
      j.jtype = j.jtype.value
      j.jcategory = j.jcategory.value
      j.description = j.description.split("\t").join("&emsp;")
      if (j.title != '' && j.title.length > 1) {
        this.$axios
          .post('/oneJob', j, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            if (response.data && response.data.result == 'OK') {
              this.returned.title = response.data.title
              this.returned.job_id = response.data.job_id
              this.$store.dispatch('setAJSentState', 'goodNew')
              console.log(response)
            } else {this.$store.dispatch('setAJSentState', 'fail'); console.log('trespasser')}
          })
      } else {
        return false
      }
    },
    isValidMail(mail) {
      return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(mail)
    },
    addNewCity(e){
      this.cityUpd(e.target.value)
    },
    addNewSchedule(e){
      this.scheduleUpd(e.target.value)
    },
    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.cityOptions = this.cityList.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterSchedule (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.scheduleOptions = this.scheduleList.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    cityUpd(new1) {
      this.job.city = new1
    },
    scheduleUpd(new1) {
      this.job.schedule = new1
    },
  },
  components: {
    // VueEditor
  }
}
</script>

<style lang="stylus">
.q-field__bottom
  padding 5px
div.q-field__messages
  display flex
  justify-content center
</style>
<style scoped lang="stylus">
.addJob
  max-width 80%
  width 680px
  .hint
    line-height 22px
    font-size 10px
    text-align right
  .q-field__bottom
    border 1px solid green !important
  .jobpage__wrapper
    margin-top 15px
    background-color var(--main-bg-color)//#eee
    padding 10px
    padding-top 20px
    box-shadow 0 0 3px 1px var(--main-borders-color)
  .line
    display flex
    align-items flex-end
    // margin-bottom 10px
    min-height 52px
  .startP
    margin-right 10px
    font-size 15px
    align-self flex-end
    padding-bottom 12px
  .star
    align-self flex-start
    margin-right 10px
    font-weight 900
    font-size 20px
    margin-top 5px
    width 5px
  .withMargins
    margin 0 10px
    align-self center
  .bounce-enter-active {
    animation: bounce-in .35s;
  }
  .bounce-leave-active {
    animation: bounce-in .35s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
<template>
  <div class="addJob">
    <p class="pageHeader noshow-below550" v-if="props.newJobsPageType === 'new'">{{$t('addJob.pTypeNewLabel')}}</p>
    <p class="pageHeader noshow-below550" v-else>{{$t('addJob.pTypeEditLabel')}}</p>
    <transition name="bounce">
      <div v-if="user.role === 'company' && props.sent == 'none'" class="jobpage__wrapper" :key="1" style="display: flex; flex-direction: column; align-items: center">
        <p style="margin-top: 0; margin-bottom: 16px;" class="pageHeader displayblock-only550" v-if="props.newJobsPageType === 'new'">{{$t('addJob.pTypeNewLabel')}}</p>
        <p style="margin-top: 0; margin-bottom: 16px;" class="pageHeader displayblock-only550" v-else>{{$t('addJob.pTypeEditLabel')}}</p>
        <div class="w586">
          <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
            <!-- <p class="star">*</p> -->
            <p class="startP reqd">{{$t('addJob.titleLabel')}}</p>
          </div>
          <q-input
            dense
            outlined
            bg-color="white" color="deep-purple-10"
            :style="{width: '100%'}"
            :hint="null"
            v-model="job.title"
            ref="title"
            :placeholder="$t('addJob.titlePh')"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addJob.titleValidationRequired'),
              val => (lazyRulesAll || val.length > 1) || $t('addJob.titleValidationMin'),
              val => val.length < 76 || $t('addJob.titleValidationMax'),
              
              val => titleRegex.test(val) || $t('addJob.titleValidationSymbols'),
              ]"
            :lazy-rules="lazyRulesAll"
          />
        </div>
        <div class="w586">
          <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
            <!-- <p class="star"> </p> -->
            <p class="startP">{{$t('addJob.cityLabel')}}</p>
          </div>
          <q-select
            :value="job.city"
            @input="cityUpd"
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
            :placeholder="$t('addJob.cityPh')"
            @keyup="addNewCity"
            dropdown-icon="none"
            class="dropdown-padding-adjust"
            :rules="[
              val => val.length < 71 || $t('addJob.cityValidationLength'),
              val => /^[a-zA-Zа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\(\)]*$/.test(val) || $t('addJob.cityValidationFormat')
            ]"
            :lazy-rules="lazyRulesAll"
          />
        </div>
        <div class="w586">
          <div class="sal-curr-wrap" style="display: flex; justify-content: space-between;"> 
          <div class="sal-wrap">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP reqd">{{$t('addJob.salaryLabel')}}</p>
            </div>
            <div class="line">
              <q-input
                :disable="salaryOn"
                class="salInputsAdaptable salInput1"
                dense outlined
                bg-color="white" color="deep-purple-10"
                v-model="job.salary_min"
                ref="salary_min"
                :placeholder="$t('addJob.salaryMinPH')" :hint="null"
                @input="salaryValidated = true; $refs.salary_max.validate()"
                :rules="[sal => (sal >= 0 && String(sal).length < 6 && sal < 100000) || $t('addJob.salaryValidationRange')]"
              />
              <q-input
                :disable="salaryOn"
                class="salInputsAdaptable"
                dense outlined
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
              
            </div>
            
          </div>
          <div>
              <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                <p class="startP">{{$t('addJob.currLabel')}}</p>
              </div>
              <q-select
              :disable="salaryOn"
              dense outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.currency"
              style="lineHeight: 3.2;color: white !important; margin-left: auto;"
              :options="[
                {label: $t('addJob.manat'), value: 'm'},
                {label: $t('addJob.dollars'), value: '$'},
              ]"
              dropdown-icon="none"
              class="salInputsAdaptable dropdown-padding-adjust"
              :hint="null"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <q-checkbox
            for="salcb1"
            class="salcb1"
            dense
            color="red-10"
            v-model="salaryOn"
            @input="$refs.salary_min.resetValidation();
            $refs.salary_max.resetValidation();
            salaryValidated = true"
            
          >
          </q-checkbox>
            <label for="salcb1" @click="salaryOn = !salaryOn; $refs.salary_min.resetValidation(); $refs.salary_max.resetValidation(); salaryValidated = true" style="cursor: pointer; color: var(--color1); font-size: 14px; line-height: 17px; user-select: none; font-weight: 500;">
              {{$t('addJob.salaryCB1Hint')}}
            </label>
          </div>
          
        </div>

        <div class="w586">
          <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
          <p style="color: var(--color1); font-weight: 500; display: block; font-family: Montserrat; font-size: 14px;line-height: 17px; margin-top: 25px; text-align: left;">
            {{$t('addJob.descLabel')}}<span style="color: #c10015"> {{descError}}</span>
          </p>
          </div>
          <div class="desc-col-wrap" style="border-radius: 10px; textAlign: left; width: 100%; margin-bottom: 20px;">
            <q-no-ssr placeholder="Loading Your Editor...">
              <vue-editor
                v-model="job.description"
                @blur="descBlur"
                @input="descUpd"
                :editorToolbar="customToolbar"
                style="background-color: white; border-radius: 10px; box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);"
              />
            </q-no-ssr>
          </div>
        </div>

        <div class="w586">
          <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
            <p class="startP reqd" style="textAlign: left">{{$t('addJob.contactsLabel')}}</p>
          </div>
          <q-input
            dense outlined
            bg-color="white" color="deep-purple-10"
            v-model="job.contact_mail"
            :placeholder="$t('addJob.emailPH')"
            type="email"
            
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
        <div class="w586">
          <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
            <p class="startP">{{$t('addJob.jcatLabel')}}</p>
          </div>
          <q-select
            v-model="job.jcategory"
            style="width: 100%"
            dense
            outlined
            dropdown-icon="none"
            class="dropdown-padding-adjust"
            bg-color="white" color="deep-purple-10"
            :options="$t('App.jcats')"
            :hint="null"
          />
        </div>
        <div class="w586">
        <q-expansion-item
          ref="exp1"
          dense
          expand-icon="none"
          class="expansion1"
          :label="$t('addJob.moreLabel')"
          style="
            color: var(--violet-btn-color);
            font-family: Montserrat; font-weight: 500; font-size: 14px; line-height: 17px;
            marginBottom: 10px; text-align:right; align-self: flex-end;"
        >
        
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.expLabel')}}</p>
            </div>
            <q-select
                v-model="job.experience"
                dense
                outlined
                dropdown-icon="none"
                class="dropdown-padding-adjust"
                bg-color="white" color="deep-purple-10"
                :options="$t('App.expOpts')"
                :hint="null"
              />
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.jobTypeLabel')}}</p>
            </div>
            <q-select
              v-model="job.jtype"
              dense
              outlined
              dropdown-icon="none"
              class="dropdown-padding-adjust"
              bg-color="white" color="deep-purple-10"
              :options="$t('App.jtypeOptions')"
              :hint="null"
            />
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.labelSchedule')}}</p>
            </div>
            <div class="line">
            <q-input
              class="InputsAdaptable3 salInput1"
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
              :style="{marginRight: '10px'}"
              class="InputsAdaptable3"
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
              dense
              outlined
              dropdown-icon="none"
              class="salInputsAdaptable2 dropdown-padding-adjust"
              bg-color="white" color="deep-purple-10"
              style="margin-left: auto;"
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
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.ageLabel')}}</p>
            </div>
            <div class="line">
              <q-input
                :style="{width: '150px', marginRight: '40px'}"
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
                :style="{width: '150px'}"
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
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.eduLabel')}}</p>
            </div>
            <q-input
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              v-model="job.edu"
              :hint="null"
              ref="edu"
              :rules="[
                val => val.length < 61 || $t('addJob.eduValidationLengthMax'),
                val => /^[a-zA-Zа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\(\)]*$/.test(val) || $t('addJob.eduValidationFormat')
              ]"
              :lazy-rules="lazyRulesAll"
            >
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('addJob.eduTooltip')}}</p>
              </q-tooltip>
            </q-input>
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addJob.langsLabel')}}</p>
            </div>
            <q-select
              multiple
              use-chips
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              dropdown-icon="none"
              class="dropdown-padding-adjust"
              max-values="3"
              v-model="job.langs"
              :options="$t('addJob.langOptions')"
              :hint="null"
            />
          </div>
        </q-expansion-item>
        </div>
        <q-btn
          class="headerBtns1 weight600" 
          style="align-self: center; background-color: var(--violet-btn-color); color: white; font-size: 12px; font-height: 15px;"
          :label="props.newJobsPageType == 'new' ? $t('addJob.sendJobBtnLabelNew') : $t('addJob.sendJobBtnLabelUpdate')"
          @click="tryAdd"
        />
      </div>
      <div v-else-if="props.sent == 'goodNew'" :key="2" class="jobpage__wrapper">
        <p style="font-size: 16px;">{{$t('addJob.sendJobSuccess1')}}<a :href="'/jobpage?id=' + returned.job_id" target="_blank">{{returned.title}}</a>{{$t('addJob.sendJobSuccess2')}}</p>
        <q-btn style="margin-top: 12px;" color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="props.sent == 'goodEdited'" :key="2" class="jobpage__wrapper">
        <p style="font-size: 16px;">{{$t('addJob.sendJobSuccess1x')}}<a :href="'/jobpage?id=' + returned.job_id" target="_blank">{{returned.title}}</a>{{$t('addJob.sendJobSuccess2x')}}</p>
        <q-btn style="margin-top: 12px;" color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="props.sent == 'fail'" :key="3" class="jobpage__wrapper">
        <p style="color: var(--btn-color); font-size: 16px;">{{$t('addJob.sendJobError1')}}</p>
        <q-btn style="margin-top: 12px;" color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/>
      </div>
      <div v-else-if="props.sent == 'limit'" :key="4" class="jobpage__wrapper">
        <p style="color: var(--btn-color); font-size: 16px;">{{$t('addJob.sendJobErrorLimit')}}</p>
        <!-- <q-btn color="red-10" class="headerBtns1 headerBtnRed" @click="$store.dispatch('setAJSentState', 'none'); resetFields(); $store.dispatch('newJobInitAJ')" :label="$t('addJob.btnAddOneMore')"/> -->
      </div>
      <div v-else-if="user.role == 'guestUnau' | user.role == 'guest'" :key="4" class="jobpage__wrapper">
        {{$t('addJob.unauthorized')}}
      </div>
    </transition>
  </div>
</template>

<script>
let VueEditor
if (process.env.CLIENT) {
  VueEditor = require('vue2-editor').VueEditor
}



export default {
  name: 'AddJob',
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
      titleRegex: /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\.\,\+\$\%\(\)\№\:\#\/\"]*$/,
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
      if (to.path === '/addjob') {
        console.log('cp route addjob - fields reset')
        this.resetFields()
      }
    },
    jobEditedObj(newObj) {
      if (this.props.newJobsPageType == 'edit') {
        this.job = Object.assign({}, this.jobInit, newObj)
        if (!newObj.salary_min && !newObj.salary_max) {
          this.salaryOn = true
        }
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
              // console.log('cp editJob: OK')
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
            } else {
              if (response.data && response.data == 'error limits reached') {
                this.$store.dispatch('setAJSentState', 'limit')
              } else this.$store.dispatch('setAJSentState', 'fail')
            }
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
    VueEditor
  }
}
</script>

<style lang="stylus">
.addJob .headerBtns1
  font-weight 500 !important
.addJob .expansion1 .q-item__section--side
  display none
.addJob .expansion1 .q-item__section--main
  height 22px
  margin-left auto
  border-bottom 1px solid var(--violet-btn-color)
  max-width fit-content
  padding-right 14px
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position right 1px center
.addJob .expansion1 .q-expansion-item__container .q-link.q-item--dense
  height 22px !important
  padding 0
.addJob .expansion1 .q-expansion-item__container .q-focus-helper
  height 22px !important
  padding 0


.addJob .q-field--outlined .q-field__control:before
  border 0 !important
.addJob .q-field__control
  font-size: 16px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
  @media screen and (max-width 550px)
    font-size: 14px;
.addJob .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.addJob .q-field__native input
  height 36px
.addJob .q-field__append
  height 36px
.addJob .q-select__dropdown-icon
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position center center
.dropdown-padding-adjust .q-field__control
  padding-right 4px !important

.addJob .salcb1 .q-checkbox__inner
  left 0px
  margin-right 0
  height 20px
  width 20px
  min-width 20px
  margin-right 8px !important

//desc field
.addJob .ql-toolbar.ql-snow
  border-top-left-radius 10px
  border-top-right-radius 10px
.addJob .ql-container.ql-snow
  border-bottom-left-radius 10px
  border-bottom-right-radius 10px
.q-field__bottom
  padding 5px
div.q-field__messages
  display flex
  justify-content center
</style>

<style scoped lang="stylus">
*
  margin 0
.w586
  width 586px
  @media screen and (max-width 550px)
    width 100%
.salInputsAdaptable
  width 150px
  @media screen and (max-width 550px)
    width 70px
.salInputsAdaptable2
  width 150px
  @media screen and (max-width 550px)
    width 105px
.InputsAdaptable3
  width 150px
  @media screen and (max-width 550px)
    width 55px
.salInput1
  margin-right 40px
  @media screen and (max-width 550px)
    margin-right 14px
.addJob
  // max-width 80%
  width 754px
  margin-bottom 70px !important
  @media screen and (max-width 550px)
    width 100%
    padding 0 20px
  .hint
    line-height 22px
    font-size 10px
    text-align right
  .q-field__bottom
    border 1px solid green !important
  .jobpage__wrapper
    // margin-top 15px
    max-width 754px
    width 754px
    background var(--menubg-color)
    border: 0.5px solid #C2C2C6
    box-sizing: border-box
    border-radius: 10px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
    padding 10px
    padding-top 45px
    padding-bottom 35px
    @media screen and (max-width 550px)
      width 100%
      max-width none
      padding 26px 34px
      margin-bottom 90px
  .line
    display flex
    align-items flex-end
    // margin-bottom 10px
    min-height 52px
  .startP
    font-family: Montserrat;
    font-size: 14px;
    font-weight 500
    line-height: 17px;
    color var(--color1)
    position relative
    text-align left
  .star
    // align-self flex-start
    margin-right 4px
    font-family: Montserrat, sans-serif
    font-size: 14px;
    line-height: 17px;
    color var(--btn-color)
    // margin-top 5px
    width 6px
  .reqd:before
    content '*'
    font-family Montserrat, sans-serif
    font-size 14px
    line-height 17px
    left -10px
    position absolute
    width 6px
    color var(--btn-color)
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
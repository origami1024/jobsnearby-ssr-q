<template>
  <div class="add-cv">
    <p class="pageHeader noshow-below550" v-if="isNew">{{$t('addCv.labelNew')}}</p>
    <p class="pageHeader noshow-below550" v-else>{{$t('addCv.labelEdit')}}</p>
    <transition name="bounce">
      <div v-if="loading">
        Загрузка....
      </div>
      <div v-else-if="user.role === 'subscriber'">
        <div class="cvpage__wrapper" :key="1" style="display: flex; flex-direction: column; align-items: center">
          <p style="margin-top: 0; margin-bottom: 16px;" class="pageHeader displayblock-only550" v-if="isNew">
            {{$t('addCv.labelNew')}}
          </p>
          <p style="margin-top: 0; margin-bottom: 16px;" class="pageHeader displayblock-only550" v-else>
            {{$t('addCv.labelEdit')}}
          </p>

          <div class="w586 startP-header-wrapper">
            <p class="startP startP-header" style="margin-bottom: 20px;">
              {{$t('addCv.contactsLabel')}}
            </p>
          </div>
          <div
            class="w586"
            ref="fileInputWrap"
            
          >
            <!-- @drop="picDrop" -->
            <label class="uploaderWrapper" tabindex="0">
              <input
                id="fileInpX"
                ref="fileInputX"
                type="file"
                style="display:none" accept=".gif,.jpg,.jpeg,.png,.webp,.svg"
                @change="uploadPhoto"
              >
              <!-- @change="setCompanyLogo($refs.fileInputX.files)" -->
              <div
                class="logo-placeholder"
                :style="{
                  backgroundImage : `url('${ photo ?  ('/uploads/cvpics/' + uid + photo) : 'statics/subscriber-logo-ph.svg'}')`
                }"
              />
            </label>
            <div
              v-if="photo"
              style="text-align: right;"
            >
              <q-btn
                class="headerBtns1 weight600 text-white"
                @click="removePhoto"
              >
                {{$t('addCv.removePhoto')}}
              </q-btn>
            </div>
          </div>

          <TextField
            v-model="cv.name" ref="name"
            :label="$t('addCv.name')" :ph="$t('addCv.nameph')"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addCv.NameValidationRequired'),
              val => (lazyRulesAll || val.length > 1) || $t('addCv.nameValidationMin'),
              val => val.length < 76 || $t('addCv.nameValidationMax')
            ]"
            :reqd="true" :lazy="lazyRulesAll" :maxlength="75"
          />
          <TextField
            v-model="cv.surname" ref="surname"
            :label="$t('addCv.surname')" :ph="$t('addCv.surnameph')"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addCv.NameValidationRequired'),
              val => (lazyRulesAll || val.length > 1) || $t('addCv.nameValidationMin'),
              val => val.length < 76 || $t('addCv.nameValidationMax')
            ]"
            :reqd="true" :lazy="lazyRulesAll" :maxlength="75"
          />
          <TextField
            v-model="cv.tel" ref="tel"
            :label="$t('addCv.tel')" :ph="$t('addCv.telph')"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addCv.NameValidationRequired'),
              val => (lazyRulesAll || val.length > 5) || $t('addCv.telValidationMin'),
              val => val.length < 21 || $t('addCv.telValidationMax')
            ]"
            :reqd="true" :lazy="lazyRulesAll" :maxlength="20" :maxlhidden="true"
          />
          <TextField
            v-model="cv.tel_home" ref="tel_home"
            :label="$t('addCv.telHome')" :ph="$t('addCv.telph')"
            :rules="[
              val => val === null || val === '' || (lazyRulesAll || val.length > 5) || $t('addCv.telValidationMin'),
              val => val === null || val === '' || val.length < 21 || $t('addCv.telValidationMax')
            ]"
            :lazy="lazyRulesAll"
            :maxlength="20" :maxlhidden="true"
          />
          <TextField
            v-model="cv.email" ref="email"
            :label="$t('addCv.email')" :ph="$t('addCv.emailph')"
            :maxlength="75" :maxlhidden="true"
          />

          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <!-- <p class="star"> </p> -->
              <p class="startP">{{$t('addCv.cityCurrent')}}</p>
            </div>
            <q-select
              :value="cv.city_current"
              @input="cityUpd"
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              use-input
              input-debounce="0"
              fill-input
              hide-selected
              ref="city_current"
              :options="cityOptions"
              @filter="filterFn"
              :hint="null"
              :placeholder="$t('addCv.cityph')"
              @keyup="addNewCity"
              dropdown-icon="none"
              class="dropdown-padding-adjust"
              :rules="[
                val => val.length < 71 || $t('addCv.cityValidationLength')
              ]"
              :lazy-rules="lazyRulesAll"
            />
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addCv.cityBased')}}</p>
            </div>
            <q-select
              :value="cv.city_based"
              @input="cityBasedUpd"
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              use-input
              input-debounce="0"
              fill-input
              hide-selected
              ref="city_based"
              :options="cityOptions"
              @filter="filterFn"
              :hint="null"
              :placeholder="$t('addCv.cityph')"
              @keyup="addNewBasedCity"
              dropdown-icon="none"
              class="dropdown-padding-adjust"
              :rules="[
                val => val.length < 71 || $t('addCv.cityValidationLength')
              ]"
              :lazy-rules="lazyRulesAll"
            />
          </div>

          <hr style="margin: 10px 0 30px; width: calc(100% + 20px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"/>

          <div class="w586">
            <p class="startP" style="font-weight: 600; margin-bottom: 20px;">{{$t('addCv.driversLabel')}}</p>
            <label
              style="
                display: flex; align-items: center; margin: 12px 0;
                cursor: pointer; color: var(--color1); font-size: 14px;
                user-select: none; font-weight: 500;
              "
              v-for="(option, key, oidx) in cv.driver"
              :key="key"
            >
              <q-checkbox
                dense
                class="salcb1"
                color="red-10"
                v-model="cv.driver[key]"
              />
              {{ driverOptions[oidx].label }}
            </label>
          </div>
          <BoolField
            :label="$t('addCv.carLabel')"
            v-model="cv.car"
            :labels="[$t('addCv.yes'), $t('addCv.no')]"
          />
        </div>
        <div class="cvpage__wrapper" :key="2" style="display: flex; flex-direction: column; align-items: center">
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addCv.birthDate')}}</p>
            </div>
            <q-input
              dense
              outlined
              bg-color="white" color="deep-purple-10"
              style="width: 100%;"
              v-model="cv.birth"
              mask="date"
              :rules="['date']"
              :placeholder="$t('addCv.birthDatePh')"
              :lazy-rules="lazyRulesAll"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="cv.birth"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <BoolField
            :label="$t('addCv.sex')"
            v-model="cv.sex"
            :labels="[$t('addCv.sexM'), $t('addCv.sexF')]"
            :vals="['m', 'f']"
          />
          <BoolField
            :label="$t('addCv.family')"
            v-model="cv.family"
            :labels="[$t('addCv.familyYes'), $t('addCv.familyNo')]"
          />
          
          <hr style="margin: 20px 0 10px; width: calc(100% + 20px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"/>

          <BoolField
            :label="$t('addCv.exp')"
            v-model="cv.exp"
            :labels="[$t('addCv.expYes'), $t('addCv.expNo')]"
            @input="expSwitch"
          />

          <hr
            style="margin: 20px 0 30px; width: calc(100% + 20px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"
          />

          <TextField
            v-if="!cv.exp"
            v-model="cv.edu" ref="edu"
            :label="$t('addCv.edu')" :ph="$t('addCv.eduph')"
            :maxlength="30"
            :maxlhidden="true"
          />
          
          <div v-if="cv.exp && cvExt" style="width: calc(100% - 160px);">
            <div
              v-for="(exp, eidx) in cvExt.exps"
              :key="'exp_' + eidx"
            >
              <TextField
                v-model="cvExt.exps[eidx].place"
                :label="$t('addCv.placeLabel')" :ph="$t('addCv.placeph')"
                :maxlength="75" :maxlhidden="true"
              />
              <TextField
                v-model="cvExt.exps[eidx].position"
                :label="$t('addCv.positionLabel')" :ph="$t('addCv.positionph')"
                :maxlength="75" :maxlhidden="true"
              />

              <!-- datepicker -->
              <div class="w586" style="margin-bottom: 20px;">
                <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                  <p class="startP">{{$t('addCv.periodLabel')}}</p>
                </div>
                <q-input
                  dense
                  outlined
                  bg-color="white" color="deep-purple-10"
                  style="width: 100%;"
                  :value="cvExt.exps[eidx].range
                    ? (cvExt.exps[eidx].range.from
                      ? 'с ' + cvExt.exps[eidx].range.from + ' '
                      : '') + (cvExt.exps[eidx].range.to
                        ? 'по ' + cvExt.exps[eidx].range.to
                        : '')
                    : ''
                  "
                  :placeholder="$t('addCv.periodph')"
                  :lazy-rules="lazyRulesAll"
                >
                <!-- v-model="cvExt.exps[eidx].range" -->
                  <!-- mask="date"
                  :rules="['date']" -->
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="cvExt.exps[eidx].range"
                          range
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="w586">
                <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                  <p class="startP">{{$t('addCv.descLabel')}}</p>
                </div>
                <q-input
                  v-model="cvExt.exps[eidx].desc"
                  class="addCv__desc-inp"
                  outlined dense bg-color="white" color="deep-purple-10"
                  type="textarea"
                  counter maxlength="800"
                  :placeholder="$t('addCv.desc')"
                />
              </div>
              <div style="text-align: right;">
                <q-btn
                  class="headerBtns1 weight600 text-white"
                  @click="cvExt.exps.splice(eidx, 1)"
                >
                  {{$t('addCv.remove')}}
                </q-btn>
              </div>
            </div>
            <div v-if="cv.exp" style="text-align: right;">
              <div v-if="!cvExt.exps || !cvExt.exps.length" class="addJoblabel" style="display: flex; margin-bottom:8px;">
                <p class="startP">{{$t('addCv.placeLabel')}}</p>
              </div>
              <q-btn
                :disabled="cvExt.exps.length > 4"
                @click="addOneExp"
                class="headerBtns1 weight600 text-white"
                style="margin-top: 8px;"
              >
                {{$t('addCv.addMoreExp')}}
              </q-btn>
              <div v-if="cvExt.exps.length > 4" style="margin: 6px 0 12px;">
                {{ $t('addCv.maxExts') }}
              </div>
            </div>

            <hr style="margin: 20px 0 30px -90px; width: calc(100% + 180px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"/>

            <div
              v-for="(edu, uidx) in cvExt.edus"
              :key="'edu_' + uidx"
            >
              <div class="w586">
                <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                  <p class="startP">{{$t('addCv.edu')}}</p>
                </div>
                <q-select
                  dense
                  outlined
                  use-input
                  fill-input
                  hide-selected
                  bg-color="white" color="deep-purple-10"
                  dropdown-icon="none"
                  :maxlength="75"
                  class="dropdown-padding-adjust lang-select"
                  :placeholder="$t('addCv.eduph')"
                  v-model="cvExt.edus[uidx].general"
                  :options="$t('addCv.eduOptions')"
                  :hint="null"
                />
              </div>
              <TextField
                v-model="cvExt.edus[uidx].place"
                :label="$t('addCv.eduPlaceLabel')" :ph="$t('addCv.eduPlaceph')"
                :maxlength="75" :maxlhidden="true"
              />
              <TextField
                v-model="cvExt.edus[uidx].fac"
                :label="$t('addCv.fac')" :ph="$t('addCv.facph')"
                :maxlength="75" :maxlhidden="true"
              />
              <TextField
                v-model="cvExt.edus[uidx].spec"
                :label="$t('addCv.spec')" :ph="$t('addCv.specph')"
                :maxlength="75" :maxlhidden="true"
              />
              <TextField
                v-model="cvExt.edus[uidx].year"
                :label="$t('addCv.yearEnd')" :ph="$t('addCv.yearEndph')"
                :maxlength="20" :maxlhidden="true"
              />
              <div style="text-align: right;">
                <q-btn
                  class="headerBtns1 weight600 text-white"
                  @click="cvExt.edus.splice(uidx, 1)"
                >
                  {{$t('addCv.remove')}}
                </q-btn>
              </div>
            </div>
            <div v-if="cv.exp" style="text-align: right;">
              <div v-if="!cvExt.edus || !cvExt.edus.length" class="addJoblabel" style="display: flex; margin-bottom:8px;">
                <p class="startP">{{$t('addCv.edu')}}</p>
              </div>
              <q-btn
                :disabled="cvExt.edus.length > 4"
                @click="addOneEdu"
                class="headerBtns1 weight600 text-white"
                style="margin-top: 8px;"
              >
                {{$t('addCv.addMoreEdu')}}
              </q-btn>
              <div v-if="cvExt.edus.length > 4" style="margin: 6px 0 12px;">
                {{ $t('addCv.maxExts') }}
              </div>
            </div>
          </div>

          <hr style="margin: 20px 0 30px; width: calc(100% + 20px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"/>

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
              class="dropdown-padding-adjust lang-select"
              max-values="3"
              v-model="cv.langs"
              :options="$t('addJob.langOptions')"
              :hint="null"
            />
          </div>
          <div class="w586">
            <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
              <p class="startP">{{$t('addCv.skills')}}</p>
            </div>
            <q-input
              v-model="cv.skills"
              class="addCv__desc-inp"
              outlined dense bg-color="white" color="deep-purple-10"
              type="textarea"
              counter maxlength="500"
              :placeholder="$t('addCv.desc')"
            />
          </div>

          <hr style="margin: 20px 0 30px; width: calc(100% + 20px); border: 0; border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;"/>

          <TextField
            v-model="cv.wanted_job" ref="wanted_job"
            :label="$t('addCv.wantedJob')" :ph="$t('addCv.wantedJobPh')"
            :rules="[
              val => (lazyRulesAll || !!val) || $t('addCv.NameValidationRequired'),
              val => (lazyRulesAll || val.length > 1) || $t('addCv.nameValidationMin'),
              val => val.length < 76 || $t('addCv.nameValidationMax')
            ]"
            :reqd="true" :lazy="lazyRulesAll"
            :maxlength="75" :maxlhidden="true"
          />
          <div class="w586">
            <div class="sal-wrap">
              <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                <p class="startP">{{$t('addJob.salaryLabel')}}</p>
              </div>
              <div class="line">
                <q-input
                  class="salInputsAdaptable salInput1"
                  dense outlined
                  bg-color="white" color="deep-purple-10"
                  v-model="cv.salary_min"
                  ref="salary_min"
                  :placeholder="$t('addJob.salaryMinPH')" :hint="null"
                  :rules="[sal => (sal >= 0 && String(sal).length < 6 && sal < 100000) || $t('addJob.salaryValidationRange')]"
                />
                <q-input
                  class="salInputsAdaptable"
                  dense outlined
                  bg-color="white" color="deep-purple-10"
                  v-model="cv.salary_max"
                  ref="salary_max"
                  :placeholder="$t('addJob.salaryMaxPH')" :hint="null"
                  :rules="[
                    sal => (sal >= 0 && String(sal).length < 6 && sal < 100000) || $t('addJob.salaryValidationRange'),
                  ]"
                />
                
              </div>
              
            </div>
          </div>
        </div>

        <q-btn
          class="headerBtns1 weight600"
          style="align-self: center; background-color: var(--violet-btn-color); color: white; font-size: 12px; font-height: 15px; padding: 0 26px; margin-top: 20px;"
          :label="isNew ? $t('addCv.labelNew') : $t('addCv.labelEdit')"
          @click="tryAdd"
        />
      </div>
      <div v-else-if="user.role == 'guestUnau' || user.role == 'guest'" :key="3" class="cvpage__wrapper">
        {{$t('addJob.unauthorized')}}
      </div>
    </transition>
  </div>
</template>

<script>
import TextField from 'components/atoms/TextField'
import BoolField from 'components/atoms/BoolField'

export default {
  name: 'AddCv',
  components: { TextField, BoolField },
  computed: {
    photo () { return this.$store.state.user.logo_url },
    uid () { return this.$store.state.user.user_id },
    user () { return { role: this.$store.state.user.role } },
    isNew () { return !this.$store.state.user.cv_id }
  },
  data () {
    return {
      loading: false,
      preloaded: false,
      cvInit: {
        name: '',
        surname: '',
        tel: '',
        tel_home: '',
        email: '',
        city_current: '',
        city_based: '',
        driver: {
          a: false,
          b: false,
          c: false,
          d: false
        }, //string 4 1/0-digits long
        car: null, //boolean

        birth: null, //date
        sex: null, //'f' / 'm'
        family: null, // boolean
        exp: null, // bool
        edu: '',
        langs: [],
        skills: '',
        wanted_job: '',
        salary_min: null,
        salary_max: null
      },
      cv: {},
      // photo: null,
      expBlueprint: {
        place: '',
        position: '',
        range: null,
        desc: ''
      },
      eduBlueprint: {
        general: null,
        place: '',
        fac: '',
        spec: '',
        year: null
      },
      cvExt: null,
      // cvExt: { // extended params - exp and edu
      //   exps: [],
      //   edus: []
      // },

      driverOptions: [
        {
          label: this.$t('addCv.catA'),
          value: 'a'
        },
        {
          label: this.$t('addCv.catB'),
          value: 'b'
        },
        {
          label: this.$t('addCv.catC'),
          value: 'c'
        },
        {
          label: this.$t('addCv.catD'),
          value: 'd'
        }
      ],

      props: {},
      specificError: '',
      titleRegex: /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\-\.\,\+\$\%\(\)\№\:\#\/\"]*$/,
      salaryOn: false,
      returned: {
        title: '',
        job_id: -1
      },
      
      lazyRulesAll: true,

      cityList: this.$t('App.cityList'),//["Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"],
      scheduleList: this.$t('addJob.scheduleList'),//["5/2", "6/1", "2/2", "3/2", "3/1", "15/15"],
      
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ size: [ 'small', false, 'large']}],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ 'align': [] }],
        ['clean']
      ],
      
      contactsValidated: true,
      salaryValidated: true,
      descError: '',
      cityOptions: this.cityList,
      scheduleOptions: this.scheduleList,
    }
  },
  activated () {
    if (this.isNew) {
      this.$set(this, 'cv', this.cvInit)
      this.lazyRulesAll = true
    } else {
      this.fetchData()
      // this.$set(this, 'cv', this.cvInit) // redo this - always try to load external
      // this.lazyRulesAll = true
    }
    this.preloaded = false //trigger only once if its ssred
  },
  methods:{
    removePhoto () {
      this.$store.commit('setSubscriberPhoto', null)
      this.$axios
        .delete('/cvphoto.json', null, {
          headers: {'Content-Type': 'multipart/form-data'}
        })
    },
    uploadPhoto ($evt) {
      console.log('arf', $evt.target)
      const files = this.$refs.fileInputX.files
      if (files && files[0]) {
        if (files[0].size < 409601) {
          const url1 = '/cvphoto.json'
          var formData = new FormData()
          formData.append("photo", files[0])
          this.$axios
            .post(url1, formData, {
              headers: {'Content-Type': 'multipart/form-data'}
            })
            .then(resp => {
              if (resp.data && resp.data.success === true && resp.data.link) {
                this.logo_upload_error = null
                // this.$store.dispatch('caboutPropUpd',{prop: 'logo_url', value: resp.data.link})
                //TODO: show it on the form
                //TODO: backend stuff
                // this.photo = resp.data.link
                this.$store.commit('setSubscriberPhoto', resp.data.link)
                this.$q.notify(this.$t('entProfile.picUploaded'))
              
              } else {
                if (resp.data.msg) {
                  if (resp.data.msg === 'file size error') {
                    this.photo = null
                    this.logo_upload_error = this.$t('entProfile.picTooBig')
                    this.$q.notify(this.$t('entProfile.picTooBig'))
                  } else if (resp.data.msg === 'file ext error') {
                    this.photo = null
                    this.logo_upload_error = this.$t('entProfile.picWrongExt')
                    this.$q.notify(this.$t('entProfile.picWrongExt')) 
                  } else {
                    this.photo = null
                    this.$q.notify(resp.data.msg) 
                  }
                }
              }
            })
            .catch(err => this.$q.notify(err))
        } else {
          this.$refs.fileInputX.value = ''
          this.logo_upload_error = this.$t('entProfile.picTooBig')
          this.$q.notify(this.$t('entProfile.picTooBig'))
        }
      } else {
        console.log('file change no file')
      }
    },
    addOneEdu () {
      console.log('aaaa', this.cvExt)
      if (this.cvExt) {
        if (!this.cvExt.edus) {
          this.$set(this.cvExt, 'edus', [])
        }
        this.$set(this.cvExt, 'edus', this.cvExt.edus.concat(
          Object.assign({}, this.eduBlueprint)
        ))
      }
    },
    addOneExp () {
      if (this.cvExt && this.cvExt.exps) {
        this.$set(this.cvExt, 'exps', this.cvExt.exps.concat(
          Object.assign({}, this.expBlueprint)
        ))
      }
    },
    expSwitch () {
      // this.cv.exp
      if (!this.cv.exp) {
        this.$set(this, 'cvExt', null)
        // this.cvExt = null
      } else {
        this.$set(this, 'cvExt', {
          exps: [ Object.assign({}, this.expBlueprint) ],
          edus: [ Object.assign({}, this.eduBlueprint) ]
        })
        // this.cvExt = {
        //   exps: [ Object.assign({}, this.expBlueprint) ],
        //   edus: [ Object.assign({}, this.eduBlueprint) ]
        // }
      }
      console.log(this.cv.exp)
      console.log(this.cvExt)
    },
    fetchData () {
      //do this for ssr case??? or maybe there is no need to hydrate that???
      this.loading = true
      this.$axios
        .get('/cv', null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(resp => {
          const respd = resp.data
          const driverDict = ['a', 'b', 'c', 'd']
          respd.driver = respd.driver.split('').reduce((acc, cur, didx) => {
            acc[driverDict[didx]] = !!Number(cur)
            return acc
          }, {})
          if (respd.city_current === null) respd.city_current = ''
          if (respd.city_based === null) respd.city_based = ''
          
          // if (this.$store.state && this.$store.state.user) {
          //   this.photo = this.$store.state.user.logo_url || null
          // }

          if (respd.cvExt) {
            if (respd.cvExt.exps && respd.cvExt.exps.length) {
              respd.cvExt.exps.forEach(exp => {
                exp.range = {from: exp.start ? exp.start.substring(0,10) : null, to: exp.end ? exp.end.substring(0,10) : null}
              })
            }
            this.$set(this, 'cvExt', respd.cvExt)
            delete respd.cvExt
          }
          this.$set(this, 'cv', respd)
          
          this.lazyRulesAll = true
          this.loading = false
        })
        .catch(err => {
          this.$q.notify({
            message: this.$t('addCv.cvInitialDataError') + ' ' + err,
            color: 'red'
          })
          this.loading = false
          this.$router.push('/subprofile')
        })
    },
    addNewCity (e) {
      this.cityUpd(e.target.value)
    },
    addNewBasedCity (e) {
      this.cityBasedUpd(e.target.value)
    },
    cityUpd (new1) {
      this.cv.city_current = new1
    },
    cityBasedUpd (new2) {
      this.cv.city_based = new2
    },

    resetFields() {//Ok
      this.job = Object.assign({}, this.jobInit)
      this.lazyRulesAll = true
    },
    
    tryAdd() {
      //TODO: front validation after back validation is done
      
      this.lazyRulesAll = false
      let scrollPos
      //name
      this.$refs.name.$refs.qinput.validate()
      if (this.$refs.name.$refs.qinput.hasError) {
        scrollPos = 130
      }
      this.$refs.surname.$refs.qinput.validate()
      if (this.$refs.surname.$refs.qinput.hasError) {
        scrollPos = 150
      }
      
      this.$refs.tel.$refs.qinput.validate()
      if (this.$refs.tel.$refs.qinput.hasError) {
        scrollPos = 170
      }
      
      this.$refs.tel_home.$refs.qinput.validate()
      if (this.$refs.tel_home.$refs.qinput.hasError) {
        scrollPos = 190
      }
      this.$refs.wanted_job.$refs.qinput.validate()
      if (this.$refs.wanted_job.$refs.qinput.hasError) {
        scrollPos = 1700
      }
      this.$refs.salary_min.validate()
      if (this.$refs.salary_min.hasError) {
        scrollPos = 1800
      }
      this.$refs.salary_max.validate()
      if (this.$refs.salary_max.hasError) {
        scrollPos = 1800
      }

      if (scrollPos)
        this.$emit('scrollTo', scrollPos)
      else {
        this.sendCVData()
      }
    },
    sendCVData() {
      this.$axios
        .post('/cv', { ...this.cv, cvExt: this.cvExt }, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
        .then(response => {
          if (response.data && response.data.result === 'OK') {
            // this.returned.title = response.data.title
            // this.returned.job_id = response.data.job_id
            if (response.data.cv_id) {
              this.$store.commit('setCvId', response.data.cv_id)
            }

            this.resetFields()
            this.$q.notify({
              message: this.$t('addCv.cvSaved'),
              color: 'green'
            })
            //TODO: redirect to detail/preview screen
            this.$router.push('/subprofile?tab=cv')
          } else {
            // errors
            console.log('ERROR!', response)
            this.$q.notify({
              message: this.$t('addCv.cvSaveValidationError') + ' ' + response.data,
              color: 'red'
            })
            
            // if (response.data && response.data == 'error limits reached') {
            //   this.$store.dispatch('setAJSentState', 'limit')
            //   this.specificError = response.data
            // } else {
            //   this.specificError = response
            //   this.$store.dispatch('setAJSentState', 'fail')
            // }
          }
        })
        .catch(err => {
          console.log('ERRRRR CATCH', err)
          this.$q.notify({
              message: this.$t('addCv.cvSaveValidationError'),
              color: 'red'
            })
        })
    },
    isValidMail(mail) {
      return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(mail)
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
    scheduleUpd(new1) {
      this.job.schedule = new1
    },
  }
}
</script>

<style lang="stylus">
.add-cv .headerBtns1
  font-weight 500 !important
.add-cv .expansion1 .q-item__section--side
  display none
.add-cv .expansion1 .q-item__section--main
  height 22px
  margin-left auto
  border-bottom 1px solid var(--violet-btn-color)
  max-width fit-content
  padding-right 14px
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position right 1px center
.add-cv .expansion1 .q-expansion-item__container .q-link.q-item--dense
  height 22px !important
  padding 0
.add-cv .expansion1 .q-expansion-item__container .q-focus-helper
  height 22px !important
  padding 0


.add-cv .q-field--outlined .q-field__control:before
  border 0 !important
.add-cv .q-field__control
  font-size: 16px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
  @media screen and (max-width 550px)
    font-size: 14px;
.add-cv .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.add-cv .q-field__native input
  height 36px
.add-cv .q-field__append
  height 36px
.add-cv .q-select__dropdown-icon
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position center center
.dropdown-padding-adjust .q-field__control
  padding-right 4px !important

.add-cv .salcb1 .q-checkbox__inner
  left 0px
  margin-right 0
  height 20px
  width 20px
  min-width 20px
  margin-right 8px !important

//desc field
.add-cv .ql-toolbar.ql-snow
  border-top-left-radius 10px
  border-top-right-radius 10px
.add-cv .ql-container.ql-snow
  border-bottom-left-radius 10px
  border-bottom-right-radius 10px
.q-field__bottom
  padding 5px
div.q-field__messages
  display flex
  justify-content center

.add-cv .addCv__desc-inp .q-field__control
  font-size: 15px;
  line-height: 15px;
  border-radius 10px;
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1);
  padding 10px;
  min-height 160px !important
  height 160px !important
.add-cv .addCv__desc-inp .q-field__native
  padding 0 !important
  font-size 16px
  min-height 138px !important
  height 138px !important
  resize none
.add-cv .addCv__desc-inp .q-field__bottom
  padding-right 0

.add-cv .lang-select .q-field__control
  max-height none !important
  height auto !important
.add-cv .lang-select .q-field__native
  height: auto !important;

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

.add-cv
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
  .cvpage__wrapper
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
    margin-bottom 20px
    @media screen and (max-width 550px)
      width 100%
      max-width none
      padding 26px 34px
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
  .startP-header-wrapper
    @media screen and (min-width 551px)
      position absolute
  .startP-header
    font-weight 600
    font-size 20px
    @media screen and (max-width 550px)
      font-size 17.7px
      text-align center
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
  margin-left auto
  margin-right auto
  &:focus
    outline none
    box-shadow inset 0px 0px 0px 2px var(--color1) !important
  &:hover
    border-color var(--color1)
    // background-color var(--violet-btn-color)
  &:hover>.logo-placeholder
    outline 1px dashed var(--color1)
    //border-color var(--color1)
  @media screen and (min-width 551px)
    margin-right 0
.logo-placeholder
  min-width 110px
  min-height 110px
  max-height 110px
  background-size 60%
  background-repeat no-repeat
  background-position center
  // outline 1px solid rgba(0,0,0,0.24)
  box-sizing border-box
  transition-duration 0.3s

</style>

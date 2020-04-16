<template>
  <div class="registration">
    <div v-if="user.role && user.role.startsWith('guest')" class="registration__main">
      <q-tabs
        :value="regState"
        @input="$store.dispatch('regStateChange', $event)"
        inline-label
        class="shadow-2 tabs"
        active-color="red-10"
      >
        <!-- style="color: white; backgroundColor: var(--main-borders-color);" -->
        <q-tab name="login" style="width:50%;fontWeight:900; letter-spacing: 2px;">
          {{$t('reg.loginLabel')}}
        </q-tab>
        <q-tab name="reg" style="width:50%; fontWeight:900; letter-spacing: 1px">
          {{$t('reg.regLabel')}}
        </q-tab>
      </q-tabs>
      <q-tab-panels class="registration__inner" :value="regState" animated>
        <q-tab-panel name="login">
          <form @submit.prevent="trylog" style="margin-top: 12px">
            <!-- trylog -->
            <div style="display:flex; width: 100%; margin-bottom: 10px">
              <label style="alignSelf: center; width: 120px;margin-bottom: 15px" for="mailInput1">* {{$t('reg.loginEmailLabel')}}</label>
              <q-input
                id='mailInput1'
                name="login__mail"
                square
                dense
                outlined
                use-input
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="login.mail"
                hint=""
                autocomplete="true"
                :error-message="login.validation.mail"
                :error="login.validation.mail != ''"
                style="width: 100%;"
                @blur="validateMail"
                @input="login.validation.mail = ''"
              />
            </div>
            <div style="display:flex; width: 100%;">
              <label style="alignSelf: center; width: 120px;;margin-bottom: 15px" for="pwInput1">* {{$t('reg.loginPWLabel')}}</label>
              <q-input
                id='pwInput1'
                name="login__pw"
                square
                dense
                outlined
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="login.pw"
                hint=""
                :error-message="login.validation.pw"
                :error="login.validation.pw != ''"
                style="width: 100%;"
                @blur="validatePW"
                @input="login.validation.pw = ''"
              />
            </div>
            <div class="row spacebetw">
              <q-checkbox color="red-10" v-model="login.rememberme" :label="$t('reg.rmeLabel')" />
              <a href="/forgotten.json" style="alignSelf: center; color:var(--main-borders-color)">{{$t('reg.frgtPWLabel')}}</a>
            </div>
            <q-btn 
              color="red-10"
              :label="$t('reg.enterBtn')"
              type="submit"
              :loading="submitting"
              class="submitBtn"
            />
            <!-- <input type="submit" value="Войти"> -->
            <p v-if="login.status != ''" style="color: #c00; padding: 0; margin: 0; margin-top: 10px">{{login.status}}</p>
            <p v-if="notVerified == true" style="margin: 0; margin-top: 10px; alignSelf: center;">
              <a href="/resend.json" style="color:var(--main-borders-color)">Отправить верификацию еще раз</a>
            </p>
          </form>
        </q-tab-panel>
        <q-tab-panel name="reg">
          <form action="#" @submit.prevent="tryreg">
            <div style="display:flex; justify-content: space-around; width: 100%; margin-bottom: 10px">
              <q-radio color="red-10" v-model="usertype" dense val="subscriber" :label="$t('reg.radioSub')" />
              <q-radio color="red-10" v-model="usertype" dense val="company" :label="$t('reg.radioCom')" />
            </div>
            <!-- <div class="line">
              <input type="radio" v-model="usertype" id="r1" name="usertype" value="subscriber">
              <label class="twolined" for="r1">Специалист (Ищу работу)</label>
              <input type="radio" v-model="usertype" id="r2" name="usertype" value="company">
              <label class="twolined" for="r2">Компания (Работодатель)</label>
            </div> -->
            <div v-show="usertype === 'company'" style="display:flex; width: 100%;">
              <label style="alignSelf: center; width: 120px;margin-bottom: 15px">* {{$t('reg.companyLabel')}}</label>
              <q-input
                square
                dense
                outlined
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="company"
                hint=""
                style="width: 100%;"
                :error-message="validation.company"
                :error="validation.company != ''"
                @blur="valiRegCompany"
                @input="validation.company = ''"
              />
            </div>
            <div
              v-show="usertype === 'company'"
              style="display:flex; width: 100%; margin-top: -8px; margin-bottom: 14px"
            >
              <q-checkbox
                color="red-10" :label="$t('reg.agencyLabel')"
                v-model="agency"
                style="font-family: Montserrat, sans-serif;"
                left-label
              />
            </div>
            <div v-show="usertype === 'subscriber'">
              <div style="display:flex; width: 100%; margin-bottom: 10px">
                <label style="alignSelf: center; width: 120px;margin-bottom: 15px" for="name2">* {{$t('reg.nameLabel')}}</label>
                <q-input
                  id='name2'
                  square
                  dense
                  outlined
                  bg-color="deep-purple-1" color="deep-purple-10"
                  v-model="name"
                  hint=""
                  :error-message="validation.name"
                  :error="validation.name != ''"
                  style="width: 100%;"
                  @blur="valiRegName"
                  @input="validation.name = ''"
                />
              </div>
              <div style="display:flex; width: 100%; margin-bottom: 10px">
                <label style="alignSelf: center; width: 120px;margin-bottom: 15px" for="surname2">* {{$t('reg.surnameLabel')}}</label>
                <q-input
                  id='surname2'
                  square
                  dense
                  outlined
                  bg-color="deep-purple-1" color="deep-purple-10"
                  v-model="surname"
                  hint=""
                  :error-message="validation.surname"
                  :error="validation.surname != ''"
                  style="width: 100%;"
                  @blur="valiRegSurname"
                  @input="validation.surname = ''"
                />
              </div>
            </div>
            <div style="display:flex; width: 100%; margin-bottom: 10px">
              <label style="alignSelf: center; width: 120px;;margin-bottom: 15px" for="mailInput2">* {{$t('reg.loginEmailLabel')}}</label>
              <q-input
                id='mailInput2'
                square
                dense
                outlined
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="mail"
                hint=""
                :error-message="validation.mail"
                :error="validation.mail != ''"
                style="width: 100%;"
                @blur="valiRegMail"
                @input="validation.mail = ''"
              />
            </div>
            <div style="display:flex; width: 100%; margin-bottom: 10px">
              <label style="alignSelf: center; width: 120px;;margin-bottom: 15px" for="pw2">* {{$t('reg.loginPWLabel')}}</label>
              <q-input
                id='pw2'
                square
                dense
                outlined
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="pw"
                hint=""
                :error-message="validation.pw"
                :error="validation.pw != ''"
                style="width: 100%;"
                @blur="valiRegPW"
                @input="validation.pw = ''"
              />
            </div>
            <div style="display:flex; width: 100%; margin-bottom: 10px">
              <label style="alignSelf: center; width: 120px;;margin-bottom: 15px; display:flex" for="pwc2"><div style="margin-right: 4px">*</div>{{$t('reg.regConfirmPWLabel')}}</label>
              <q-input
                id='pwc2'
                square
                dense
                outlined
                bg-color="deep-purple-1" color="deep-purple-10"
                v-model="pwc"
                hint=""
                :error-message="validation.pwc"
                :error="validation.pwc != ''"
                style="width: 100%;"
                @blur="valiRegPWC"
                @input="validation.pwc = ''"
              />
            </div>
            
            <div style="display: flex; flex-direction:row; margin-bottom: 12px">
              <q-checkbox
                style="align-self: flex-start;margin-top:-8px" color="red-10" id="rulescb1" v-model="rules" :error-message="validation.rules" :error="validation.rules != ''"/>
              <label style="text-align: justify;" for="rulescb1">
                * {{$t('reg.rulesStart')}} <a style="color: var(--btn-color)" href="#">{{$t('reg.rulesLink')}}</a>{{$t('reg.rulesEnd')}}
              </label>
            </div>
            <q-btn 
              color="red-10"
              :label="$t('reg.regBtn')"
              type="submit"
              :loading="submitting"
              class="submitBtn"
            />
          </form>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <div v-else>
      {{$t('reg.alreadyAuthedMessage')}}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'registration',
  computed: {
    ...mapState(['user', ['role']]),
    ...mapState(['regState']),
    ...mapState(['authStatus'])
  },
  data: ()=>{return {
    notVerified: false,
    login: {
      mail: '',
      pw: '',
      status: '',
      rememberme: true,
      showErrors: false,
      validation: {
        mail: '',
        pw: ''
      }
    },
    submitting: false,
    wordRegex: /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\\-]*$/,
    pwRegex: /[a-zA-Z]/, //хотябы одна a-zA-Z
    mail: '',
    pw: '',
    pwc: '',
    rules: false,
    usertype: 'subscriber',
    company: '',
    agency: false,
    name: '',
    surname: '',
    status: '',
    showErrors: false,
    validation: {
      mail: '',
      pw: '',
      pwc: '',
      rules: '',
      company: '',
      name: '',
      surname: ''
    }
  }},
  methods: {
    tryreg() {
      this.$store.dispatch('setAuthStatus', this.$t('reg.regAllFields'))
      //client validation here
      if (this.rules != true) this.rules = false
      if (this.agency != true) this.agency = false
      if (this.validate()) {
        this.showErrors = false
        this.submitting = true
        this.$axios
          .post('/reg', [this.mail.toLowerCase(), this.pw, this.usertype, this.usertype === 'subscriber' ? this.name : this.company, this.usertype === 'subscriber' ? this.surname : this.agency], {headers: {'Content-Type' : 'application/json' }})
          .then(response => {
            if (response.data == 'OK') {
              this.$store.dispatch('setAuthStatus', this.$t('reg.regSuccess'))
              this.mail = ''
              this.pw = ''
              this.pwc = ''
              this.rules = false
              this.name = ''
              this.surname = ''
              this.company = ''
              this.agency = false
              this.$store.dispatch('regStateChange', 'login')
              this.login.mail = ''
              this.login.pw = ''
              this.login.status = ''
              this.login.validation.mail = ''
              this.login.validation.pw = ''
            }
            else if (response.data == 'step3') {
              this.$store.dispatch('setAuthStatus', this.$t('reg.regError3'))
            }
            else if (response.data == 'step2') {
              this.$store.dispatch('setAuthStatus', this.$t('reg.regError2'))
            }
            else if (response.data == 'step1') {
              this.$store.dispatch('setAuthStatus', this.$t('reg.regError1'))
            }
            else console.dir('successful registering', response.data)
            this.submitting = false
            this.$q.notify(this.authStatus)
          })
      } else {this.showErrors = true; this.$q.notify(this.authStatus)}
    },
    valiRegMail(){
      let mailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      if (this.mail.length === 0)
        this.validation.mail = ''
      else if (!mailregex.test(this.mail.toLowerCase())) 
        this.validation.mail = this.$t('reg.loginValiMailFormat')
      else this.validation.mail = ''
      return this.validation.mail === ''
    },
    valiRegName(){
      if (this.usertype === 'subscriber') {
        if (this.name.length === 0)
          this.validation.name = ''
        else if (this.name.length < 3)
          this.validation.name = this.$t('reg.nameValiMin')
        else if (this.name.length > 35)
          this.validation.name = this.$t('reg.nameValiMin')
        else if (!this.wordRegex.test(this.name))
          this.validation.name = this.$t('reg.nameValiFormat')
        else this.validation.name = ''
        return this.validation.name === ''
      } else return true
    },
    valiRegSurname(){
      if (this.usertype === 'subscriber') {
        if (this.surname.length === 0)
          this.validation.surname = ''
        else if (this.surname.length < 3)
          this.validation.surname = this.$t('reg.surnameValiMin')
        else if (this.surname.length > 35)
          this.validation.surname = this.$t('reg.surnameValiMax')
        else if (!this.wordRegex.test(this.surname))
          this.validation.surname = this.$t('reg.surnameValiFormat')
        else this.validation.surname = ''
      } else return true
    },
    valiRegCompany(){
      if (this.usertype === 'company') {
        if (this.company.length === 0)
          this.validation.company = ''
        else if (this.company.length < 3)
          this.validation.company = this.$t('reg.compValiMin')
        else if (this.company.length > 60)
          this.validation.company = this.$t('reg.compValiMax')
        else if (!this.wordRegex.test(this.company))
          this.validation.company = this.$t('reg.compValiFormat')
        else this.validation.company = ''
      } else return true
    },
    valiRegPW(){
      if (this.pw.length === 0)
        this.validation.pw = ''
      else if (this.pw.length < 6)
        this.validation.pw = this.$t('reg.regValiPWMin')
      else if (this.pw.length > 25)
        this.validation.pw = this.$t('reg.regValiPWMax')
      else if (!this.pwRegex.test(this.pw))
        this.validation.pw = this.$t('reg.regValiPWChar')
      else this.validation.pw = ''
      return this.validation.pw === ''
    },
    valiRegPWC(){
      if (this.pwc.length === 0)
        this.validation.pwc = ''
      else if (this.pwc !== this.pw)
        this.validation.pwc = this.$t('reg.regValiPWCDiff')
      else this.validation.pwc = ''
      return this.validation.pwc === ''
    },
    validate(){
      let mailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      if (this.mail.length === 0)
        this.validation.mail = this.$t('reg.loginValiMail0')
      else if (!mailregex.test(this.mail.toLowerCase())) 
        this.validation.mail = this.$t('reg.loginValiMailFormat')
      else this.validation.mail = ''

      if (this.usertype === 'subscriber') {
        if (this.name.length === 0)
          this.validation.name = this.$t('reg.nameVali0')
        else if (this.name.length < 3)
          this.validation.name = this.$t('reg.nameValiMin')
        else if (this.name.length > 35)
          this.validation.name = this.$t('reg.nameValiMax')
        else if (!this.wordRegex.test(this.name))
          this.validation.name = this.$t('reg.nameValiFormat')
        else this.validation.name = ''

        if (this.surname.length === 0)
          this.validation.surname = this.$t('reg.surnameVali0')
        else if (this.surname.length < 3)
          this.validation.surname = this.$t('reg.surnameValiMin')
        else if (this.surname.length > 35)
          this.validation.surname = this.$t('reg.surnameValiMax')
        else if (!this.wordRegex.test(this.surname))
          this.validation.surname = this.$t('reg.surnameValiFormat')
        else this.validation.surname = ''
      } else {

        if (this.company.length === 0)
          this.validation.company = this.$t('reg.compVali0')
        else if (this.company.length < 3)
          this.validation.company = this.$t('reg.compValiMin')
        else if (this.company.length > 60)
          this.validation.company = this.$t('reg.compValiMax')
        else if (!this.wordRegex.test(this.company))
          this.validation.company = this.$t('reg.compValiFormat')
        else this.validation.company = ''
      }

      if (this.pw.length === 0)
        this.validation.pw = this.$t('reg.regValiPW0')
      else if (this.pw.length < 6)
        this.validation.pw = this.$t('reg.regValiPWMin')
      else if (this.pw.length > 25)
        this.validation.pw = this.$t('reg.regValiPWMax')
      else if (!this.pwRegex.test(this.pw))
        this.validation.pw = this.$t('reg.regValiPWChar')
      else this.validation.pw = ''

      if (this.pwc.length === 0)
        this.validation.pwc = this.$t('reg.regValiPWC0')
      else if (this.pwc !== this.pw)
        this.validation.pwc = this.$t('reg.regValiPWCDiff')
      else this.validation.pwc = ''

      if (!this.rules) this.validation.rules = this.$t('reg.regValiRules')
      else this.validation.rules = ''

      if (this.validation.mail === '' && 
          this.validation.pw === '' && 
          this.validation.pwc === '' && 
          this.validation.rules === '' &&
          ( ( this.usertype === 'subscriber' &&
              this.validation.name === '' && 
              this.validation.surname === '')
            ||
            ( this.usertype === 'company' &&
              this.validation.company === '')
          ))
        return true
      return false
    },
    // regStateUpd(val){
    //   this.$store.dispatch('regStateChange', val)
    // },
    trylog() {
      //this.login.status = ''
      
      //client validation here
      if (this.validateLogin()) {
        this.showErrors = false
        //this.login.status = 'Попытка входа'
        this.submitting = true
        this.$axios
          .post('/login', [this.login.mail.toLowerCase(), this.login.pw, this.login.rememberme], {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            //fix: need to send auth data on login
            if (response.data && response.data.success && response.data.success == 'OK') {
              this.login.status = ''
              this.$q.notify({type:'positive', message: this.$t('reg.loginSuccess')})
              // console.log('cp123ss:', response.data.slice(1))
              // this.$emit('authed', response.data.slice(1))
              this.$store.dispatch('loginGo', response.data)
              localStorage.setItem('userData',JSON.stringify(response.data))
              
              this.$router.push('/')
              // this.$emit('refresh')
              this.$store.dispatch('refreshjobs', {})
              this.login.mail = ''
              this.login.pw = ''
            }
            else if (response.data == 'step3') {
              this.login.status = this.$t('reg.loginError3')
              this.$q.notify(this.login.status)
            }
            else if (response.data == 'step2') {
              this.login.status = this.$t('reg.loginError2')
              this.$q.notify(this.login.status)
              //send this in both cases
            }
            else if (response.data == 'step1') {
              this.login.status = this.$t('reg.loginError1')
              this.$q.notify(this.login.status)
            }
            else if (response.status == 209) {
              this.$q.notify({type: 'negative', message: response.data})
              this.login.status = response.data
            }
            else if (response.status == 211) {
              this.$q.notify({type: 'negative', message: response.data})
              this.notVerified = true
              this.login.status = response.data
            }
            else console.dir('successful login', response.data, response.headers)
            this.submitting = false
          })
      } else this.login.showErrors = true
    },
    validateMail(){
      let mailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      if (this.login.mail.length === 0) 
        this.login.validation.mail = ''
      else if (!mailregex.test(this.login.mail.toLowerCase())) 
        this.login.validation.mail = this.$t('reg.loginValiMailFormat')
      else this.login.validation.mail = ''
      return this.login.validation.mail === ''
    },
    validatePW(){
      if (this.login.pw.length === 0)
        this.login.validation.pw = ''
      else if (this.login.pw.length < 5 || this.login.pw.length > 25)
        this.login.validation.pw = this.$t('reg.loginValiPWFormat')
      else this.login.validation.pw = ''
      return this.login.validation.pw === ''
    },
    validateLogin(){
      let mailregex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      if (this.login.mail.length === 0) 
        this.login.validation.mail = this.$t('reg.loginValiMail0')
      else if (!mailregex.test(this.login.mail.toLowerCase())) 
        this.login.validation.mail = this.$t('reg.loginValiMailFormat')
      else this.login.validation.mail = ''

      if (this.login.pw.length === 0)
        this.login.validation.pw = this.$t('reg.loginValiPW0')
      else if (this.login.pw.length < 5 || this.login.pw.length > 25)
        this.login.validation.pw = this.$t('reg.loginValiPWFormat')
      else this.login.validation.pw = ''

      if (this.login.validation.mail === '' && 
          this.login.validation.pw === '')
        return true
      return false
    }
  },
  mounted() {
    //console.log(this.$route.query.login)
    if (this.$route.query.login == 1) this.$store.dispatch('regStateChange', 'login')
    if (this.$route.query.login == 2) this.$store.dispatch('regStateChange', 'reg')
  }
}
</script>

<style scoped lang="stylus">
*
  font-family Montserrat, sans-serif
  font-size 14px
.registration
  padding 15px 0
  margin 0
  max-width 380px
  width 380px
  min-height calc(100vh - 148px)
  display flex
  align-items flex-start
  padding-top 50px
  .registration__main
    //border 2px solid black
    width 380px
  .registration__inner
    background-color #fff//#eee
    border-bottom-left-radius 5px
    border-bottom-right-radius 5px
    box-shadow 0 0 4px 1px var(--main-borders-color)
  .tabs
    border-top-left-radius 5px
    border-top-right-radius 5px
    box-shadow 0 0 4px 1px var(--main-borders-color)
    color var(--color1)
    font-weight 700
  form
    display flex
    flex-direction column
    text-align left
    input
      margin-bottom 5px
      &:last-child
        margin-bottom 0
    input[type="checkbox"]
      margin-bottom 0
    .twolined
      display flex
      flex-wrap wrap
    .line
      display flex
      padding 5px
      border 1px solid gray
      margin 5px 0
      border-radius 4px
    .colx
      display flex
      flex-direction column
      padding 5px
      border 1px solid gray
      margin 5px 0
      border-radius 4px
    .row
      display flex
    .err_span
      color #c00
      margin-left 5px
    .spacebetw
      justify-content space-between
      margin-bottom 5px
    // #rulescb
    //   display inline
    //   margin-right 5px
    // .rulescb-label
    //   line-break normal
    //   display inline
.submitBtn
  margin 0 auto
  width 45%
  font-weight 700
  letter-spacing 2px
</style>
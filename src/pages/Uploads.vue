<template>
  <div class="uploads">
    <div v-if="user.role === 'company' && user.isagency === true" class="authed uploads__inner">
      <h4 class="uploads__header">{{$t('upl.header')}}</h4>
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        style="paddingLeft: 0"
      >
        <q-step
          :name="1"
          :title="$t('upl.stepAdd')"
          icon="settings"
          :done="step > 1"
        >
          <div style="margin-bottom: 10px;">
            {{$t('upl.chooseFile')}} <a style="color: var(--violet-btn-color);" href="/statics/vac.xlsx">{{$t('upl.fileExample')}}</a>
          </div>
          <q-input
            @change="parseFile"
            outlined
            dense
            style="max-width: 250px"
            type="file"
            hint=".xls и .xlsx файлы"
            accept=".xls, .xlsx"
            ref="fileUploader"
            name="fileUploader"
            id="fileUploader"
          />
        </q-step>
        <q-step
          :name="2"
          :title="$t('upl.stepPublish')"
          icon="create_new_folder"
          :done="step > 2"
        >
          <div>
            <table style="border-spacing: 0; margin-bottom: 15px;">
              <thead>
                <tr style="background-color: black; color: white;">
                  <td>{{$t('upl.tdTilte')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdSalMin')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdSalMax')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdCurr')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdAgeFrom')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdAgeTo')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdTimeFrom')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdTimeTo')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdSchedule')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdLangs')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdEdu')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdExp')}}</td>
                  <td>{{$t('upl.tdCity')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdJTyp')}}</td>
                  <td>{{$t('upl.tdMore')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdTel')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdMail')}}</td>
                  <td class="noshow-below550">{{$t('upl.tdJCategory')}}</td>
                </tr>
              </thead>
              <tr @input="onEditableInput" v-for="(item, index) in parsed" :key="index" :itemindex="index">
                <td contenteditable="true" propname="title">{{item.title}}</td>
                <td contenteditable="true" class="noshow-below550" propname="salary_min">{{item.salary_min}}</td>
                <td contenteditable="true" class="noshow-below550" propname="salary_max">{{item.salary_max}}</td>
                <td contenteditable="true" class="noshow-below550" propname="currency">{{item.currency}}</td>
                <td contenteditable="true" class="noshow-below550" propname="age1">{{item.age1}}</td>
                <td contenteditable="true" class="noshow-below550" propname="age2">{{item.age2}}</td>
                <td contenteditable="true" class="noshow-below550" propname="worktime1">{{item.worktime1}}</td>
                <td contenteditable="true" class="noshow-below550" propname="worktime2">{{item.worktime2}}</td>
                <td contenteditable="true" class="noshow-below550" propname="schedule">{{item.schedule}}</td>
                <td contenteditable="true" class="noshow-below550" propname="langs">{{item.langs}}</td>
                <td contenteditable="true" class="noshow-below550" propname="edu">{{item.edu}}</td>
                <td contenteditable="true" class="noshow-below550" propname="experience">{{item.experience}}</td>
                <td contenteditable="true" propname="city">{{item.city}}</td>
                <td contenteditable="true" class="noshow-below550" propname="jtype">{{item.jtype}}</td>
                <td contenteditable="true" propname="description">{{item.description}}</td>
                <td contenteditable="true" class="noshow-below550" propname="contact_tel">{{item.contact_tel}}</td>
                <td contenteditable="true" class="noshow-below550" propname="contact_mail">{{item.contact_mail}}</td>
                <td class="noshow-below550" propname="jcategory">{{item.jcategory}}</td>
              </tr>
            </table>
            <q-btn v-if="step > 1" flat color="primary" @click="resetParsed" :label="$t('upl.reset')" class="q-ml-sm" />
            <q-btn color="primary" @click="sendNewJobs" :disabled="parsed.length < 1" :label="$t('upl.publish')"/>
          </div>
        </q-step>
        <q-step
          :name="3"
          :title="$t('upl.stepFinish')"
          icon="done"
          :done="step > 3"
        >
          <p>{{uploadStatus}}</p>
          <q-btn color="primary" @click="step = 1" :disabled="step.length < 3" :label="$t('upl.addMore')"/>
        </q-step>
      </q-stepper>
      <h4 class="uploads__header">{{$t('upl.allPublishedHeader')}} ({{user.ownJobs.length}})</h4>
      <div class="uploads__published">
        <JobsStats/>
      </div>
    </div>
    <div v-else-if="user.role != 'company'">
      {{$t('upl.authPlsMsg')}}
    </div>
    <div v-else-if="user.isagency === false">
      {{$t('upl.onlyAgency')}}
    </div>
  </div>
</template>

<script>
import xlsx from 'xlsx'

import { mapState } from 'vuex'

import JobsStats from 'components/organisms/JobsStats.vue'


export default {
  name: 'uploads',
  data() {
    return {
      step: 1,
      file: undefined,
      parsed: [],
      uploadStatus: this.$t('upl.readyToUpload')
    }
  },
  computed: {
    ...mapState(['user', ['role', 'ownJobs', 'isagency']]),
  },
  mounted() {
    this.$store.dispatch('getOwnJobs')
  },
  methods:{
    onEditableInput(e) {
      //console.log('event: ', e)
      let itemindex = e.target.parentElement.getAttribute('itemindex')
      let propname = e.target.getAttribute('propname')
      let newContent = e.target.textContent
      // console.log('t ', e.target.getAttribute('propname'))
      // console.log('t1 ', e.target.textContent)
      // console.log('t2 ', e.target.parentElement.getAttribute('itemindex'))
      this.parsed[itemindex][propname] = newContent
    },
    resetParsed() {
      this.parsed = []
      this.step = 1
    },
    transformJCats() {
      //в экселе указываются пока что только на русском
      const JCATS = {"Не имеет значения":0,"Бух учет, финансы":19,"Гос служба":1,"Дизайн, полиграфия":14,"ИТ, Интернет":4,"Красота, фитнес, спорт":12,"Логистика, склад":10,"Маркетинг, реклама":13,"Медицина, Фармация, Ветеринария":9,"Недвижимость, риэлтерские услуги":3,"Нефть и Газ":5,"Образование, репетиторство":6,"Производство, агропром":7,"Рестораны, питание":8,"Строительство":11,"Торговля":2,"Транспорт, автосервис":15,"Туризм, гостиницы":16,"Юриспруденция":17,"HR, кадры":18}
      this.parsed = this.parsed.map(one => {
        // console.log(one.jcategory)
        one.jcategory = JCATS[one.jcategory]
        return one
      })
    },
    sendNewJobs: function () {
      if (this.parsed.length > 0) {
        this.transformJCats()
        // console.log(this.parsed[0])
        this.uploadStatus = 'Идет загрузка...'
        this.$emit('scrollTo', 0)
        this.$axios
          .post('/entrance', this.parsed, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            if (response.data === 'OK') {
              this.uploadStatus = this.$t('upl.success1')
              this.$q.notify(this.$t('upl.success1'))
              this.$store.dispatch('getOwnJobs')
            } else {
              if (response.data && response.data && response.data.msg == 'error limits reached') {
                this.uploadStatus = this.$t('upl.errLimits1') + response.data.added + this.$t('upl.errLimits2') + response.data.total
                if (response.data.added > 0) this.$store.dispatch('getOwnJobs')
              } else this.uploadStatus = this.$t('upl.err1')
              console.log(response.data)
            }
            
          })
        this.parsed = []
        this.step = 3
        
      } else {this.uploadStatus = this.$t('upl.getData')}
    },
    parseFile: function (e) {
      this.files = e.target.files
      let reader = new FileReader()
      let localVue = this
      reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = xlsx.read(data, {type: 'array'});
        
        let tmp = workbook.Sheets[workbook.SheetNames[0]]
        
        let lastLineIndex = tmp["!ref"].split(':')
        lastLineIndex = Math.min(lastLineIndex[lastLineIndex.length - 1].replace(/\D/g,''), 32)
        // console.log('ccc', lastLineIndex)
        function getjtype(val) {
          //console.log('gettype cp1: ', val)
          return (val == localVue.$t('upl.perm')) ? 'c' : (val == localVue.$t('upl.temp')) ? 'v' : ''
        }

        
        let entries = [
          'title', 'salary_min', 'salary_max', 'currency', 'contact_tel', 'contact_mail', 'description',
          'age1', 'age2', 'worktime1', 'worktime2', 'schedule', 'edu', 'experience', 'city', 'jcategory'
        ]
        let len = lastLineIndex
        lastLineIndex = 0
        let newData = []
        let alpha = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('')
        let alphaIndex = 0
        let newl = (entryname) => {
          //console.log(lastLineIndex)
          //console.log(alpha[alphaIndex] + lastLineIndex)
          
          if (alpha[alphaIndex] + lastLineIndex in tmp) newData[lastLineIndex][entryname] = tmp[alpha[alphaIndex] + lastLineIndex].v
          alphaIndex += 1
        }
        while (lastLineIndex <= len) {
          alphaIndex = 0
          newData.push({})
          
          entries.forEach(newl)
          
          console.log((alpha[alphaIndex] + lastLineIndex in tmp && getjtype(tmp[alpha[alphaIndex] + lastLineIndex].v) != ''))
          if (alpha[alphaIndex] + lastLineIndex in tmp && getjtype(tmp[alpha[alphaIndex] + lastLineIndex].v) != '') newData[lastLineIndex].jtype = getjtype(tmp[alpha[alphaIndex] + lastLineIndex].v)
          alphaIndex += 1

          newData[lastLineIndex].langs = []
          if (alpha[alphaIndex] + lastLineIndex in tmp) newData[lastLineIndex].langs.push(tmp[alpha[alphaIndex] + lastLineIndex].v)
          alphaIndex += 1
          if (alpha[alphaIndex] + lastLineIndex in tmp) newData[lastLineIndex].langs.push(tmp[alpha[alphaIndex] + lastLineIndex].v)
          alphaIndex += 1
          if (alpha[alphaIndex] + lastLineIndex in tmp) newData[lastLineIndex].langs.push(tmp[alpha[alphaIndex] + lastLineIndex].v)
          alphaIndex += 1

          lastLineIndex++
        }
        
        
        newData.shift()
        newData.shift()
        newData = newData.filter(d => d.title)
        console.log(newData)
        
        localVue.parsed = newData
        //localVue.$refs.stepper.next()
        localVue.step = 2
      }
      reader.readAsArrayBuffer(this.files[0])
      
    },
    
  },

  components: {
    JobsStats,
  }
}
</script>


<style scoped lang="stylus">
.uploads
  max-width 1280px
  margin-bottom 20px !important
  &__header
    margin-top 16px
    margin-bottom 8px
    font-size 15px
    font-weight 600
  &__published
    padding 10px
    background var(--menubg-color)
    border: 0.5px solid #C2C2C6
    box-sizing: border-box
    border-radius: 10px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
  @media screen and (max-width 550px)
    padding 0 20px
  table
    border-collapse:collapse
  tr:nth-child(odd)
    background-color #eee
  .authed
    margin 10px 0

// .uploads .q-stepper
  

.uploads .q-stepper
  background var(--menubg-color)
  border: 0.5px solid #C2C2C6
  box-sizing: border-box
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)


</style>
<style lang="stylus">
.uploads .q-stepper div.q-stepper__step-inner
  // background-color red
  @media screen and (max-width 550px)
    padding 10px !important
</style>
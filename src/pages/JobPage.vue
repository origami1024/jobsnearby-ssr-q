<template>
  <div class="jobpage">
    <main class="detailed__main1">
      <div v-if="job.is_closed" style="color: red; font-size: 16px">
        {{$t('jobPage.jobClosed')}} {{job.closed_why != '' ? ', ' + $t('jobPage.reason') + ': ' + job.closed_why : ''}}
      </div>
      <div v-if="job.is_published != true" style="color: gray; font-size: 14px">
        ({{$t('jobPage.jobNotPublishedYet')}})
      </div>
      <section class="detailed__line" style="marginBottom: 5px">
        <div class="detailed__col">
          <h1 class="titleHeader">{{job.title}}</h1>
          <p class="salary-deriv" style="font-size: 16px; font-weight: 700; color: #000">{{salary_deriv}}</p>
        </div>
        <div v-if="job.logo_url" class="detailed__logo1" :style="{'background-image': 'url(' + job.logo_url + ')'}" >{{job.logo_url == '' || !job.logo_url ? 'logo placeholder' : ''}}</div>
      </section>
      <section style="display: flex; justify-content: space-between">
        <p>{{job.city}}</p>
        <p class="author-link-wrapper"><a :href="'/companypage?id=' + job.author_id" target="_blank" class="detailed__author-link1">{{job.author}}</a></p>
      </section>
      <section v-if="user.role != 'company'">
        <q-btn
        v-if="!user.ownCVs.find(val=>val.cvjob_id == job.job_id)"
        text-color="white"
        style="background-color: var(--violet-btn-color);alignSelf: center; white-space: nowrap; margin-top:4px; margin-left: 10px; padding: 0 10px; font-weight: 700;"
        class="headerBtns1 violetBtns"
        dense :label="$t('jobPage.sendCV')"
        @click.prevent="$store.dispatch('hitcv', job.job_id)"
      />
      <div 
        style="margin-left: 20px; alignSelf: flex-end; color: gray"
        v-else-if="user.role == 'subscriber'"
      >
        ({{$t('jobPage.cvAlreadySent')}})
      </div>
      </section>
      <section>
        <div>
          <h4 class="detailed__header1">{{$t('jobPage.reqs')}}</h4>
          <div class="subitem" v-if="!(job.experience >=0 || job.age1>0 || job.age2 > 0 || job.edu || (job.langs && job.langs.length > 0))">
            {{$t('jobPage.none')}}
          </div>
          <div class="subitem" v-if="job.experience >= 0">
              {{
                (1 > job.experience >= 0) ?
                  $t('jobPage.expNone')
                :(job.experience >= 1 && 3 > job.experience) ?
                  $t('jobPage.exp1_3')
                :(job.experience >= 3 && 5 > job.experience) ?
                  $t('jobPage.exp3_5')
                :job.experience >= 5 ?
                  $t('jobPage.exp5_')
                : ''
              }}
          </div>
          <div class="subitem" v-if="job.age1 > 0 || job.age2 > 0">
            {{$t('jobPage.ageLabel')}}{{job.age1 > 0 ? ' ' + $t('jobPage.from') + ' ' + job.age1 : ''}}{{job.age2 > 0 ? ' ' + $t('jobPage.to') + ' ' + job.age2 : ''}} {{$t('jobPage.years')}}
          </div>
          <div class="subitem" v-if="job.edu" >
              {{$t('jobPage.eduLabel')}} {{job.edu}}
          </div>
          <div class="subitem" v-if="job.langs && job.langs.length > 0">
              {{$t('jobPage.langsLabel')}} {{job.langs.join(', ')}}
          </div>
        </div>
      </section>
      <section>
        <div>
            <h4 class="detailed__header1">{{$t('jobPage.conds')}}</h4>
            <div class="subitem" v-if="salary_deriv">
              {{$t('jobPage.salLabel')}} {{salary_deriv}}
            </div>
            <div class="subitem" v-if="(job.worktime1 > 0 && job.worktime2 > 0) || job.schedule" >
              
              {{$t('jobPage.schedule')}} {{job.schedule}} {{job.worktime1 ? $t('jobPage.from2') + ' ' + job.worktime1 : ''}} {{job.worktime2 ? $t('jobPage.to') + ' ' + job.worktime2 : ''}}
              
            </div>
            <div class="subitem">
              
              {{$t('jobPage.jTypeLabel')}} {{job.jobtype == 'c' ? $t('jobPage.jTypePermanent') : $t('jobPage.jTypeTemporary')}}
            </div>
        </div>
      </section>
      <section v-if="job.description">
        <div>
            <h4 class="detailed__header1">{{$t('jobPage.desc')}}</h4>
            <div class="subitem">
              <div class="descriptionHTML" v-html="job.description">
              </div>
            </div>
        </div>
      </section>
      <section>
        <div>
            <h4 class="detailed__header1">{{$t('jobPage.contacts')}}</h4>
            <div class="subitem" v-if="job.contact_mail">
              {{job.contact_mail}}
            </div>
            <div class="subitem" v-if="job.contact_tel" >
              {{job.contact_tel}}
            </div>
        </div>
      </section>
      <section style="display: flex; justify-content: space-between;">
        <p>{{$t('jobPage.publishedDate')}} {{published}}</p>
        <p style="font-size: 17px">
          <svg width="20" height="12" class="bdscolored">
            <rect width="18" x="1" y="1" height="10" fill="transparent" stroke-width="2" style="stroke:var(--violet-btn-color)" rx="15"/>
            <circle cx="50%" cy="50%" r="4" style="fill:var(--violet-btn-color)" />
          </svg>
          <span>{{job.hits_all > 0 ? job.hits_all : 1}}</span>
        </p>
      </section>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'jobpage',
  data() {return {
    currency: '',//this.$t('App.currencyDic')['m']
    salary_deriv: '',
  }},
  computed: {
    ...mapState(['user', ['role','ownCVs']]),
    job() {
      return this.$store.state.jobDetails
    },
    updated() {
      let d = new Date(this.job.updated)
      return 'в ' + ("0" + d.getHours()).slice(-2) + ':' + ("0" + d.getMinutes()).slice(-2) + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    },
    published() {
      let d = new Date(this.job.published)
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    // console.log('sad', currentRoute.query.id)
    if (ssrContext)
      return store.dispatch('setJobDetails', ssrContext.req.jobData)
    else
      return store.dispatch('fetchJobDetails', currentRoute.query.id)
  },
  mounted() {
    this.setVariables()
  },
  methods: {
    setVariables() {
      this.currency = this.$t('App.currencyDic')[this.job.currency]
      if (this.job.salary_min < 1) {
        if (this.job.salary_max < 1) {
          this.salary_deriv = this.$t('jobPage.salaryNone')
        } else this.salary_deriv = this.job.salary_max + ' ' + this.currency
      } else {
        if (this.job.salary_min < this.job.salary_max) {
          this.salary_deriv = `${this.job.salary_min} - ${this.job.salary_max}` + ' ' + this.currency
        } else
        if (this.job.salary_min = this.job.salary_max) {
          this.salary_deriv = `${this.job.salary_max}` + ' ' + this.currency
        } else this.salary_deriv = `${this.job.salary_max}` + ' ' + this.currency
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
*
  margin: 0;
  font-family: 'Montserrat', sans-serif;
.detailed__main1
  width: 80%;
  max-width: 850px;
  background-color: white;
  padding: 0 15px;
  padding-top: 10px;
  border-radius 5px
  box-sizing border-box
  box-shadow 0 0 3px 2px var(--main-borders-color)
  display flex
  flex-direction column
  
  margin 0 auto
  margin-top 15px
  //border 1px solid black
  .titleHeader
    font-size 24px !important
    margin-top 8px
section
  margin-bottom 15px
  text-align left
  padding-bottom 5px
  p
    margin-bottom 0
  li
    margin 5px 0
.detailed__button {
  background-color: #B4E873;
  padding: 5px;
  border: 0;
  font-size: 20px;
  cursor: pointer;
}
.detailed__button:hover {
  color: white;
}
.detailed__author-link1
  color var(--main-borders-color)
  text-decoration none
  &:hover
    color var(--violet-btn-color)
.author-link-wrapper
  min-width var(--logoWidth)
  
.detailed__line {
  display: flex;
  justify-content: space-between;
}
.detailed__col{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
}
.detailed__logo1{
  text-align center
  width var(--logoWidth)
  min-width var(--logoWidth)
  height 65px
  // background-size 100% 100%
  // background-color coral
  line-height 50px
  margin-left 5px
  // width 180px
  // height 80px
  background-size contain
  background-repeat no-repeat
  background-position center
}
.detailed__header1
  color var(--btn-color)
  margin 10px 0px
  margin-bottom 5px
  font-size 20px
.padleft
  padding-left 10px
.descriptionHTML
  font-size 14px
  line-height 1.1
  word-wrap break-word
  max-width 100%
.ql-size-small
  font-size 12px
.ql-size-large
  font-size 20px
.salary-deriv::first-letter
  text-transform uppercase
.subitem
  //padding-left 20px
  padding-bottom 5px
  padding-top 5px
  font-size 14px
.bdscolored
  color var(--main-borders-color)
  margin-top -2px
  margin-right 2px
  margin-left 10px
</style>
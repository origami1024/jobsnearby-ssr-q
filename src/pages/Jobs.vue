<template>
  <div class="jobs">
    <div class="jobs__banner">
      <div class="banner__pic"></div>
      <div class="jobs__banner-right">
        <div class="banner__header-wrap">
          <h2 class="banner__header">Найди подходящую вакансию уже сегодня!</h2>
        </div>
        <div class="jobs__top-search">
        <button class="filtersHamburgerBtn" @click="filtersToggle = !filtersToggle">Ф</button>
        <input
          class="searchInput"
          type="text"
          v-model="txt" @keyup.enter="refreshPlus"
          placeholder="Введите ключевые слова"
        >
        <q-btn 
          @click="refreshPlus"
          class="headerBtns1 searchBtn"
          style="background-color: var(--violet-btn-color); margin-left: -15px; padding: 0 12px;"
          text-color="white" :loading="pending"
          :label="$t('filters.searchBtn')"
        />
      </div>
      </div>
    </div>
    <div class="jobs__main">
      <div class="jobs__filterpart">
        <JobsFilter
          :isResetShown="isResetShown"
          @resetFilters="resetFilters"
          @currUpd="currUpd"
          :currency="currency"
          @cityUpd="cityUpd" @jcatUpd="jcatUpd" @expUpd="expUpd"
          @salaryUpd="salaryUpd" :city="city" :salary="salary"
          :exp="exp" :jcat="jcat"
          :pending="pending"
          @refresh="$emit('refresh')"
          :filtersToggle="filtersToggle"
          @toggleFilters="filtersToggle = !filtersToggle"
        />
      </div>
      <div class="jobs__contents">
        <div class="line jobs_prefilters">
          <div class="prefilters-leftwrap">
            <span class="jobs__prefilters-label">Сортировка:</span>
            <button class="orderLink">
              {{timerange.label}}
              <q-menu dense>
                <q-item
                  v-for="timerangeee in $t('jobs.dateOpts')"
                  :key="timerangeee.value"
                  style="lineHeight: 2"
                  dense :style="{color: timerange.value == timerangeee.value ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  clickable v-close-popup
                  @click="timerange = timerangeee; prefilterDelayedRefreshPlus()"
                >
                  {{timerangeee.label}}
                </q-item>
              </q-menu>
            </button>
            <button class="orderLink">
              {{sort.label}}
              <q-menu dense>
                <q-item
                  v-for="sortee in $t('jobs.sortOpts')"
                  :key="sortee.value"
                  style="lineHeight: 2"
                  dense :style="{color: sort.value == sortee.value ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  clickable v-close-popup
                  @click="sort = sortee; prefilterDelayedRefreshPlus()"
                >
                  {{sortee.label}}
                </q-item>
              </q-menu>
            </button>
          </div>
          <div class="prefilters-rightwrap">
            <span class="jobs__prefilters-label">Отображать:</span>
            <button class="orderLink">
              {{perpage.label}}
              <q-menu dense>
                <q-item
                  v-for="perpageee in $t('jobs.perpageOpts')"
                  :key="perpageee.value"
                  style="lineHeight: 2"
                  dense :style="{color: perpage.value == perpageee.value ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  clickable v-close-popup
                  @click="perpage = perpageee; prefilterDelayedRefreshPlus()"
                >
                  {{perpageee.label}}
                </q-item>
              </q-menu>
            </button>
          </div>
        </div>
        <JobsList
          :ownCVs="ownCVs"
          @hitcv="hitcv"
          :searchFilter="searchFilter"
        />
        <div v-if="pages && pages > 0" class="paginationWrap">
          <button
            :class="{pageBtns: true, currentPage: page_current == i}"
            v-for="i of (
              page_current == 1
                ? Math.min(pages, 3) 
                : Math.min(pages, page_current + 1)
            )" :key="i"
            @click="switchPage(i)"
            v-show="(i >= (page_current != pages ? page_current - 1 : page_current - 2))"
          >
            {{i}}
          </button>
        </div>
      </div>
      <UserStats/>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import JobsList from 'components/organisms/JobsList.vue'
import JobsFilter from 'components/organisms/JobsFilter.vue'
import UserStats from 'components/organisms/UserStats.vue'

export default {
  name: 'Jobs',
  props: {
    // jobslist: {type: Array, default: ()=>[]},
    ownCVs: {type: Array, default: ()=>[]},
    pending: {type: Boolean, default: false},
    pages: {type: Number, default: 1},
    page_current: {type: Number, default: 1},
    jobsFullcount: {type: Number, default: 0},
    salMin: String,
    salAvg: String,
    salMax: String,
    tops: Array,
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    if (ssrContext) {
      // console.log('ormongtrong', Object.keys(ssrContext))
      return store.dispatch('refreshJobsData', ssrContext.req.rawjobs)
    }
  },
  data(){return {
    filtersToggle: false,
    lenses: 'full',
    txt: '',
    wordRegex: /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\\-]*$/,
    sort: this.$t('jobs.sortOpts[0]'),//{label: 'По дате', value: 'new'},
    timerange: this.$t('jobs.dateOpts[0]'),
    perpage: this.$t('jobs.perpageOpts[0]'),
    searchFilter: '',
    langsFilter: [],
    // maxSal: 100000,
    // minSal: 0,
    //langOptions: ["Русский", "Английский", "Немецкий", "Французкий"],
    city: '',
    jcat: {label: "", value: 0},
    salary: {label: "", value: 'idc'},
    exp: {label: "", value: 'idc'}, 
    currency: {label: "", value: 'idc'},
  }},
  components: {
    JobsFilter,
    JobsList,
    UserStats
  },
  computed: {
    // jobslist() {
    //   return this.$store.state.jobslist
    // },
    isResetShown() {
      let res = false
      if (this.city != this.$t('filters.cities[0]') && this.city != '') res = true
      else if (this.salary.value != 'idc') res = true
      else if (this.currency.value != 'idc') res = true
      else if (this.exp.value != 'idc') res = true
      else if (this.jcat.value != 0) res = true
      //else if (this.outerResetNeeded != false) res = true

      else if (this.sort.value != 'new') res = true
      else if (this.timerange.value != 'mon') res = true
      else if (this.perpage.value != '25') res = true
      
      else if (this.txt != '') res = true

      return res
    },
    query() {
      let params = []
      if (this.txt !== '' && this.wordRegex.test(this.txt)) params.push('txt=' + this.txt)
      if (this.sort.value !== 'new') params.push('sort=' + this.sort.value)
      if (this.timerange.value !== 'mon') params.push('timerange=' + this.timerange.value)
      if (this.perpage.value !== '25') params.push('perpage=' + this.perpage.value)
      if ((this.city !== this.$t('filters.cities[0]') && this.city !== '') && this.wordRegex.test(this.city)) params.push('city=' + this.city)
      if (this.exp.value !== 'idc') params.push('exp=' + this.exp.value)
      if (this.jcat.value !== 0) params.push('jcat=' + this.jcat.value)
      if (this.salary.value !== 'idc') params.push('sal=' + this.salary.value)
      if (this.currency.value !== 'idc') params.push('cur=' + this.currency.value)
      let que = params.length == 0 ? '' : '?' + params.join('&')
      return que
    }
  },
  watch: {
    query(que){
      this.$emit('updQue', que)
    },
  },
  methods: {
    prefilterDelayedRefreshPlus() {
      setTimeout(()=>this.refreshPlus())
    },
    resetFilters() {
      this.txt = ''
      this.searchFilter = this.txt.toLowerCase()
      this.city = ''
      this.jcat= {label: "", value: 0}
      this.salary= {label: "", value: 'idc'}
      this.exp= {label: "", value: 'idc'}
      this.currency= {label: "", value: 'idc'}

      this.sort = this.$t('jobs.sortOpts[0]')
      this.timerange = this.$t('jobs.dateOpts[0]')
      this.perpage = this.$t('jobs.perpageOpts[0]')
      //this.outerResetNeeded = false
      this.$emit('updQue', this.query)
      this.$emit('refresh')
    },
    hitcv(id) {
      this.$emit('hitcv', id)
    },
    refreshPlus(){
      
      this.searchFilter = this.txt.toLowerCase()
      this.$emit('refresh')
    },

    updSearch: function(str) {
      this.searchFilter = str
    },
    // updQue: function(params) {
    //   console.log('cpUpdQue1: ', params)
    //   this.$emit('updQue', params)
    // },
    perPageUpd(e) {
      this.$emit('perPageUpd', e)
    },
    switchPage(newV) {
      this.$emit('refresh', 'page', newV)
    },
    salaryUpd(new1) {
      this.salary = new1
    },
    expUpd(new1) {
      this.exp = new1
    },
    jcatUpd(new1) {
      this.jcat = new1
    },
    cityUpd(new1) {
      this.city = new1
    },
    currUpd(new1) {
      this.currency = new1
    }
  },
}
</script>


<style scoped lang="stylus">
.jobs
  display flex
  flex-direction column
  position relative
  padding 0px 0px
  .jobs__banner
    display flex
    text-align left
    padding-top 12.5px
    margin-bottom 46px
    @media screen and (max-width: 950px)
      margin-bottom 26px
    @media screen and (max-width 800px)
      padding-top 5px
      margin-bottom 20px
    @media screen and (max-width 550px)
      justify-content center
  .banner__pic
    --bsize 68px
    width var(--bsize)
    min-width var(--bsize)
    height var(--bsize)
    min-height var(--bsize)
    background url('~assets/checked.png')
    @media screen and (max-width 1160px)
      margin-left 10px
    @media screen and (max-width 800px)
      --bsize 40px
      background-size 100%
      margin-top 14px
      margin-left 6px
    @media screen and (max-width 550px)
      display none
  .banner__header-wrap
    margin-bottom: 20px
    height: 68px
    display: flex
    align-items: center
    @media screen and (max-width 800px)
      margin-bottom 6px
    @media screen and (max-width 550px)
      display none
  .banner__header
    margin-left: 30px
    color: var(--color1)
    font-family: Montserrat, sans-serif
    font-weight: 600 !important
    font-size: 18px !important
    line-height: 144.4% !important
    max-width: 296px
    @media screen and (max-width 800px)
      margin-left 6px
      line-height: 130% !important
  .jobs__top-search
    display flex
    @media screen and (max-width 550px)
      margin-top 15px
  .jobsfilter__search
    box-sizing border-box
    width 100%
    margin-right 5px
    @media screen and (max-width 550px)
      margin-right 0
  .jobs__main
    box-sizing border-box
    display flex
    position relative
    @media screen and (max-width: 1160px)
      margin 0 10px
    @media screen and (max-width 800px)
      margin 0 6px
      flex-direction column
    @media screen and (max-width 550px)
      margin 0
  .jobs__contents
    margin 0 26px
    flex-grow 2
    @media screen and (max-width: 1160px)
      margin 0 10px
    @media screen and (max-width 550px)
      //margin 0 5px
      margin 0
      padding 0 5px
      //width calc(100% - 30px)
      
    // @media screen and (max-width 800px)
    //   margin-left 0
    //box-sizing border-box
    //width calc(100% - 10px)
    //max-width calc(var(--maxW) - 410px) //that is including the filters to the left
  .jobs_prefilters
    margin-bottom 26px
    padding-top 6px
    //background-color var(--main-bg-color)
    //box-shadow 0 0 4px 1px var(--main-borders-color)
    //box-sizing border-box
    @media screen and (max-width: 950px)
      margin-bottom 10px
    .prefilters-rightwrap
      align-self flex-start
  *
    margin 0
  .line
    display flex
    justify-content space-between
    align-items center
  .pageBtns
    cursor pointer
    border 0
    margin 0
    background-color transparent
    font-family: Montserrat, sans-serif
    font-weight: normal;
    font-size: 16px;
    line-height: 20px;
    color var(--violet-btn-color)
    &:focus
      outline none
    &:hover
      color var(--color1)
  .currentPage
    font-weight bold
  .orderLink
    white-space nowrap
    border 0
    background-color transparent
    color var(--violet-btn-color)
    cursor pointer
    font-family: Montserrat, sans-serif
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    background-image url('~assets/arrow3.png')
    background-repeat no-repeat
    background-position right 3px center
    padding-right 18px
    &:nth-of-type(1)
      padding-left 16px
      @media screen and (max-width: 950px)
        padding-left 0px
    &:hover
      color var(--color1)
  .paginationWrap
    padding 22px 0
    padding-bottom 10px//32
    @media screen and (max-width: 1160px)
      padding 12px 0
      padding-bottom 6px//22
.searchInput
  width 822px
  padding 0 26px
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  height: 40px !important
  border: 0
  font-family: Montserrat, sans-serif
  font-weight: normal
  font-size: 14px !important
  line-height: 17px !important
  margin-left 16px !important
  &:focus
    outline none
    box-shadow 0px 0px 2px var(--violet-btn-color) !important
  @media screen and (max-width: 1160px)
    width 600px
    margin auto
  @media screen and (max-width 800px)
    padding 0 16px
    margin-left: 0px !important
    width calc(72vw - 16px)
    height: 36px !important
  @media screen and (max-width 550px)
    padding 0 8px
    width calc(72vw - 40px)
    letter-spacing -1px
.searchBtn
  @media screen and (max-width 550px)
    padding 0 4px !important
.filtersHamburgerBtn
  display none
  border 0
  color white
  background-color var(--btn-color)
  align-self center
  padding 5px
  cursor pointer
  margin 0 5px
  border-radius 10px
  min-width 28px
  height 36px
  font-size 20px
  &:hover
    background-color var(--btn-color1) !important
  &:active
    background-color var(--btn-color1) !important
    box-shadow 0 2px 3px 1px #bbb
  &:focus
    outline none
  @media screen and (max-width 550px)
    display block
.jobs__prefilters-label
  color black
  font-family: Montserrat, sans-serif !important
  font-weight: normal !important
  font-size: 14px !important
  line-height: 17px !important
  margin-right 5px
  @media screen and (max-width: 950px)
    display none
  @media screen and (max-width: 800px)
    display inline


</style>
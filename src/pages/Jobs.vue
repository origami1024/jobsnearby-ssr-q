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
          @keyup.enter="$store.dispatch('refreshjobs', {})"
          :value="jFilters.txt"
          @input="$store.dispatch('filterUpd', {prop: 'txt', value: $event.target.value})"
          placeholder="Введите ключевые слова"
        >
        <q-btn 
          @click="$store.dispatch('refreshjobs', {})"
          class="headerBtns1 searchBtn"
          style="background-color: var(--violet-btn-color); margin-left: -15px; padding: 0 12px;"
          text-color="white"
          :label="$t('filters.searchBtn')"
        />
      </div>
      </div>
    </div>
    <div class="jobs__main">
      <div class="jobs__filterpart">
        <JobsFilter
          :filtersToggle="filtersToggle"
          @toggleFilters="filtersToggle = !filtersToggle"
        />
      </div>
      <div class="jobs__contents">
        <div class="line jobs_prefilters">
          <div class="prefilters-leftwrap">
            <span class="jobs__prefilters-label">Сортировка:</span>
            <button class="orderLink">
              {{$t('jobs.dateOpts')[jFilters.timerange]}}
              <q-menu dense>
                <q-item
                  v-for="timerangeKey in Object.keys($t('jobs.dateOpts'))"
                  :key="timerangeKey"
                  style="lineHeight: 2"
                  :style="{color: jFilters.timerange == timerangeKey ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  dense clickable v-close-popup
                  @click="$store.dispatch('filterUpd', {prop: 'timerange', value: timerangeKey})"
                >
                  {{$t('jobs.dateOpts')[timerangeKey]}}
                </q-item>
              </q-menu>
            </button>
            <button class="orderLink">
              {{$t('jobs.sortOpts')[jFilters.sort]}}
              <q-menu dense>
                <q-item
                  v-for="sortKey in Object.keys($t('jobs.sortOpts'))"
                  :key="sortKey"
                  style="lineHeight: 2"
                  dense :style="{color: jFilters.sort == sortKey ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  clickable v-close-popup
                  @click="$store.dispatch('filterUpd', {prop: 'sort', value: sortKey})"
                >
                  {{$t('jobs.sortOpts')[sortKey]}}
                </q-item>
              </q-menu>
            </button>
          </div>
          <div class="prefilters-rightwrap">
            <span class="jobs__prefilters-label">Отображать:</span>
            <button class="orderLink">
              {{$t('jobs.perpageOpts')[jFilters.perpage]}}
              <q-menu dense>
                <q-item
                  v-for="perpageKey in Object.keys($t('jobs.perpageOpts'))"
                  :key="perpageKey"
                  style="lineHeight: 2"
                  dense :style="{color: jFilters.perpage == perpageKey ? 'var(--violet-btn-color)' : 'var(--color1)'}"
                  clickable v-close-popup
                  @click="$store.dispatch('filterUpd', {prop: 'perpage', value: perpageKey})"
                >
                  {{$t('jobs.perpageOpts')[perpageKey]}}
                </q-item>
              </q-menu>
            </button>
          </div>
        </div>
        <JobsList/>
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

import { mapState } from 'vuex'

export default {
  name: 'Jobs',
  props: {
    pages: {type: Number, default: 1},
    // page_current: {type: Number, default: 1},
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    if (ssrContext) {
      return store.dispatch('refreshJobsData', ssrContext.req.rawjobs)
    }
  },
  data() {return {
    filtersToggle: false,
  }},
  components: {
    JobsFilter,
    JobsList,
    UserStats
  },
  computed: {
    ...mapState(['jFilters', ['txt', 'timerange', 'sort', 'perpage']]),
    page_current() {
      return this.$store.state.jobs.page_current
    },
  },
  methods: {
    switchPage(newV) {//CHANGE THIS, WOTS THIS REFRESH????
      this.$emit('refresh', 'page', newV)
    },
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
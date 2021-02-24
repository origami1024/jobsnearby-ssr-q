<template>
  <div class="jobs">
    <div class="jobs__banner">
      <div class="banner__pic"></div>
      <div class="jobs__banner-right">
        <div class="banner__header-wrap">
          <h1 class="banner__header">{{$t('jobs.bannerHeader')}}</h1>
        </div>
        <div class="jobs__top-search">
          <button class="filtersHamburgerBtn" @click="$store.dispatch('filtersToggle')"/>
          <input
            style="border:none;"
            class="searchInput"
            type="text"
            @keyup.enter="$store.dispatch('refreshjobs', {}); $store.dispatch('filtersOff')"
            :value="jFilters.txt"
            @input="$store.dispatch('filterUpd', {prop: 'txt', value: $event.target.value})"
            :placeholder="$t('jobs.searchPh')"
          >
          <button
            @click="$store.dispatch('refreshjobs', {}); $store.dispatch('filtersOff')"
            class="headerBtns1 searchBtn"
          >
            <span class="noshow-below550">{{$t('filters.searchBtn')}}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="jobs__main">
      <div class="jobs__filterpart">
        <JobsFilter/>
      </div>
      <div class="jobs__contents" v-if="!$store.state.jfiltersToggle">
        <div class="line jobs_prefilters">
            <span class="jobs__prefilters-label">{{$t('jobs.prefiltersLabelSort')}}</span>
            <button class="orderLink dateLink">
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
            <span>
            <span class="jobs__prefilters-label">{{$t('jobs.prefiltersLabelShow')}}</span>
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
            </span>
          <!-- </div> -->
        </div>
        <JobsList/>
        <div v-if="pages && pages > 0" class="paginationWrap">
          <a 
            :class="{pageBtns: true, currentPage: page_current == i}"
            v-for="i of (
              page_current == 1
                ? Math.min(pages, 3) 
                : Math.min(pages, page_current + 1)
            )" :key="i"
            @click.prevent="$store.dispatch('refreshjobs', {param: 'page', param2: i})"
            v-show="(i >= (page_current != pages ? page_current - 1 : page_current - 2))"
            :href="'/?page=' + i"
          >
            {{i}}
          </a>
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
  meta() {
    return {
      title: 'Работа в Туркменистане.' + ((this.page_current > 1) ? ' Страница ' + this.page_current : ''),
      meta: {
        ogTitle: { name: 'og:title', content: 'Hunarmen | Работа в Туркменистане' },
        ogDesc: { name: 'og:description', content: 'Работа в Туркменистане. Ежедневное обновление базы вакансий в Туркменистане. Вакансии Туркменистан. Работа в Ашхабаде Мары Хазар Балканабад. Найти работу в Ашхабаде. ' },
        description: { name: 'description', content: 'Работа в Туркменистане. Ежедневное обновление базы вакансий в Туркменистане. Вакансии Туркменистан. Работа в Ашхабаде Мары Хазар Балканабад. Найти работу в Ашхабаде. ' }
      }
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    if (ssrContext) {
      return store.dispatch('refreshJobsData', ssrContext.req.rawjobs)
    }
  },
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
    pages() {
      return this.$store.getters.pages
    },
  },
}
</script>


<style scoped lang="stylus">
.jobs
  display flex
  flex-direction column
  position relative
  padding 0px 10px
  @media screen and (max-width 550px)
    padding 0px 20px
    width 100%
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
      padding-top 0
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
      height auto
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
  .jobs__banner-right
    @media screen and (max-width 550px)
      width 100%
      // padding 0 20px
  .jobs__top-search
    display flex
    @media screen and (max-width 550px)
      margin-top 0px
      width 100%
      position relative
  // .jobsfilter__search
  //   box-sizing border-box
  //   width 100%
  //   margin-right 5px
  //   @media screen and (max-width 550px)
  //     margin-right 0
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
    min-width 551px
    flex-grow 2
    @media screen and (max-width: 1160px)
      margin 0 10px
    @media screen and (max-width 800px)
      min-width auto
    @media screen and (max-width 550px)
      margin 0
      padding 0px
  .jobs_prefilters
    margin-bottom 26px
    padding-top 6px
    @media screen and (max-width: 950px)
      margin-bottom 10px
  *
    margin 0
  .line
    display flex
    justify-content space-between
    align-items center
  .pageBtns
    cursor pointer
    border 0
    background-color transparent
    font-family: Montserrat, sans-serif
    font-size: 16px;
    line-height: 20px;
    color var(--violet-btn-color)
    text-decoration none
    margin 0 5px
    &:focus
      outline none
    &:hover
      color var(--color1)
    @media screen and (max-width 550px)
      font-size: 13px;
      line-height: 16px;
      margin 0 10px
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
    margin-right auto
    &:nth-of-type(1)
      margin-right 0
      @media screen and (max-width 950px)
        padding-left 0px
      @media screen and (max-width 550px)
        margin-right auto
    &:nth-of-type(2)
      margin-right auto
    &:hover
      color var(--color1)
    @media screen and (max-width 550px)
      border: 0.5px solid #8645FF;
      box-sizing: border-box;
      box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.15);
      border-radius: 5px;
      background-image none
      font-weight: 500 !important;
      font-size: 10px;
      line-height: 12px;
      height 22px
      width 99px
      padding 0
      margin-right 0
  .paginationWrap
    padding 22px 0
    padding-bottom 10px//32
    margin-bottom 20px
    @media screen and (max-width: 1160px)
      padding 12px 0
      padding-bottom 6px//22
    @media screen and (max-width 550px)
      padding-top 7px
.searchInput
  width 822px
  padding 0 26px
  -webkit-appearance: none;
  -webkit-box-shadow 0px 0px 15px rgba(0, 0, 0, 0.15) !important
  box-shadow 0px 0px 15px rgba(0, 0, 0, 0.15) !important
  border-radius: 10px;
  height: 40px !important
  border none
  font-family: Montserrat, sans-serif
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
    padding 0 60px 0 42px
    width 100%//calc(72vw - 40px)
    // letter-spacing -1px
    font-size: 10px !important
    line-height: 12px !important
    height: 35px !important
    // box-shadow: 0px 0px 15px gray
.searchBtn
  background-color: var(--violet-btn-color) !important
  margin-left: -15px
  padding: 0 15px !important
  border 0
  color white
  text-transform uppercase
  cursor pointer
  width 110px
  &:hover
    background-color var(--violet2) !important
  &:focus
    outline none
  @media screen and (max-width 550px)
    padding 0 4px !important
    background-color transparent !important
    width 20px
    height 20px !important
    background url('/statics/search-mobile.png')
    background-repeat no-repeat
    background-position center
    position absolute
    right 8px
    top calc(50% - 10px)
    &:hover
      background-color transparent !important
      filter: brightness(1.5)
.filtersHamburgerBtn
  display none
  border 0
  background-color transparent
  // background-color var(--btn-color)
  background url('/statics/filter-burger.png')
  background-repeat no-repeat
  background-position center
  align-self center
  cursor pointer
  // margin 0 5px
  margin-left 12px
  min-width 14px
  height 15px
  position absolute
  &:hover
    filter: brightness(1.5)
  &:active
    filter: brightness(1.5)
  &:focus
    outline none
  @media screen and (max-width 550px)
    display block
// .prefilters-leftwrap
//   @media screen and (max-width 550px)
//     width 63%
//     display flex
//     justify-content space-between
.jobs__prefilters-label
  font-size: 14px !important
  line-height: 17px !important
  margin-right 5px
  @media screen and (max-width: 950px)
    display none
  @media screen and (max-width: 800px)
    display inline
  @media screen and (max-width 550px)
    display none


</style>
<template>
  <div class="jobsfilter" :class="{ filtersHideBelow550: !$store.state.jfiltersToggle}">
    <span class="line0">
      <h3 class="filter__header">
        {{$t('filters.fHeader')}}
      </h3>
      <button class="closeModal" @click="$store.dispatch('filtersOff')">╳</button>
      <!-- ✕ -->
    </span>
    <span class="lowresline">
      <span class="lowres__double">
      <span class="f-label">{{$t('filters.city')}}</span>
      <DDSelect :picked="jFilters.city" @update:city="$store.dispatch('filterUpd', {prop: 'city', value: $event == $t('filters.cities')[0] ? '' : $event})" :cities="$t('filters.cities')" :ph="$t('filters.fCityPh')" class="selectWrapper" />
      </span>

      <span class="lowres__double">
      <span class="f-label">{{$t('filters.jcat')}}</span>
      <BasicSelect
        :picked="jFilters.jcat"
        @update:value="$store.dispatch('filterUpd', {prop: 'jcat', value: $event.value == '' ? {label: '',value : 0} : $event})"
        :values="$t('App.jcats')"
        :ph="$t('filters.fJCatPh')" class="selectWrapper" emptyTemplate='0'
      />
      </span>
    </span>
    <span class="lowresline">
      <span class="lowres__double">
      <span class="f-label">{{$t('filters.exp')}}</span>
      <BasicSelect
        :picked="jFilters.exp" 
        @update:value="$store.dispatch('filterUpd', {prop: 'exp', value: $event.value == 'idc' ? {label: '', value : 'idc'} : $event})"
        :values="$t('filters.expFilters')" :ph="$t('filters.fExpPh')" class="selectWrapper"
      />
      </span>
    <div class="line lowres__salaryWrap">
      <div class="salary_inp_wrapper">
      <span class="f-label">{{$t('filters.sal')}}</span>
      <BasicSelect
        :picked="jFilters.salary"
        @update:value="$store.dispatch('filterUpd', {prop: 'salary', value: $event.value == 'idc' ? {label: '', value : 'idc'} : $event})"
        :values="$t('filters.salFilters')" :ph="$t('filters.fSalPh')" class="selectWrapper"
      />
      </div>
      <div class="currency_inp_wrapper">
      <span class="f-label" style="margin-left: 0;">{{$t('filters.curr')}}</span>
      <BasicSelect :picked="jFilters.currency"
        @update:value="$store.dispatch('filterUpd', {prop: 'currency', value: $event.value == 'idc' ? {label: '', value : 'idc'} : $event})"
        :values="$t('filters.currDefault')" ph="" class="selectWrapper"
      />
      </div>
    </div>
    </span>
    
    <div class="w100 lowres__bottom" :style="{justifyContent: $store.getters.isResetShown ? 'space-between': 'flex-end'}">
      <q-btn
        v-if="$store.getters.isResetShown"
        class="headerBtns1 trashBg"
        @click="$store.dispatch('resetFilters'); $store.dispatch('filtersOff')"
      />
      <q-btn
        :loading="pending"
        style="background-color: var(--violet-btn-color); font-weight: 700; width: 100%"
        :style="{width: $store.getters.isResetShown ? '126px': '100%'}"
        class="headerBtns1 applybtn"
        text-color="white"
        :label="$t('filters.applyBtn')"
        @click="applyFilters"
      />
    </div>
  </div>
</template>

<script>
import DDSelect from './../atoms/DDSelect'
import BasicSelect from './../atoms/BasicSelect'

import { mapState } from 'vuex'


export default {
  name: 'JobsFilter',
  props: {
    // filtersToggle: {type: Boolean, default: false},
    pending: {type: Boolean, default: false},
  },
  computed: {
    ...mapState(['jFilters', ['city', 'jcat', 'salary', 'exp', 'currency']]),
  },
  methods: {
    applyFilters() {
      this.$store.dispatch('refreshjobs', {})
      this.$store.dispatch('filtersOff')
    }
  },
  components: {
    DDSelect,
    BasicSelect
  },
}
</script>


<style scoped lang="stylus">
.jobsfilter
  background-color var(--color1)
  text-align left
  max-width 278px
  min-width 278px
  padding 31px
  box-sizing border-box
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  border-radius 10px
  color white
  @media screen and (max-width 1160px)
    max-width 210px
    min-width 210px
    padding 22px 8px
  @media screen and (max-width 800px)
    max-width 100%
    min-width (100% - 10px)
    margin 0 10px
  @media screen and (max-width 550px)
    margin 0// 5px
    // position fixed
    top 205px
    bottom 5px
    left 20px
    right 20px
    z-index 4
    padding 35px 34px
  .filter__header
    text-transform: uppercase;
    font-family: Montserrat, sans-serif;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 15px;
    @media screen and (max-width 550px)
      // justify-self center
      // align-self center
      width 100%
      text-align center
  .lowresline
    @media screen and (max-width 800px)
      display flex
      justify-content space-between
      align-items center
      height 70px
      //outline 1px dotted yellow
    @media screen and (max-width 550px)
      display inline
      height auto
  .lowres__double
    @media screen and (max-width 800px)
      //outline 1px solid green
      display flex
      flex-direction column
      box-sizing border-box
      width 50%
    @media screen and (max-width 550px)
      display inline
      width auto
  .lowres__double:first-of-type
    @media screen and (max-width 800px)
      padding-right 10px
    @media screen and (max-width 550px)
      padding-right 0
  .line0
    position relative
    @media screen and (max-width 550px)
      display flex
  .closeModal
    display none
    border 0
    color var(--btn-color)
    font-weight bold
    background-color transparent
    top -16px
    cursor pointer
    margin-left auto
    border-radius 10px
    min-width 20px
    height 20px
    font-size 18px
    // line-height 17px
    position absolute
    right -12px
    padding 0
    &:hover
      // background-color var(--btn-color1) !important
      filter: brightness(1.5)
    &:active
      // background-color var(--btn-color1) !important
      // box-shadow 0 2px 3px 1px #bbb
      filter: brightness(1.5)
    &:focus
      outline none
    @media screen and (max-width 550px)
      display block
  .f-label
    font-family: Montserrat, sans-serif;
    font-weight normal
    font-size 14px
    line-height 17px !important
    display block
    margin-bottom 6px !important
    @media screen and (max-width: 1160px)
      margin-bottom 3px !important
      margin-left 10px
    @media screen and (max-width 800px)
      margin-left 0
      margin-bottom 0
    @media screen and (max-width 550px)
      margin-bottom 6px !important
  .selectWrapper
    margin-bottom 12px
    @media screen and (max-width 800px)
      margin 0// 10px
      margin-bottom 0
      width 100%
    @media screen and (max-width 550px)
      margin-bottom 12px

  .selectWrapper:last-of-type
    margin-right 0
  *
    margin 0
  .lowres__bottom
    margin-top: 19px
    @media screen and (max-width 800px)
      margin-top 0px
  .line
    display flex
    justify-content space-between
  .alignRight
    align-self flex-end
  .w100
    display flex
    width 100%
    justify-content flex-end
    padding-top 10px
.filtersHideBelow550
  @media screen and (max-width 550px)
    display none
.lowres__salaryWrap
  @media screen and (max-width: 800px)
    width 50%
    min-width 50%
    display flex
    //outline 1px solid red
  @media screen and (max-width 550px)
    width auto
    min-width auto
    display inline
.salary_inp_wrapper
  width 125px
  @media screen and (max-width: 1160px)
    width 125px
  @media screen and (max-width: 800px)
    display flex
    flex-direction column
    //outline 1px solid red
    min-width 70%
    padding-right 10px
.currency_inp_wrapper
  width 71px
  @media screen and (max-width: 1160px)
    width 55px
  @media screen and (max-width: 800px)
    display flex
    flex-direction column
    width 100%
    justify-content space-between
    //margin-left 10px
    *
      min-width 50%
.trashBg
  background url('~assets/trash1.png') !important
  background-repeat no-repeat !important
  background-position center !important
  background-color var(--btn-color) !important
  width 70px
  &:hover
    background-color var(--btn-color1) !important
  @media screen and (max-width: 1160px)
    width 30%
  @media screen and (max-width 550px)
    min-width 25%
    margin-right 10px

.applybtn
  max-width 100% !important
  @media screen and (max-width 800px)
    width 50% !important
  @media screen and (max-width 550px)
    width 100% !important
    
  
</style>

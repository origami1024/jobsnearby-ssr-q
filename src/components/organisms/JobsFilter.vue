<template>
  <div class="jobsfilter" :class="{ filtersHideBelow550: !filtersToggle}">
    <span class="line0">
      <h3
        style="
          text-transform: uppercase;
          font-family: Montserrat, sans-serif;
          font-style: normal;
          font-weight: bold;
          font-size: 16px;
          line-height: 20px;
          margin-bottom: 15px;
        "
      >
        Расширенный поиск:
      </h3>
      <button class="closeModal" @click="$emit('toggleFilters')">X</button>
    </span>
    <span class="lowresline">
      <span class="lowres__double">
      <span class="f-label">{{$t('filters.city')}}</span>
      <!-- {{city}} -->
      <DDSelect :picked="city" @update:city="cityUpd($event)" :cities="cityOptions" ph="Ашхабад" class="selectWrapper" />
      </span>
    <!-- <span class="f-label">{{$t('filters.city')}}</span> -->
    <!-- <q-select
      :value="city"
      @input="cityUpd"
      use-input
      dense
      color="cyan-10"
      hide-selected
      :options="cityOptions"
      @filter="filterFn"
      placeholder="Ашхабад"
      style="border-radius: 10px; margin-bottom: 12px;"
      @keyup="addNewCity"
      no-border
    /> -->
      <span class="lowres__double">
      <span class="f-label">{{$t('filters.jcat')}}</span>
      <BasicSelect :picked="jcat" @update:value="jcatUpd($event)" :values="jcatOptions" ph="Бухгалтер" class="selectWrapper" emptyTemplate='0' />
      </span>
    </span>
    <!-- <span class="f-label">{{$t('filters.jcat')}}</span>
    <q-select
      dense
      color="cyan-10"
      @input="jcatUpd" :value="jcat" 
      style="border-radius: 10px; margin-bottom: 12px;"
      class="f-select"
      :options="jcatOptions"
    /> -->
    <span class="lowresline">
      <span class="lowres__double">
      <span class="f-label">{{$t('filters.exp')}}</span>
      <BasicSelect :picked="exp" @update:value="expUpd($event)" :values="expOptions" ph="от 1 до 3 лет" class="selectWrapper" />
      </span>
    <!-- <q-select color="cyan-10" @input="expUpd" dense :value="exp" :options="expOptions" :label="$t('filters.exp')" /> -->
    <div class="line lowres__salaryWrap">
      <div class="salary_inp_wrapper">
      <span class="f-label">{{$t('filters.sal')}}</span>
      <BasicSelect :picked="salary" @update:value="salaryUpd($event)" :values="salOptions" ph="от 200 до 500" class="selectWrapper" />
      </div>
      <div class="currency_inp_wrapper">
      <span class="f-label" style="margin-left: 0;">{{$t('filters.curr')}}</span>
      <BasicSelect :picked="currency" @update:value="currUpd($event)" :values="currOptions" ph="" class="selectWrapper" />
      </div>
    </div>
    </span>
    <!-- <div class="line">
      <q-select
        :content-style="{ backgroundColor: 'red' }"
        style="width: 65%;"
        dense
        color="cyan-10"
        @input="salaryUpd"
        :value="salary" :options="salOptions" :label="$t('filters.sal')" />
      <q-select color="cyan-10" style="width: 30%; text-align: center" dense @input="currUpd" :value="currency" :options="currOptions" :label="$t('filters.curr')" />
    </div> -->
    
    <div class="w100 lowres__bottom" :style="{justifyContent: isResetShown ? 'space-between': 'flex-end'}">
      <q-btn
        v-if="isResetShown"
        class="headerBtns1 trashBg"
        @click="$emit('resetFilters')"
      />
      <q-btn
        :loading="pending"
        style="background-color: var(--violet-btn-color); font-weight: 700; width: 100%"
        :style="{width: isResetShown ? '126px': '100%'}"
        class="headerBtns1 applybtn"
        text-color="white"
        :label="$t('filters.applyBtn')"
        @click="refreshPlus"
      />
      <!-- <button class="newlinks btnnewlinks" @click="refreshPlus">
        {{$t('filters.applyBtn')}}
      </button> -->
    </div>
    
  </div>
</template>

<script>
import DDSelect from './../atoms/DDSelect'
import BasicSelect from './../atoms/BasicSelect'

//панелька справа с выбором фильтрации
let stringOptions = ["Не имеет значения", "Ашхабад", "Дашогуз", "Мары", "Туркменабад", "Туркменбаши"]

export default {
  name: 'JobsFilter',
  props: {
    filtersToggle: {type: Boolean, default: false},
    isResetShown: Boolean,
    // lowest: {type: Number, default: 0},
    // highest: {type: Number, default: 99550},
    langOptions: {type: Array, default: ()=>[]},
    pending: {type: Boolean, default: false},
    exp: {type: Object},
    city: {type: String},
    jcat: {type: Object},
    salary: {type: Object},
    currency: {type: Object},
  },
  data() {return {
    cityOptions: this.$t('filters.cities'),//stringOptions, //i18n.$t('filters.cityOpts'),
    //perpage: '25',
    //timerange: 'mon',
    //txt: '',
    wordRegex: /^[\wа-яА-ЯÇçÄä£ſÑñňÖö$¢Üü¥ÿýŽžŞş\s\\-]*$/,
    search: '',
    langsSelected: [],
    currOptions: this.$t('filters.currDefault'),
    // currOptions: [
    //   {label: "все", value: 'idc'},
    //   {label: "$", value: '$'},
    //   {label: "манат", value: 'm'},],
    expOptions: this.$t('filters.expFilters'),
    // expOptions: [
    //   {label: "Не имеет значения", value: 'idc'}, 
    //   {label: "Без опыта", value: '0'},
    //   {label: "от 1 до 3 лет", value: '1-3'}, 
    //   {label: "от 3 до 5 лет", value: '3-5'},
    //   {label: "от 5 лет", value: '5'}],
    jcatOptions: this.$t('App.jcats'),
    // jcatOptions: [
    //   {label: "Не имеет значения", value: 0}, 
    //   {label: "Администрация", value: 1},
    //   {label: "Безопасность", value: 14},
    //   {label: "Инженер", value: 4},
    //   {label: "Информационные технологии", value: 12},
    //   {label: "Логистика", value: 10},
    //   {label: "Медицина", value: 13},
    //   {label: "Недвижимость", value: 9},
    //   {label: "Нефть и газ", value: 3},
    //   {label: "Образование", value: 5},
    //   {label: "Продажи", value: 6},
    //   {label: "Производство", value: 7},
    //   {label: "Строительство", value: 8},
    //   {label: "Туризм, гостиницы, рестораны", value: 11},
    //   {label: "Юристы", value: 2},
    // ],
    salOptions: this.$t('filters.salFilters'),
    // salOptions: [
    //   {label: "Не имеет значения", value: 'idc'}, 
    //   {label: "от 0 до 1000", value: '0-1'}, 
    //   {label: "от 1000 до 3000", value: '1-3'}, 
    //   {label: "от 3000", value: '3'},
    // ],
  }},
  components: {
    DDSelect,
    BasicSelect
  },
  methods: {
    cityUpd(new1) {
      //console.log('cp7 ', new1)
      if (new1 == this.$t('filters.cities')[0]) new1 = ''
      this.$emit('cityUpd', new1)
      
    },
    salaryUpd(new1) {
      if (new1.value == 'idc') new1 = {label: '',value : "idc"}
      this.$emit('salaryUpd', new1)
    },
    expUpd(new1) {
      if (new1.value == 'idc') new1 = {label: '',value : "idc"}
      this.$emit('expUpd', new1)
    },
    jcatUpd(new1) {
      if (new1.value == '') new1 = {label: '',value : 0}
      this.$emit('jcatUpd', new1)
    },
    currUpd(new1) {
      if (new1.value == 'idc') new1 = {label: '',value : "idc"}
      this.$emit('currUpd', new1)
    },
    addNewCity(e){
      this.cityUpd(e.target.value)
      //this.cityOptions.push(this.city)
    },
    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.cityOptions = this.$t('filters.cities').filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    // resetFields(){
    //   this.exp = 'Не имеет значения'
    //   this.nosal = false
    //   this.city = ''
    //   //this.perpage = '25'
    //   //this.timerange = 'mon'
    //   //this.txt = ''
    //   //this.sort = 'new'
    //   //this.search = ''
    //   //rangeValues???
    // },
    // updateAndSave: function(val) {
    //   this.rangeValues = val
    //   this.$emit('slideEnd', [val.min, val.max])
    // },
    updateLangs: function(val) {
      if (val==null) {
        this.$emit('updLangs', [])
      } else this.$emit('updLangs', val)
    },
    refreshPlus(){
      //this.query()
      //this.$emit('updSearch', this.txt.toLowerCase())
      this.$emit('toggleFilters')
      this.$emit('refresh')
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.jobsfilter
  background-color var(--color1)
  //background-color yellow
  //flex 0 1 35%
  text-align left
  max-width 278px
  min-width 278px
  //margin-bottom 15px
  padding 31px
  box-sizing border-box
  //box-shadow 0 0 4px 1px var(--main-borders-color)
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
    position fixed
    top 5px
    bottom 5px
    left 5px
    right 5px
    z-index 4
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
    @media screen and (max-width 550px)
      display flex
  .closeModal
    display none
    border 0
    color white
    background-color var(--btn-color)
    margin-top -14px
    cursor pointer
    margin-left auto
    border-radius 10px
    min-width 28px
    height 20px
    font-size 15px
    line-height 20px
    &:hover
      background-color var(--btn-color1) !important
    &:active
      background-color var(--btn-color1) !important
      box-shadow 0 2px 3px 1px #bbb
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

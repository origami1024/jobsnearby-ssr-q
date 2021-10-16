<template>
    <!-- <div class="cv-search" v-if="$store.state.user.role === 'company' && $store.state.user.rights && $store.state.user.rights.includes('bauss')">
        <p class="pageHeader">{{$t('cvList.cvListLabel')}}</p>
        {{searchLine}} -->
    <transition name="bounce">
        <div class="cv-search__wrapper" style="display: flex; flex-direction: column; align-items: center">
            <div style="text-align: left; width: 100%; margin-bottom: 6px; color: #c00027; font-weight: 600; font-size: 16px;">{{$t('cvSearch.nameSearch')}}</div>
            <div class="jobs__top-searchx">
                <button
                    class="filtersHamburgerBtnx"
                    @click="isOpen = !isOpen"
                />
                <!-- @click="$store.dispatch('filtersToggle')" -->
                <input
                    style="border:none;"
                    class="searchInputX"
                    type="text"
                    v-model="searchLine"
                    :placeholder="$t('jobs.searchPh')"
                    @keypress.enter="submitSearch"
                >
                <button
                    class="headerBtns1 searchBtnX"
                    @click="submitSearch"
                >
                </button>
            </div>
            <div style="align-self: flex-start; margin-bottom: 8px; text-align: left;">
                <!-- summary -->
                <div>
                    {{$t('cvSearch.found') + ' ' +  count + ' ' + $t('cvSearch.cvs')}}
                </div>
                <!-- debugg -->
                <!-- <div>
                    <div v-for="(v, k) in lastSearchSummary" :key="k">
                        {{v}}
                    </div>
                </div> -->
            </div>
            <div
                v-if="isOpen"
                style="width: 100%; display: flex; flex-wrap: wrap;"
            >
                <!-- <div class="w586 field-widget">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <p class="startP">{{$t('cvSearch.position1')}}</p>
                    </div>
                    <q-select
                        :value="search.position"
                        @input="posUpd"
                        dense
                        outlined
                        bg-color="white" color="deep-purple-10"
                        use-input
                        input-debounce="0"
                        fill-input
                        hide-selected
                        ref="city_current"
                        :options="posOptions"
                        @filter="posFilterFn"
                        :hint="null"
                        :placeholder="$t('filters.fJCatPh')"
                        @keyup="addNewPos"
                        dropdown-icon="none"
                        class="dropdown-padding-adjust"
                    />
                </div> -->

                <!-- <TextField
                    v-model="search.position" ref="position"
                    :label="$t('cvSearch.position1')" :ph="$t('filters.fJCatPh')"
                    :maxlength="75" :maxlhidden="true"
                    class="field-widget"
                /> -->

                <div class="w586 field-widget">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <!-- <p class="star"> </p> -->
                        <p class="startP">{{$t('cvSearch.position1')}}</p>
                    </div>
                    <q-select
                        :value="search.position"
                        @input="positionUpd"
                        dense
                        outlined
                        bg-color="white" color="deep-purple-10"
                        use-input
                        input-debounce="0"
                        fill-input
                        hide-selected
                        ref="position"
                        :options="jobTitleOptions"
                        @filter="jobTitleFilterFn"
                        :hint="null"
                        :placeholder="$t('filters.fJCatPh')"
                        @keyup="addNewJobTitle"
                        dropdown-icon="none"
                        class="dropdown-padding-adjust"
                        :maxlength="75"
                    />
                </div>

                <div class="w586 field-widget">
                    <!-- <div class="sal-wrap"> -->
                        <div class="addJoblabel" style="display: flex; margin-bottom: 8px;">
                            <p class="startP">{{$t('addJob.salaryLabel')}}</p>
                        </div>
                        <!-- <div class="line"> -->
                        <q-input
                            class="salInputsAdaptable salInput1"
                            dense outlined
                            bg-color="white" color="deep-purple-10"
                            v-model="search.sal_min"
                            ref="salary_min"
                            :placeholder="$t('addJob.salaryMinPH')" :hint="null"
                            style="margin-right: 10px; width: calc(100%);"
                        />
                            <!-- <q-input
                                class="salInputsAdaptable"
                                dense outlined
                                bg-color="white" color="deep-purple-10"
                                v-model="search.sal_max"
                                ref="salary_max"
                                style="width: calc(50% - 5px);"
                                :placeholder="$t('addJob.salaryMaxPH')" :hint="null"
                            /> -->
                            
                        <!-- </div> -->
                    <!-- </div> -->
                </div>

                <!-- <TextField
                    v-model="search.expname" ref="expname"
                    :label="$t('cvSearch.expName')" :ph="$t('cvSearch.expNamePh')"
                    :maxlength="75" :maxlhidden="true"
                    class="field-widget"
                /> -->

                <div class="w586 field-widget">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <!-- <p class="star"> </p> -->
                        <p class="startP">{{$t('cvSearch.expName')}}</p>
                    </div>
                    <q-select
                        :value="search.expname"
                        @input="expNameUpd"
                        dense
                        outlined
                        bg-color="white" color="deep-purple-10"
                        use-input
                        input-debounce="0"
                        fill-input
                        hide-selected
                        ref="expname"
                        :options="expNameOptions"
                        @filter="expNameFilterFn"
                        :hint="null"
                        :placeholder="$t('cvSearch.expNamePh')"
                        @keyup="addNewExpNameTitle"
                        dropdown-icon="none"
                        class="dropdown-padding-adjust"
                        :maxlength="75"
                    />
                </div>

                <div class="w586 field-widget">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <p class="startP">{{$t('addCv.edu')}}</p>
                    </div>
                    <q-select
                        :value="search.edu"
                        @input="search.edu = $event"
                        dense
                        outlined
                        bg-color="white" color="deep-purple-10"
                        use-input
                        input-debounce="0"
                        fill-input
                        hide-selected
                        ref="edu"
                        :options="eduOpts"
                        @filter="filterFnEdu"
                        :hint="null"
                        :placeholder="$t('addCv.eduph')"
                        @keyup="search.edu = $event.target.value"
                        dropdown-icon="none"
                        class="dropdown-padding-adjust"
                        :maxlength="30"
                    />
                </div>

                
                <!-- <SelectField
                    :label="$t('addCv.positionLabel')"
                    :picked="search.exp" 
                    @update:value="$event.value == 'idc' ? search.exp = {label: '', value : 'idc'} : search.exp = $event"
                    :values="$t('filters.expFilters')" :ph="$t('filters.fJCatPh')"
                    class="selectWrapper field-widget"
                /> -->
                <div class="w586 field-widget">
                    <div class="sal-wrap">
                    <div class="addJoblabel" style="display: flex; margin-bottom: 8px;">
                        <p class="startP">{{$t('cvSearch.expLabelYears')}}</p>
                    </div>
                    <div class="line">
                        <q-input
                            class="salInputsAdaptable salInput1"
                            dense outlined
                            bg-color="white" color="deep-purple-10"
                            v-model="search.exp_min"
                            ref="exp_min"
                            :placeholder="$t('addJob.salaryMinPH')" :hint="null"
                            style="margin-right: 10px; width: calc(50% - 5px);"
                        />
                        <q-input
                            class="salInputsAdaptable"
                            dense outlined
                            bg-color="white" color="deep-purple-10"
                            v-model="search.exp_max"
                            ref="exp_max"
                            style="width: calc(50% - 5px);"
                            :placeholder="$t('addJob.salaryMaxPH')" :hint="null"
                        />
                        
                    </div>
                    
                    </div>
                </div>

                <div class="w586 field-widget">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <!-- <p class="star"> </p> -->
                        <p class="startP">{{$t('addCv.cityCurrent')}}</p>
                    </div>
                    <q-select
                        :value="search.city_current"
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
                    />
                </div>

                <hr class="cv-hr" style="margin: 8px 0;"/>

                <div class="w586">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <p class="startP">{{$t('addJob.langsLabel')}}</p>
                    </div>
                    <div class="flex">
                        <q-select
                            v-model="tmpLang"
                            :options="langOpts"
                            @filter="filterFnLangs"
                            @new-value="langsEnter"
                            @input-value="langInputShenanigans"
                            use-input
                            input-debounce="0"
                            fill-input
                            hide-selected
                            :placeholder="$t('addCv.langph')"
                            dense
                            outlined
                            bg-color="white" color="deep-purple-10"
                            dropdown-icon="none"
                            class="dropdown-padding-adjust lang-select"
                            style="flex-grow: 1; margin-right: 8px;"
                            :hint="null"
                            ref="lang"
                        >
                            <template v-slot:option="slotProps">
                                <div :lang="slotProps.opt" style="cursor: pointer; padding: 6px 10px;" class="hov-1" @click.prevent="selectClick">
                                    {{slotProps.opt}}
                                </div>
                            </template>
                        </q-select>
                        <q-btn @click="langsEnterOuter" class="ayoo" style="background-color: var(--violet-btn-color); color: white; border-radius: 10px; display: block; height: 36px;">
                            {{$t('addCv.addLang')}}
                        </q-btn>
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                    <!-- langs wrapper -->
                    <div style="text-align: left; font-size: 14px; margin-bottom: 4px;">
                        {{$t('addCv.addedLangs')}}:
                        <span v-if="!search.langs || !search.langs.length">
                        {{$t('addCv.noAddedLangs')}}
                        </span>
                    </div>
                    <q-chip
                        style="line-height: 20px; margin: 4px 8px; max-width: 220px; background-color: var(--violet-btn-color);"
                        v-for="lang in search.langs"
                        :key="lang"
                        removable
                        @remove="search.langs.splice(search.langs.findIndex(l => l === lang),1)"
                        text-color="white"
                        :label="lang"
                    />
                    </div>
                </div>

                <hr class="cv-hr" style="margin: 8px 0 16px;"/>


                <div class="w586 field-widget" style="margin-right: 44px;">
                    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                        <p class="startP">{{$t('addCv.cityBased')}}</p>
                    </div>
                    <q-select
                        :value="search.city_based"
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
                    />
                </div>
                <TextField
                    v-model="search.tel" ref="tel"
                    :label="$t('cvSearch.tel')" :ph="$t('cvSearch.telph')"
                    :maxlength="20" :maxlhidden="true"
                    class="field-widget"
                    style="margin-right: 0;"
                />

                <div style="display:flex; width: 100%; flex-wrap: wrap;">
                    <div class="w586 field-widget">
                        <p class="startP" style="font-weight: 600; margin-bottom: 10px;">{{$t('addCv.driversLabel')}}</p>
                        <div class="driver-cb-group">
                            <label
                                class="driver-cb"
                                v-for="(option, key, oidx) in search.driver"
                                :key="key"
                            >
                                <q-checkbox
                                    dense
                                    class="salcb1"
                                    color="red-10"
                                    v-model="search.driver[key]"
                                />
                                {{ driverOptions[oidx].label }}
                            </label>
                        </div>
                    </div>
                    <BoolField
                        :label="$t('addCv.carLabel')"
                        v-model="search.car"
                        :vals="[null, true, false]"
                        :labels="[$t('addCv.any'), $t('addCv.yes'), $t('addCv.no')]"
                        class="field-widget"
                        style="margin-top: 12px;"
                        noStarPMarginTop
                    />
                </div>
            </div>
            <!-- :loading="pending" -->
            <div style="display: flex;">
                <q-btn
                    class="headerBtns1 applybtn btn550adj"
                    style="margin-right: 10px; background-color: var(--violet-btn-color); font-weight: 700; max-width: 210px; display: block; align-self: center; margin-top: 18px;"
                    text-color="white"
                    :label="$t('filters.applyBtn')"
                    @click="submitSearch"
                />
                <q-btn
                    v-if="!isOpen"
                    class="headerBtns1 applybtn btn550adj"
                    style="margin-right: 10px; background-color: var(--violet-btn-color); font-weight: 700; max-width: 210px; display: block; align-self: center; margin-top: 18px;"
                    text-color="white"
                    :label="$t('filters.reopen')"
                    @click="isOpen = !isOpen"
                />
                <q-btn
                    v-if="isOpen"
                    class="headerBtns1 applybtn btn550adj"
                    style="background-color: var(--violet-btn-color); font-weight: 700; max-width: 210px; display: block; align-self: center; margin-top: 18px;"
                    text-color="white"
                    :label="$t('filters.resetBtn')"
                    @click="resetSearch"
                />
            </div>
        </div>
    </transition>
    <!-- </div>
    <p class="pageHeader" style="margin: 40px auto;" v-else>404. Not found</p> -->
</template>
<script>
import TextField from 'components/atoms/TextField'
import BoolField from 'components/atoms/BoolField'
// import DDSelect from './../atoms/DDSelect'
// import SelectField from 'components/atoms/SelectField'

export default {
    props: ['count'],
    components: { TextField, BoolField },
    data () {
        return {
            isOpen: true,
            searchLine: '',
            search: {
                exp: {label: "", value: 'idc'},
                expname: null,
                car: null,
                position: null,
                city_current: null,
                city_based: null,
                sal_min: null,
                sal_max: null,
                exp_min: null,
                exp_max: null,
                edu: null,
                langs: [],
                driver: {
                    a: false,
                    b: false,
                    c: false,
                    d: false
                }
            },
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
            cityList: this.$t('App.cityList'),
            cityOptions: this.cityList,
            eduList: this.$t('addCv.eduOptions'),
            eduOpts: this.eduList,
            lastSearchSummary: '',

            jobTitleList: this.$t('addCv.jobTitleOptions'),
            jobTitleOptions: this.jobTitleList,

            expNameList: this.$t('addCv.jobTitleOptions'),
            expNameOptions: this.expNameList,

            langList: this.$t('addJob.langOptions'),
            langOpts: this.langList,
            tmpLang: '',
        }
    },
    methods: {
        positionUpd (new1) {
            this.search.position = new1
        },
        addNewJobTitle (e) {
            this.positionUpd(e.target.value)
        },
        expNameUpd (new1) {
            this.search.expname = new1
        },
        addNewExpNameTitle (e) {
            this.expNameUpd(e.target.value)
        },
        jobTitleFilterFn (val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.jobTitleOptions = this.jobTitleList.filter(v => v.toLowerCase().indexOf(needle) > -1)
            })
        },
        expNameFilterFn (val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.expNameOptions = this.expNameList.filter(v => v.toLowerCase().indexOf(needle) > -1)
            })
        },

        selectClick (val) {
            const lang = val.target.getAttribute('lang').replace(',', '.')

            
            
            if (lang && lang.length) {
                if (this.search.langs.length < 3) {
                    if (!this.search.langs.includes(lang)) {
                        this.search.langs.push(lang)
                    } else {
                        this.$q.notify(this.$t('addCv.langDuplicate'))
                    }
                } else {
                  this.$q.notify(this.$t('addCv.langMax'))
                }
            }
            this.$refs.lang.hidePopup()
            this.tmpLang = ''
        },
        filterFnLangs (val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.langOpts = this.langList.filter(v => v.toLowerCase().indexOf(needle) > -1)
            })
        },
        langInputShenanigans (val) {
            this.tmpLang = val
        },
        langsEnterOuter () {
            if (this.tmpLang !== '') {
                if (this.search.langs.length < 3) {
                if (!this.search.langs.includes(this.tmpLang)) {
                    this.search.langs.push(this.tmpLang.replace(',', '.'))
                } else {
                    this.$q.notify(this.$t('addCv.langDuplicate'))
                }
                } else {
                this.$q.notify(this.$t('addCv.langMax'))
                }
                this.tmpLang = ''
            }
        },
        langsEnter (val, done) {
            if (val !== '') {
                if (this.search.langs.length < 3) {
                    if (!this.search.langs.includes(val)) {
                        this.search.langs.push(val.replace(',', '.'))
                    } else {
                        this.$q.notify(this.$t('addCv.langDuplicate'))
                    }
                } else {
                    this.$q.notify(this.$t('addCv.langMax'))
                }
                
                return done('', null)
            }
        },
            
        hide () {
            this.isOpen = false
        },

        resetSearch () {
            this.searchLine = ''
            this.search = {
                exp: {label: "", value: 'idc'},
                expname: null,
                car: null,
                position: null,
                city_current: null,
                city_based: null,
                sal_min: null,
                sal_max: null,
                exp_min: null,
                exp_max: null,
                edu: null,
                langs: [],
                driver: {
                    a: false,
                    b: false,
                    c: false,
                    d: false
                }
            }
            // this.submitSearch()
        },
        submitSearch () {
            // this.$axios
            //     .post('/')

            let paramsRaw = Object.entries(this.search)
                .filter(entry => entry[0] !== 'exp' && entry[0] !== 'driver')
                .filter(entry => entry[1] !== null)
                // .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
                .map(([key, val]) => `${key}=${val}`)
            
            // need like additional checkbox that turns driver on
            // let driver = ''
            // driver += this.search.driver.a ? 1 : 0
            // driver += this.search.driver.b ? 1 : 0
            // driver += this.search.driver.c ? 1 : 0
            // driver += this.search.driver.d ? 1 : 0
            // paramsRaw.push('driver=' + driver)
            this.searchLine && paramsRaw.push('txt=' + this.searchLine)
            let more = paramsRaw.join("&")
            more.length ? more = '&' + more : ''
            // console.log(more)
            this.lastSearchSummary = more.split('&')

            this.$emit('submit-search', more)
            // this.$router.push('/cv-list' + more)
        },
        addNewCity (e) {
            this.cityUpd(e.target.value)
        },
        addNewBasedCity (e) {
            this.cityBasedUpd(e.target.value)
        },
        cityUpd (new1) {
            this.search.city_current = new1
        },
        cityBasedUpd (new2) {
            this.search.city_based = new2
        },

        filterFn (val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.cityOptions = this.cityList.filter(v => v.toLowerCase().indexOf(needle) > -1)
            })
        },
        filterFnEdu (val, update, abort) {
            update(() => {
                const needle = val.toLowerCase()
                this.eduOpts = this.eduList.filter(v => v.toLowerCase().indexOf(needle) > -1)
            })
        },
    },
    // activated () {
    //     if (this.$store.state.user.role !== 'company' ||
    //         !this.$store.state.user.rights ||
    //         !this.$store.state.user.rights.includes('bauss')
    //     ) {
    //         this.$router.push('/')
    //         return false
    //     }
    //     // 
    // }
}
</script>

<style lang="stylus">
.cv-search__wrapper .q-field--outlined .q-field__control:before
  border 0 !important
.cv-search__wrapper .q-field__control
  font-size: 16px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
  @media screen and (max-width 550px)
    font-size: 14px;
.cv-search__wrapper .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.cv-search__wrapper .q-field__native input
  height 36px
.cv-search__wrapper .q-field__append
  height 36px
.cv-search__wrapper .q-select__dropdown-icon
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position center center
.dropdown-padding-adjust .q-field__control
  padding-right 4px !important

.cv-search__wrapper .salcb1 .q-checkbox__inner
  left 0px
  margin-right 0
  height 20px
  width 20px
  min-width 20px
  margin-right 8px !important

//desc field
.cv-search__wrapper .ql-toolbar.ql-snow
  border-top-left-radius 10px
  border-top-right-radius 10px
.cv-search__wrapper .ql-container.ql-snow
  border-bottom-left-radius 10px
  border-bottom-right-radius 10px
.q-field__bottom
  padding 5px
div.q-field__messages
  display flex
  justify-content center

.cv-search__wrapper .addCv__desc-inp .q-field__control
  font-size: 15px;
  line-height: 15px;
  border-radius 10px;
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1);
  padding 10px;
  min-height 160px !important
  height 160px !important
.cv-search__wrapper .addCv__desc-inp .q-field__native
  padding 0 !important
  font-size 16px
  min-height 138px !important
  height 138px !important
  resize none
.cv-search__wrapper .addCv__desc-inp .q-field__bottom
  padding-right 0

.cv-search__wrapper .lang-select .q-field__control
  max-height none !important
  height auto !important
.cv-search__wrapper .lang-select .q-field__native
  height: auto !important;
</style>

<style lang="stylus" scoped>
.cv-search__wrapper
    // margin-top 15px
    max-width 754px
    width 754px
    background var(--menubg-color)
    border: 0.5px solid #c2c2c6
    box-sizing: border-box
    border-radius: 10px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
    padding 30px
    padding-top 45px
    padding-bottom 35px
    margin-bottom 20px
    @media screen and (max-width 550px)
        width 100%
        max-width none
        padding 26px 22px
.jobs__top-searchx
    display flex
    margin-bottom 15px
    margin-top 0px
    width 100%
    position relative
.filtersHamburgerBtnx
    display block
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

.searchInputX
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
    padding 0 60px 0 42px
    width 100%//calc(72vw - 40px)
    // letter-spacing -1px
    font-size: 12px !important
    line-height: 12px !important
    height: 35px !important
    @media screen and (max-width 550px)
        padding 0 30px 0 32px
    &:focus
        outline none
        box-shadow 0px 0px 2px var(--violet-btn-color) !important

.searchBtnX
    background-color: var(--violet-btn-color) !important
    margin-left: -15px
    padding: 0 15px !important
    border 0
    color white
    text-transform uppercase
    cursor pointer
    width 110px
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
    &:focus
        outline none


.line
    display flex

*
  margin 0
.w586
  width 100%
.startP
  font-family: Montserrat;
  font-size: 14px;
  font-weight 500
  line-height: 17px;
  color var(--color1)
  position relative
  text-align left
.star
  margin-right 4px
  font-family: Montserrat, sans-serif
  font-size: 14px;
  line-height: 17px;
  color var(--btn-color)
  width 6px


.field-widget
    width calc(50% - 22px)
    margin-right 44px
    &:nth-child(2n)
        margin-right 0
    @media screen and (max-width 550px)
        width 100%
        margin-right 0

.driver-cb
    display: flex;
    align-items: center;
    margin: 12px 0;
    cursor: pointer;
    color: var(--color1);
    font-size: 14px;
    user-select: none;
    font-weight: 500;
    width: 38%;
    @media screen and (max-width 550px)
        width: 100%;
.driver-cb-group
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    @media screen and (max-width 550px)
        flex-direction column

.cv-hr
    border: 0;
    border-top: 0.5px solid rgba(0, 0, 0, 0.2) !important;
    width calc(100% + 20px)
    @media screen and (max-width 800px)
        width calc(100% + 68px)
.ayoo
    @media screen and (max-width 800px)
        margin-bottom: 6px;

.hov-1:hover
    color var(--violet-btn-color)

.btn550adj
    @media screen and (max-width 550px)
        font-size: 11px;

</style>
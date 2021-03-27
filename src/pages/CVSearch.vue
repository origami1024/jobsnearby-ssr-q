<template>
    <div class="cv-search" v-if="$store.state.user.role === 'company' && $store.state.user.rights && $store.state.user.rights.includes('bauss')">
        <p class="pageHeader">{{$t('cvList.cvListLabel')}}</p>
        <transition name="bounce">
            <div class="cv-search__wrapper" style="display: flex; flex-direction: column; align-items: center">
                <div class="jobs__top-searchx">
                    <button class="filtersHamburgerBtnx"/>
                    <!-- @click="$store.dispatch('filtersToggle')" -->
                    <input
                        style="border:none;"
                        class="searchInputX"
                        type="text"
                        :value="searchLine"
                        :placeholder="$t('jobs.searchPh')"
                    >
                    <button
                        class="headerBtns1 searchBtnX"
                    >
                    </button>
                </div>
                <div style="width: 100%; display: flex; flex-wrap: wrap;">
                    <div class="w586 field-widget">
                        <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
                            <!-- <p class="star"> </p> -->
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
                    </div>
                    <div class="w586 field-widget">
                        <div class="sal-wrap">
                            <div class="addJoblabel" style="display: flex; margin-bottom: 8px;">
                                <p class="startP">{{$t('addJob.salaryLabel')}}</p>
                            </div>
                            <div class="line">
                                <q-input
                                    class="salInputsAdaptable salInput1"
                                    dense outlined
                                    bg-color="white" color="deep-purple-10"
                                    v-model="search.sal_min"
                                    ref="salary_min"
                                    :placeholder="$t('addJob.salaryMinPH')" :hint="null"
                                    style="margin-right: 10px; width: calc(50% - 5px);"
                                />
                                <q-input
                                    class="salInputsAdaptable"
                                    dense outlined
                                    bg-color="white" color="deep-purple-10"
                                    v-model="search.sal_max"
                                    ref="salary_max"
                                    style="width: calc(50% - 5px);"
                                    :placeholder="$t('addJob.salaryMaxPH')" :hint="null"
                                />
                                
                            </div>
                        </div>
                    </div>

                    <TextField
                        v-model="search.expname" ref="expname"
                        :label="$t('cvSearch.expName')" :ph="$t('cvSearch.expNamePh')"
                        :maxlength="75" :maxlhidden="true"
                        class="field-widget"
                    />

                    <div>ОБРАЗОВАНИЕ!</div>
                    
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
                    <div class="w586 field-widget">
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
                    />

                    <div style="display:flex; width: 100%;">
                        <div class="w586 field-widget">
                            <p class="startP" style="font-weight: 600; margin-bottom: 20px;">{{$t('addCv.driversLabel')}}</p>
                            <label
                                style="
                                    display: flex; align-items: center; margin: 12px 0;
                                    cursor: pointer; color: var(--color1); font-size: 14px;
                                    user-select: none; font-weight: 500;
                                "
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
                        <BoolField
                            :label="$t('addCv.carLabel')"
                            v-model="search.car"
                            :labels="[$t('addCv.yes'), $t('addCv.no')]"
                            class="field-widget"
                            noStarPMarginTop
                        />
                    </div>
                </div>
                <q-btn
                    :loading="pending"
                    :style="{width: $store.getters.isResetShown ? '126px': '100%'}"
                    class="headerBtns1 applybtn"
                    style="background-color: var(--violet-btn-color); font-weight: 700; max-width: 210px; display: block; align-self: center; margin-top: 18px;"
                    text-color="white"
                    :label="$t('filters.applyBtn')"
                    @click="applyFilters"
                />
            </div>
        </transition>
    </div>
    <p class="pageHeader" style="margin: 40px auto;" v-else>404. Not found</p>
</template>
<script>
import TextField from 'components/atoms/TextField'
import BoolField from 'components/atoms/BoolField'
// import DDSelect from './../atoms/DDSelect'
// import SelectField from 'components/atoms/SelectField'

export default {
    components: { TextField, BoolField },
    data () {
        return {
            searchLine: '',
            search: {
                exp: {label: "", value: 'idc'},
                expname: '',
                car: null,
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
        }
    },
    methods: {
        
    },
    activated () {
        if (this.$store.state.user.role !== 'company' ||
            !this.$store.state.user.rights ||
            !this.$store.state.user.rights.includes('bauss')
        ) {
            this.$router.push('/')
            return false
        }
        // 
    }
}
</script>

<style lang="stylus">
.cv-search .q-field--outlined .q-field__control:before
  border 0 !important
.cv-search .q-field__control
  font-size: 16px;
  line-height: 15px;
  border-radius 10px
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
  height 36px
  min-height 36px !important
  @media screen and (max-width 550px)
    font-size: 14px;
.cv-search .q-field__native
  height 36px !important
  min-height 36px !important
  padding 0 !important
.cv-search .q-field__native input
  height 36px
.cv-search .q-field__append
  height 36px
.cv-search .q-select__dropdown-icon
  background-image url('~assets/arrow2.png');
  background-repeat no-repeat
  background-position center center
.dropdown-padding-adjust .q-field__control
  padding-right 4px !important

.cv-search .salcb1 .q-checkbox__inner
  left 0px
  margin-right 0
  height 20px
  width 20px
  min-width 20px
  margin-right 8px !important

//desc field
.cv-search .ql-toolbar.ql-snow
  border-top-left-radius 10px
  border-top-right-radius 10px
.cv-search .ql-container.ql-snow
  border-bottom-left-radius 10px
  border-bottom-right-radius 10px
.q-field__bottom
  padding 5px
div.q-field__messages
  display flex
  justify-content center

.cv-search .addCv__desc-inp .q-field__control
  font-size: 15px;
  line-height: 15px;
  border-radius 10px;
  box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1);
  padding 10px;
  min-height 160px !important
  height 160px !important
.cv-search .addCv__desc-inp .q-field__native
  padding 0 !important
  font-size 16px
  min-height 138px !important
  height 138px !important
  resize none
.cv-search .addCv__desc-inp .q-field__bottom
  padding-right 0

.cv-search .lang-select .q-field__control
  max-height none !important
  height auto !important
.cv-search .lang-select .q-field__native
  height: auto !important;
</style>

<style lang="stylus" scoped>
.cv-search
    // max-width 80%
    width 754px
    margin-bottom 70px !important
    @media screen and (max-width 550px)
        width 100%
        padding 0 20px
.cv-search__wrapper
    // margin-top 15px
    max-width 754px
    width 754px
    background var(--menubg-color)
    border: 0.5px solid #C2C2C6
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
        padding 26px 34px
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
</style>
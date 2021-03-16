<template>
    <div v-if="loading" class="cv-list" style="margin-top: 140px;">
        <div  class="lds-dual-ring"/>
    </div>
    <div class="cv-list" v-else-if="$store.state.user.role === 'company' && $store.state.user.rights && $store.state.user.rights.includes('bauss')">
        <!-- TODO: serverside check role before sending?? -->
        <p class="pageHeader">{{$t('cvList.cvListLabel')}}</p>
        <!-- <div>
            search-bar
        </div> -->
        <div class="jobs__top-search">
            <button class="filtersHamburgerBtn"/>
            <!-- @click="$store.dispatch('filtersToggle')" -->
            <input
                style="border:none;"
                class="searchInput"
                type="text"
                :value="searchLine"
                :placeholder="$t('jobs.searchPh')"
            >
            <!-- @keyup.enter="$store.dispatch('refreshjobs', {}); $store.dispatch('filtersOff')" -->
            <!-- @input="$store.dispatch('filterUpd', {prop: 'txt', value: $event.target.value})" -->
            <button
                class="headerBtns1 searchBtn"
            >
            <!-- @click="$store.dispatch('refreshjobs', {}); $store.dispatch('filtersOff')" -->
                <span class="noshow-below550">{{$t('filters.searchBtn')}}</span>
            </button>
        </div>

        <div>
            <div
                v-for="cv in cvs"
                :key="cv.id"
                class="cv-row"
            >
                <div class="cv-col-id">{{ cv.id }}</div>
                <div
                    class="cv-col-photo"
                    :style="{
                        backgroundImage: 'url(/statics/subscriber-logo-ph.svg)'
                    }"
                >
                    {{ cv.photo }}
                </div>
                <div class="cv-col-mid">
                    <div class="cv-top-line">
                        <router-link class="cv-name" :to="'/cvs/' + cv.id">
                            {{ cv.name + ' ' + cv.surname }}
                        </router-link>
                        <div class="cv-city">{{ cv.city_current || cv.city_home || '-' }}</div>
                    </div>
                    <div class="cv-body-line">
                        <div class="left">
                            <div class="cv-secondary">{{ cv.wantedJob }}</div>
                            <div class="cv-secondary">{{ cv.salary_min ? cv.salary_min + '$ - ' : ''}} {{ cv.salary_max ? cv.salary_max + '$' : ''}}</div>
                            <div class="cv-text">
                                {{ cv.exp ? $t('cvList.expYes') + '.' : '' }}
                                {{ (cv.langs && cv.langs.length) ? $t('cvList.langs1') + ' ' + cv.langs.length + ' ' + $t('cvList.langs2') + '.' : ''}}
                                {{ cv.edu ? $t('cvList.edu') + ': ' + cv.edu + '...' : ''}}
                            </div>
                        </div>
                        <div class="right" style="margin-top: auto;">
                            <div class="cv-tel cv-tel-1">{{ cv.tel }}</div>
                            <div class="cv-tel">{{ cv.tel_home }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div>

        </div> -->
        <!-- <div class="cvpage__wrapper" :key="1" style="display: flex; flex-direction: column; align-items: center">
            xxxxx
        </div> -->
    </div>
    <p class="pageHeader" style="margin: 40px auto;" v-else>404. Not found</p>
</template>
<script>
export default {
    computed: {
        currentPage () {
            return this.$route.query.p
                ? Number.isInteger(Number(this.$route.query.p))
                    ? Number(this.$route.query.p)
                    : 1
                : 1
        }
    },
    data () {
        return {
            loading: true,
            cvs: [],
            searchLine: ''
        }
    },
    activated () {
        if (this.$store.state.user.role !== 'company' ||
            !this.$store.state.user.rights ||
            !this.$store.state.user.rights.includes('bauss')
        ) {
            this.$router.push('/')
            return false
        }
        this.loading = true
        this.$axios
            .get('/cv-index', null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
            .then(resp => {
                if (resp.data && Array.isArray(resp.data)) {
                    this.cvs = resp.data
                    this.loading = false
                } else {
                    this.$q.notify('Error receiving cvs from the server')
                    this.loading = false
                }
            })
            .catch(err => {
                this.$q.notify('Unknown error with cvs', err)
                this.loading = false
            })
    }
}
</script>


<style lang="stylus" scoped>
.cv-list
  // max-width 80%
  width 754px
  margin-bottom 70px !important
  @media screen and (max-width 550px)
    width 100%
    padding 0 20px
//   .cvpage__wrapper
//     // margin-top 15px
//     max-width 754px
//     width 754px
//     background var(--menubg-color)
//     border: 0.5px solid #C2C2C6
//     box-sizing: border-box
//     border-radius: 10px;
//     box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
//     padding 10px
//     padding-top 45px
//     padding-bottom 35px
//     margin-bottom 20px
//     @media screen and (max-width 550px)
//       width 100%
//       max-width none
//       padding 26px 34px

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #8645ff;
  border-color: var(--color1) transparent #8645ff transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.cv-row {
    display: flex;
    background-color #fff;
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 20px;
    width: 100%;
    margin-bottom: 10px;
    height: 128px;
    @media screen and (max-width 800px) {
        padding: 12px;
        height: 148px;
    }
}
.cv-col-id {
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #C00027;
    @media screen and (max-width 800px) {
        margin-right: 8px;
    }
}
.cv-col-photo
    width 88px
    min-width 88px
    height 88px
    background #fff
    box-shadow 0px 0px 10px rgba(0, 0, 0, 0.1)
    border-radius 50%
    background-repeat no-repeat
    background-position center
    background-size 35%
    margin-right 30px
    @media screen and (max-width 800px)
        width 40px
        min-width 40px
        height 40px
        margin-right 18px

.cv-name {
    font-weight: 600;
    text-decoration: none;
    font-size: 14px;
    line-height: 17px;
    color: #C00027;
    margin-top: 5px;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    flex-grow: 1;
    max-width: calc(100% - 60px);
    &:hover {
        color: #D00027;
    }
}
.cv-top-line {
    display: flex;
}
.cv-body-line {
    display: flex;
    height: calc(100% - 12px);
    .left {
        flex-grow: 1;
    }
    @media screen and (max-width 550px) {
        max-width: calc(100% - 16px);
        height: calc(100% - 16px);
    }
}
.cv-secondary {
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;
    color: #181059;
    margin-top: 9px;
}
.cv-text {
    font-weight: normal;
    font-size: 12px;
    line-height: 130%;
    color: #181059;
    margin-top: 16px;
}
.cv-col-mid {
    text-align: left;
    flex-grow: 4;
    @media screen and (max-width 550px) {
        max-width: calc(100% - 66px);
    }
}
// .cv-col-end {
//     margin-left: 12px;
//     flex-grow: 1;
//     display: flex;
//     flex-direction: column;
// }
.cv-city {
    font-weight: 600;
    font-size: 10px;
    line-height: 130%;
    color: #8645FF;
    margin-left: 10px;
    min-width: 60px;
    text-align: right;
    @media screen and (max-width 550px) {
        min-width: 36px;
    }
}
.cv-tel {
    margin-bottom: 7px;
    font-size: 10px;
    line-height: 130%;
    color: #C00027;
}
.cv-tel-1 {
    margin-top: auto;
}
.jobs__top-search
    display flex
    margin-bottom 15px
    @media screen and (max-width 550px)
        margin-top 0px
        width 100%
        position relative
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

</style>
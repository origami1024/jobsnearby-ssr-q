<template>
    <div v-if="loading" class="cv-list" style="margin-top: 140px;">
        <div  class="lds-dual-ring"/>
    </div>
    <div
        class="cv-detail"
        v-else-if="
            ($store.state.user.role === 'company' && cv && Object.keys(cv).length) ||
            ($store.state.user.role === 'subscriber' &&
            $store.state.user.cv_id &&
            $route.params.id &&
            $store.state.user.cv_id == $route.params.id)
        "
    >
        <p class="pageHeader">{{$t('cvDetail.label')}}</p>
        
        <div class="cv-detail-inner">
            <!-- <div class="left">
                <pre>{{ cv }}</pre>
            </div>
            <div class="right"></div> -->
            <div class="block-1">
                <div class="cvd-header">{{cv.name + ' ' + cv.surname}}</div>
                <div class="cvd-subheader">
                    <span v-if="cv.birth">
                        {{bdate}}
                        ({{Math.abs(new Date(Date.now() - +(new Date(cv.birth))).getUTCFullYear() - 1970)}}
                        {{$t('cvDetail.agePostfix')}}){{cv.sex ? ',' : ''}}
                    </span>
                    <span v-if="cv.sex">
                        {{
                            {m: $t('addCv.sexM'), f: $t('addCv.sexF')}[cv.sex].substring(0,3).toLowerCase()
                        }}
                    </span>
                </div>
                <div class="cvd-job">{{cv.wanted_job}}</div>
                <div class="cvd-salary">
                    <span>Желаемая зарплата: </span>
                    <span class="cvd-sal-line">
                        {{ cv.salary_min ? cv.salary_min : ''}}{{ (cv.salary_max && cv.salary_min) ? ' - ' : '' }}{{ cv.salary_max ? cv.salary_max : '' }}{{(cv.salary_max || cv.salary_min) ? ' m' : '-'}}
                    </span>
                </div>
            </div>
            <div class="block-2">
                <img
                    width="auto"
                    style="max-width: 100%; max-height: 188px;"
                    :src="'/uploads/cvpics/' + cv.photo"
                    alt="photo"
                    ref="photo"
                    @error="cvPhotoError"
                />
                <!-- src="/statics/rect68.png" -->
            </div>
            <div class="block-3">
                <div
                    v-if="(cv.cvExt && cv.cvExt.exps && cv.cvExt.exps.length)"
                    style="margin-bottom: 50px;"
                >
                    <div class="cvd-block-header">
                        {{$t('cvDetail.exp')}}
                    </div>
                    <div class="cvd-text" style="display: flex; flex-direction: column-reverse;">
                        <div
                            v-for="(exp, eidx) in cv.cvExt.exps"
                            :key="eidx"
                            style="margin-bottom: 24px;"
                        >
                            <div class="cv-enitity">
                                {{ exp.position }}
                            </div>
                            <div class="cv-place">
                                <span>{{ exp.place }}</span>
                                <div class="cv-year" v-if="exp.start || exp.end">
                                    {{ exptwoDates(exp.start, exp.end) }}
                                    <!-- <span v-if="exp.start">
                                        {{$t('addCv.from')}} {{expDate(exp.start)}}
                                    </span>
                                    <span v-if="exp.end">
                                        {{$t('addCv.to')}} {{expDate(exp.end)}}
                                    </span>
                                    {{ $t('cvDetail.yearPostfix')}} -->
                                </div>
                            </div>
                            <pre class="cv-dsc" style="margin: 8px 0; font-size: 18px;">{{exp.desc}}</pre>
                        </div>
                    </div>
                </div>
                <div v-if="cv.edu || (cv.cvExt && cv.cvExt.edus && cv.cvExt.edus.length)">
                    <div class="cvd-block-header">
                        {{$t('cvDetail.edu')}}
                    </div>
                    <div v-if="cv.edu" class="cvd-text">
                        {{ cv.edu }}
                    </div>
                    <div v-else class="cvd-text">
                        <div
                            v-for="(edu, eidx) in cv.cvExt.edus"
                            :key="eidx"
                            style="margin-bottom: 20px;"
                        >
                            <div class="cv-enitity mb-1x">
                                {{ edu.general }}
                            </div>
                            <div class="cv-place mb-1x">
                                <span>{{ edu.place }}</span>
                                <span class="cv-year">
                                    {{ edu.year }} {{ $t('cvDetail.yearPostfix')}}
                                </span>
                            </div>
                            <div class="cvd-line mb-1x" v-if="edu.fac">
                                <span class="bold">
                                    {{$t('addCv.fac')}}:
                                </span>
                                {{ edu.fac }}
                            </div>
                            <div class="cvd-line" v-if="edu.spec">
                                <span class="bold">
                                    {{$t('addCv.spec')}}:
                                </span>
                                {{ edu.spec }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="block-4">
                <div>
                    <div class="cvd-block-header">
                        {{$t('cvDetail.contacts')}}
                    </div>
                    <div class="cvd-text">
                        <div class="cvd-line">
                            <span class="bold">
                                {{$t('addCv.tel')}}: 
                            </span>
                            {{cv.tel}}
                        </div>
                        <div class="cvd-line">
                            <span class="bold">
                                {{$t('cvDetail.telHome')}}: 
                            </span>
                            {{cv.tel_home}}
                        </div>
                        <div class="cvd-line" v-if="cv.email">
                            <span class="bold">
                                {{$t('addCv.email')}}: 
                            </span>
                            {{cv.email}}
                        </div>
                        <div class="cvd-line" v-if="cv.city_current">
                            <span class="bold">
                                {{$t('addCv.cityCurrent')}}: 
                            </span>
                            {{cv.city_current}}
                        </div>
                        <div class="cvd-line" v-if="cv.city_based">
                            <span class="bold">
                                {{$t('addCv.cityBased')}}: 
                            </span>
                            {{cv.city_based}}
                        </div>
                        <div class="cvd-line" v-if="cv.family === true || cv.family === false">
                            <span class="bold">
                                {{cv.family ? $t('addCv.familyYes') : $t('addCv.familyNo')}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="block-5">
                <div v-if="cv.langs && cv.langs.length" style="margin-bottom: 50px;">
                    <div class="cvd-block-header">
                        {{$t('cvDetail.langs')}}
                    </div>
                    <div class="cvd-text">
                        <div
                            v-for="(lang, lidx) in cv.langs"
                            :key="lidx"
                            style="word-wrap: break-word; text-transform: capitalize;"
                        >
                            {{ lang }}
                        </div>
                    </div>
                </div>
                <div v-if="cv.car || (cv.driver && (cv.driver.a || cv.driver.b || cv.driver.c || cv.driver.d))">
                    <div class="cvd-block-header">
                        {{$t('cvDetail.skills')}}
                    </div>
                    <div class="cvd-text">
                        <div class="cvd-line" v-if="cv.car">
                            {{ $t('addCv.carLabel') }}
                        </div>
                        <div class="cvd-line" v-if="cv.car && (cv.driver.a || cv.driver.b || cv.driver.c || cv.driver.d)">
                            {{ $t('cvDetail.carCategory') }} {{['', 'A'][+cv.driver.a]}} {{['', 'B'][+cv.driver.b]}} {{['', 'C'][+cv.driver.c]}} {{['', 'D'][+cv.driver.d]}}
                        </div>
                        <div class="cvd-line" v-else-if="!cv.car && (cv.driver.a || cv.driver.b || cv.driver.c || cv.driver.d)">
                            {{ $t('cvDetail.carCategoryWithoutCar') }} {{['', 'A'][+cv.driver.a]}} {{['', 'B'][+cv.driver.b]}} {{['', 'C'][+cv.driver.c]}} {{['', 'D'][+cv.driver.d]}}
                        </div>
                        <div style="margin-top: 5px; word-wrap: break-word;" class="cvd-line bold" v-if="cv.skills">
                            {{cv.skills}}
                        </div>
                    </div>
                </div>
            </div>
            <div class="cvd-subheader cvd-footer">
                <div>{{$t('cvDetail.updated_at')}} <span style="font-weight: 900;">{{formatDate(cv.updated_at)}}</span></div>
                <div>{{$t('cvDetail.last_online')}} <span style="font-weight: 900;">{{formatDate(cv.last_logged_in)}}</span></div>
            </div>
        </div>
    </div>
    <p class="pageHeader" style="margin: 40px auto;" v-else>404. Not found</p>
</template>
<script>
export default {
    data () {
        return {
            loading: true,
            cv: {}
        }
    },
    computed: {
        bdate () {
            if (this.cv.birth) {
                try {
                    const d = (new Date(this.cv.birth))
                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
                } catch (error) {
                    
                }
            }
            return ''
        }
    },
    methods: {
        cvPhotoError () {
            this.$nextTick(() => {
                if (this.$refs.photo && this.$refs.photo.src && !this.$refs.photo.src.endsWith('/statics/personph.svg')) {
                    this.$refs.photo.src = '/statics/personph.svg'
                }
            })
        },
        formatDate (date) {
            if (date) {
                try {
                    const d = new Date(date)
                    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.toTimeString().substring(0, 5)}`
                } catch (error) {
                }
            }
            return '-'
        },
        exptwoDates(dstrfrom, dstrto) {
            if (dstrfrom && dstrto) {
                const d1 = new Date(dstrfrom)
                const d2 = new Date(dstrto)
                if (d1.getFullYear() !== d2.getFullYear()) {
                    return this.$t('cvDetail.monthsFull')[d1.getMonth()] +
                        ' ' +
                        d1.getUTCFullYear() +
                        this.$t('cvDetail.yearPostfix2') +
                        ' - ' +
                        this.$t('cvDetail.monthsFull')[d2.getMonth()] +
                        ' ' +
                        d2.getUTCFullYear() +
                        this.$t('cvDetail.yearPostfix2')
                } else {
                    return this.$t('cvDetail.monthsFull')[d1.getMonth()] +
                        ' ' +
                        ' - ' +
                        this.$t('cvDetail.monthsFull')[d2.getMonth()] +
                        ' ' +
                        d2.getUTCFullYear() +
                        this.$t('cvDetail.yearPostfix2')
                }
            } else {
                const d1 = new Date(dstrfrom)
                return this.$t('cvDetail.monthsFull')[d1.getMonth()] +
                        ' ' +
                        d1.getUTCFullYear() +
                        this.$t('cvDetail.yearPostfix2') +
                        ' ' +
                        this.$t('cvDetail.workingYet')
            }
            
        }
    },
    activated () {
        // if (this.$store.state.user.role !== 'company' ||
        //     !this.$store.state.user.rights ||
        //     !this.$store.state.user.rights.includes('bauss')
        // ) {
        //     this.$router.push('/')
        //     return false
        // }
        this.loading = true
        const cv_id = this.$route.params.id || -1
        this.$axios
            .get('/cv/' + cv_id, null, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
            .then(resp => {
                if (resp.data) {
                    const respd = resp.data
                    const driverDict = ['a', 'b', 'c', 'd']
                    if (respd.driver) {
                        
                        respd.driver = respd.driver.split('').reduce((acc, cur, didx) => {
                            acc[driverDict[didx]] = !!Number(cur)
                            return acc
                        }, {})
                    } else {
                        respd.driver = {a: false, b: false, c: false, d: false}
                    }
                    this.cv = respd
                    this.loading = false
                } else {
                    this.$q.notify('Error receiving cv data from the server')
                    this.loading = false
                }
            })
            .catch(err => {
                this.$q.notify('Unknown error with cv data', err)
                this.loading = false
            })
    }
}
</script>


<style lang="stylus" scoped>
.cv-detail
  // max-width 80%
  width 754px
  margin-bottom 70px !important
  @media screen and (max-width 550px)
    width 100%
    padding 0 20px

.cv-detail-inner
    position: relative;
    background: #FFFFFF;
    opacity: 0.99;
    border: 0.5px solid rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 60px 30px 60px 50px
    display: grid
    grid-template-columns calc(56% - 30px) calc(44% - 30px)
    column-gap 60px
    row-gap 50px
    grid-template-areas "block-1 block-2" "block-3 block-4" "block-3 block-5"
    text-align left
    @media screen and (max-width 800px)
        grid-template-columns 100%
        row-gap 30px
        padding 30px 20px
        padding-bottom 60px
        grid-template-areas "block-1" "block-2" "block-4" "block-3" "block-5"
    div
        // background-color gray
        // color #fff
    .block-1
        grid-area block-1
        @media screen and (max-width 800px)
            text-align center

    .block-2
        grid-area block-2
        display flex
        @media screen and (max-width 800px)
            img
                margin 0 auto
    .block-3
        grid-row span 2
        grid-area block-3
    .block-4
        grid-area block-4
    .block-5
        grid-area block-5

    .cvd-block-header
        font-style: italic;
        font-weight: 600;
        font-size: 18px;
        line-height: 22px;
        color: #C00027;
        border-bottom: 0.5px solid #000000;
        padding-bottom: 8px;
        margin-bottom 25px

    .cvd-header
        font-weight: bold;
        font-size: 28px;
        line-height: 34px;
        color: #C00027;
        word-break: break-word;
    .cvd-subheader
        margin-top 8px
        font-weight 600
        margin-bottom 40px
    .cvd-job
        font-weight: 600;
        font-size: 20px;
        line-height: 24px;
        color: #C00027;
        margin-bottom 15px
    .cvd-salary
        font-size: 18px;
        line-height: 28px;
        color: #181059;
        span
            font-weight: 600;
        @media screen and (max-width 800px)
            display: flex;
            flex-direction: column;
    .cvd-sal-line
        display: inline-block;
    .cvd-text
        font-size: 16px;
        line-height: 23px;
        color: #181059;
        // margin-bottom 50px
        .bold
            font-weight 600

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
.mb-1x {
    margin-bottom: 3px;
}
.cv-enitity {
    font-weight: 600;
    font-size: 16px;
    line-height: 23px;
    color: #181059;
    text-transform: uppercase;
}
.cv-place {
    font-weight: 500;
    color: #8645FF;
}
.cv-year {
    color: rgba(24, 16, 89, 1);
    font-style: italic;
}
.cv-dsc {
    font-family: "Montserrat", sans-serif;
    font-size: 14px !important;
    word-wrap: break-word;
    white-space: pre-wrap;
}
.cvd-footer
    position: absolute;
    left: 50px;
    right: 30px;
    bottom: 20px;
    margin-bottom: 0 !important;
    display: flex;
    justify-content: space-between;
    @media screen and (max-width 550px)
        flex-direction column
        left: 20px;
        right: 20px;
</style>
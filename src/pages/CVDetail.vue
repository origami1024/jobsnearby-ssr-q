<template>
    <div v-if="loading" class="cv-list" style="margin-top: 140px;">
        <div  class="lds-dual-ring"/>
    </div>
    <div
        class="cv-detail"
        v-else-if="
            ($store.state.user.role === 'company' &&
            $store.state.user.rights &&
            $store.state.user.rights.includes('bauss')) ||
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
                <div class="cvd-job">{{cv.wanted_job}}</div>
                <div class="cvd-salary">
                    <span>Желаемая зарплата: </span>
                    {{ cv.salary_min ? cv.salary_min + ' m - ' : ''}} {{ cv.salary_max ? cv.salary_max + ' m' : ''}}
                </div>
            </div>
            <div class="block-2">
                <img
                    width="auto"
                    style="max-width: 100%; max-height: 188px;"
                    :src="'/uploads/cvpics/' + cv.photo"
                    alt="photo"
                />
                <!-- src="/statics/rect68.png" -->
            </div>
            <div class="block-3">
                <div>
                    <div class="cvd-block-header">
                        {{$t('cvDetail.exp')}}
                    </div>
                    <div class="cvd-text">
                        <div
                            v-for="(exp, eidx) in cv.cvExt.exps"
                            :key="eidx"
                            style="margin-bottom: 20px;"
                        >
                            <div class="cv-enitity">
                                {{ exp.position }}
                            </div>
                            <div class="cv-place">
                                <span>{{ exp.place }}</span>
                                <span class="cv-year" v-if="exp.range">
                                    <span v-if="exp.range.from">
                                        {{$t('addCv.from')}} {{exp.range.from}}
                                    </span>
                                    <span v-if="exp.range.from">
                                        {{$t('addCv.to')}} {{exp.range.to}}
                                    </span>
                                    {{ $t('cvDetail.yearPostfix')}}
                                </span>
                            </div>
                            <div class="cv-dsc">
                                {{exp.desc}}
                            </div>
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
                            <div class="cv-enitity">
                                {{ edu.spec }}
                            </div>
                            <div class="cv-place">
                                <span>{{ edu.place }}</span>
                                <span class="cv-year">
                                    {{ edu.year }} {{ $t('cvDetail.yearPostfix')}}
                                </span>
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
                        <div class="cvd-line" v-if="cv.email">
                            <span class="bold">
                                {{$t('addCv.email')}}: 
                            </span>
                            {{cv.email}}
                        </div>
                        <div class="cvd-line" v-if="cv.family === true || cv.family === false">
                            <span class="bold">
                                {{cv.family ? $t('addCv.familyYes') : $t('addCv.familyNo')}}
                            </span>
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
                    </div>
                </div>
            </div>
            <div class="block-5">
                <div v-if="cv.langs && cv.langs.length">
                    <div class="cvd-block-header">
                        {{$t('cvDetail.langs')}}
                    </div>
                    <div class="cvd-text">
                        <div
                            v-for="(lang, lidx) in cv.langs"
                            :key="lidx"

                        >
                            {{ lang }}
                        </div>
                    </div>
                </div>
                <div v-if="cv.car || cv.driver.a || cv.driver.b || cv.driver.c || cv.driver.d">
                    <div class="cvd-block-header">
                        {{$t('cvDetail.skills')}}
                    </div>
                    <div class="cvd-text">
                        <div class="cvd-line" v-if="cv.car">
                            {{ $t('addCv.carLabel') }}
                        </div>
                        <div class="cvd-line" v-if="cv.driver.a || cv.driver.b || cv.driver.c || cv.driver.d">
                            {{ $t('cvDetail.carSkills') }} {{['', 'A'][+cv.driver.a]}} {{['', 'B'][+cv.driver.b]}} {{['', 'C'][+cv.driver.c]}} {{['', 'D'][+cv.driver.d]}}
                        </div>
                    </div>
                </div>
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
                    respd.driver = respd.driver.split('').reduce((acc, cur, didx) => {
                        acc[driverDict[didx]] = !!Number(cur)
                        return acc
                    }, {})
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
        margin-bottom 50px
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
    .cvd-text
        font-size: 16px;
        line-height: 23px;
        color: #181059;
        margin-bottom 50px
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
}
</style>
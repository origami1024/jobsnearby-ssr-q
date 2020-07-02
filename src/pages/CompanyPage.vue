<template>
  <div class="jobpage" itemscope="" itemtype="http://schema.org/Organization">
    <main class="detailed__main">
      <section class="detailed__line" style="marginBottom: 5px">
        <div class="detailed__col">
          <h1 class="titleHeader" itemprop="name">{{cdata.company}}</h1>
          <div style="width: 100%">
            <p itemprop="website" class="font-wrap">
              {{cdata.website}}
            </p>
          </div>
        </div>
        <div 
          class="detailed__logo"
          :style="{'background-image': 'url(' + (
            (cdata.logo_url && cdata.logo_url.length > 0)
            ? cdata.logo_url 
            : '/statics/companyph.png')
          + ')'}" >
        </div>
      </section>
      <section v-if="cdata.domains.length > 0">
        <h4 class="detailed__header">{{$t('companyPage.categoriesHeader')}}</h4>
        <div itemprop="industry" class="subitem"  v-if="cdata.domains[0]">
          {{$t('entProfile.companyDomains')[cdata.domains[0]]}}
        </div>
        <div itemprop="industry" class="subitem"  v-if="cdata.domains[1]">
          {{$t('entProfile.companyDomains')[cdata.domains[1]]}}
        </div>
        <div itemprop="industry" class="subitem"  v-if="cdata.domains[2]">
          {{$t('entProfile.companyDomains')[cdata.domains[2]]}}
        </div>
      </section>
      <section>
        <h4 class="detailed__header">{{$t('companyPage.descHeader')}}</h4>
        <div class="subitem" >
          <div itemprop="description" v-if="cdata.full_description && cdata.full_description.length > 0" class="descriptionHTML">{{cdata.full_description}}</div>
          <div v-else>
            {{$t('companyPage.descPh')}}
          </div>
        </div>
      </section>
      <section style="display: flex; justify-content: space-between">
        <p style="margin-right: 50px;">{{$t('companyPage.publishedJobsCountLabel')}}<span>{{cdata.jobs_count > 0 ? cdata.jobs_count : 1}}</span></p>
        <p >{{$t('companyPage.registrationDate')}}<span>{{timeCreated}}</span></p>
      </section>
    </main>
  </div>
</template>

<script>

export default {
  name: 'companypage',
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    if (ssrContext) {
      // console.log('cp91', ssrContext.req.companyData)
      return store.dispatch('setCompanyDetails', ssrContext.req.companyData)
    } else
      return store.dispatch('fetchCompanyDetails', currentRoute.query.id)
  },
  computed: {
    cdata() {
      return this.$store.state.cdata
    },
    timeCreated() {
      let d = new Date(this.cdata.time_created)
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    }
  },
  methods: {
    getCompanyData() {
      let companyUrl = config.jobsUrl + '/companyby.idjson=' + this.$route.query.id
        this.ajaxLoading = true
        axios
          .get(companyUrl, null, {headers: {'Content-Type' : 'application/json' }})
          .then(response => {
            //getting the one page data
            // console.log('cpJJ2', response.data)
            this.cdata = response.data
            //this.setVariables()
            this.ajaxLoading = false
            
          })
    },
  }
}
</script>

<style lang="stylus" scoped>
* {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
  }
.jobpage
  padding 20px 0px
  @media screen and (max-width 550px)
    padding 20px 20px
.detailed__main
  width: 80%;
  max-width: 850px;
  background-color: white;
  padding: 0 10px;
  padding-top: 10px;
  box-sizing border-box
  border-radius 10px
  box-shadow 0 0 3px 2px var(--main-borders-color)
  display flex
  flex-direction column
  
  margin 0 auto
  margin-top 15px
  width 850px 
  // background var(--menubg-color)
  // border: 0.5px solid #C2C2C6
  // box-sizing: border-box
  // border-radius: 10px;
  // box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
  @media screen and (max-width 950px)
    width 700px
  @media screen and (max-width 800px)
    width 550px
  @media screen and (max-width 550px)
    width 100%
  .titleHeader
    font-size 24px !important
    margin-top 8px
  .font-wrap
    font-size 16px
    @media screen and (max-width 550px)
      font-size 12px
section
  margin-bottom 15px
  text-align left
  padding-bottom 5px
  p
    margin-bottom 0
  li
    margin 5px 0
.detailed__button {
  background-color: #B4E873;
  padding: 5px;
  border: 0;
  font-size: 20px;
  cursor: pointer;
}
.detailed__button:hover {
  color: white;
}
.detailed__author-link{
  color: #0CA0DF;
}
.detailed__line {
  display: flex;
  justify-content: space-between;
}
.detailed__col{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
}
.detailed__logo{
  //box-shadow 0 0 4px 2px #ddd
  text-align center
  width 150px
  height 65px
  // background-size 100% 100%
  // background-color coral
  line-height 50px
  background-size contain
  background-repeat no-repeat
  background-position center
}
.detailed__header
  color var(--btn-color)
  margin 10px 0px
  margin-bottom 5px
  font-size 20px
.subitem
  //padding-left 20px
  padding-bottom 5px
  padding-top 5px
  font-size 16px
  @media screen and (max-width 550px)
    font-size 12px
.padleft
  padding-left 10px
.descriptionHTML
  font-size 14px
  line-height 1.1
  word-wrap break-word
  max-width 100%
  white-space pre-wrap
.ql-size-small
  font-size 12px
.ql-size-large
  font-size 20px
.salary-deriv::first-letter
  text-transform uppercase
</style>
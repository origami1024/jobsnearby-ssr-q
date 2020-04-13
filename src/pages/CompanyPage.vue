<template>
  <div class="jobpage">
    <main class="detailed__main">
      <section class="detailed__line" style="marginBottom: 5px">
        <div class="detailed__col">
          <h1 class="titleHeader">{{cdata.company}}</h1>
          <div style="width: 100%">
            <p>
              {{cdata.website}}
            </p>
          </div>
        </div>
        <div class="detailed__logo" :style="{'background-image': 'url(' + cdata.logo_url + ')'}" >{{cdata.logo_url == '' || !cdata.logo_url ? 'logo placeholder' : ''}}</div>
      </section>
      <section v-if="cdata.domains.length > 0">
        <h4 class="detailed__header">{{$t('companyPage.categoriesHeader')}}</h4>
        <div class="subitem"  v-if="cdata.domains[0]">
          
            {{cdata.domains[0]}}
          
        </div>
        <div class="subitem"  v-if="cdata.domains[1]">
          
            {{cdata.domains[1]}}
          
        </div>
        <div class="subitem"  v-if="cdata.domains[2]">
          {{cdata.domains[2]}}
        </div>
      </section>
      <section v-if="cdata.full_description.length > 0">
        <h4 class="detailed__header">{{$t('companyPage.descHeader')}}</h4>
        <div class="subitem" >
          <div class="descriptionHTML">
            {{cdata.full_description}}
          </div>
        </div>
      </section>
      <section style="display: flex; justifyContent: space-between">
        <p>{{$t('companyPage.publishedJobsCountLabel')}}{{cdata.jobs_count > 0 ? cdata.jobs_count : 1}}</p>
        <p>{{$t('companyPage.registrationDate')}}{{timeCreated}}</p>
      </section>
    </main>
  </div>
</template>

<script>

export default {
  name: 'companypage',
  data: ()=>{return {
    cdata: {
      company: '',
      logo_url: '',
      domains: [], //3max
      website: '',
      full_description: '',
      time_created: '',
      jobs_count: 0
    }
  }},
  mounted() {
    console.log(this.$route.query.id)
    // this.getCompanyData()
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    console.log('sad', ssrContext.req.companyData)
    if (ssrContext)
      return store.dispatch('setCompanyDetails', ssrContext.req.companyData)
    // else TODO!!!
    //   return store.dispatch('fetchJobDetails', currentRoute.query.id)
  },
  computed: {
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
            console.log('cpJJ2', response.data)
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
  .detailed__main
    width: 80%;
    max-width: 850px;
    background-color: white;
    padding: 0 10px;
    padding-top: 10px;
    box-sizing border-box
    box-shadow 0 0 3px 2px var(--main-borders-color)
    display flex
    flex-direction column
    
    margin 0 auto
    margin-top 15px
    //border 1px solid black
    .titleHeader
      font-size 24px !important
      margin-top 8px
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
    font-size 14px
  .padleft
    padding-left 10px
  .descriptionHTML
    font-size 14px
    line-height 1.1
    word-wrap break-word
    max-width 100%
  .ql-size-small
    font-size 12px
  .ql-size-large
    font-size 20px
  .salary-deriv::first-letter
    text-transform uppercase
</style>
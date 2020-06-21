<template>
  <div class="jobscard" itemscope itemtype="http://schema.org/JobPosting">
    <div class="line cityAndCompany">
      <div class="line" style="align-items: center;">
        <div style="display: flex" itemprop="jobLocation">
          <span v-if="job.city.length > 0" class="cityOK">{{$t('jc.cityPrefix')}}</span>
          <p  itemprop="address" itemscope itemtype="http://schema.org/Place" class="city" v-html="filteredCity"></p>
        </div>
        <a :href="'/companypage?id=' + job.author_id" target="_blank" itemprop="hiringOrganization" itemscope itemtype="http://schema.org/Organization">
          <div itemprop="name" class="author joblink" v-html="filteredAuthor"></div>
        </a>
      </div>
      <div class="line" style="align-items: center; font-weight: 500; font-size: 12px; line-height: 15px; color: var(--color1);">
        <p class="updated__value" v-html="lastUpdated"></p>
      </div>
    </div>
    <meta itemprop="datePosted" :content="this.job.updated">
    <meta itemprop="employmentType" content="full-time">
    <meta itemprop="validThrough" :content="plusOneMonth">
    <div class="line lowres_twolines linetwo">
      <h4 class="cardHeader" itemprop="title">
        <a :href="'/jobpage?id=' + job.job_id" target="_blank">
          <strong class="joblink" v-html="filteredTitle"/>
        </a>
      </h4>
      <div class="colx salary__outer-wrap">
        <div itemprop="baseSalary" style="font-weight: bold;" class="alignRight jobcard__salary">
          <p v-if="job.salary_min === job.salary_max && job.salary_min > 0">{{job.salary_max}}&nbsp;{{currency}}</p>
          <p v-else-if="job.salary_min && job.salary_min > 0">{{job.salary_min}}&nbsp;-&nbsp;{{job.salary_max}}&nbsp;{{currency}}</p>
          <p v-else-if="job.salary_max > 0">{{job.salary_max}}&nbsp;{{currency}}</p>
          <p v-else style="text-align: right; font-size: 15px; font-weight: 400;">{{$t('jc.salaryNone')}}</p>
        </div>
      </div>
    </div>
    <div class="line">
      <p itemprop="description" class="filteredDesc" v-html="
        `${job.experience == -1 ?
            $t('jc.expEmpty')
          :(1 > job.experience) ?
            $t('jc.expNone')
          :(job.experience >= 1 && 3 > job.experience) ?
            $t('jc.exp1_3')
          :(job.experience >= 3 && 5 > job.experience) ?
            $t('jc.exp3_5')
          :job.experience >= 5 ?
            $t('jc.exp5_')
          : ''} ${filteredDesc}`">
      </p>
    </div>
    
    <div class="line">
      <div class="line spbtw" style="width: 100%">
        <a class="showContactsLink noshow-below550" @click.prevent="isContactsShown = !isContactsShown" href="#">
          {{$t('jc.contactsLabel')}}
        </a>
        <a class="showContactsLink show550" @click.prevent="isContactsShown = !isContactsShown" href="#">
          {{$t('jc.contactsLabel_mobile')}}
        </a>
        <a v-if="user.role != 'company' && !cved" class="sendCVLink" @click.prevent="$store.dispatch('hitcv', {job_id: job.job_id, notif: $q.notify, firstNote: $t('App.firstCVNote'), onlyReg: $t('App.onlyRegisteredCV')})" href="#">
          {{$t('jc.sendCVLabel')}}
        </a>
        <div v-else-if="user.role == 'subscriber'" class="cvSentSpan">
          <span class="cvsent_text">{{$t('jc.cvSent')}}</span>
          <q-tooltip v-if="hitcv">
            <p v-if="(hitcv && hitcv.date_created)" style="font-size: 15px; margin: 0">{{$t('jc.tooltipSent')}} {{formatDate(hitcv.date_created)}}</p>
            <p v-if="(hitcv && hitcv.date_checked)" style="font-size: 15px; margin: 0">{{$t('jc.tooltipSeen')}} {{formatDate(hitcv.date_checked)}}</p>
            <p v-else style="font-size: 15px; margin: 0">{{$t('jc.tooltipNotseen')}}</p>
          </q-tooltip>
        </div>
      </div>
    </div>
    <div :class="{heightTransition: isContactsShown}" class="contactsPanel line" style="margin-top: 10px;">
      <div><span style="font-weight: 300;">Email:</span> {{job.contact_mail != '' ? job.contact_mail : $t('jc.notSpecified')}}</div>
      <div><span style="font-weight: 300;">Tel:</span> {{job.contact_tel}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobCard',
  props: {
    hitcv: Object,
    cved: Boolean,
    job: Object,
  },
  data: ()=>{return {
    isContactsShown: false  
  }},
  computed: {
    plusOneMonth() {
      let d = new Date()
      d.setMonth(d.getMonth() + 1)
      return d
    },
    user() {
      return {role: this.$store.state.user.role}
    },
    searchFilter() {
      return this.$store.state.jFilters.txt.toLowerCase()
    },
    lastUpdated() {
      let d = new Date(this.job.updated)
      let today = new Date()
      let msInDay = 24 * 60 * 60 * 1000
      let diff = (today.getTime() - d.getTime())/msInDay | 0
      let result = d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
      if (diff == 0) result = '<span style="color: var(--btn-color); letter-spacing: 1px;">' + this.$t('jc.today') + '</span>'
      else if (diff == 1) result = '<span style="color: var(--btn-color); letter-spacing: 1px;">' + this.$t('jc.yesterday') + '</span>'
      else if (diff < 5) result = `<span class="gray">${diff} ${this.$t('jc.daysAgo')}</span>`
      return result
    },
    currency() {
      return this.$t('App.currencyDic')[this.job.currency]
    },
    filteredTitle: function() {
      if (this.searchFilter.length > 1 && this.job.title.toLowerCase().includes(this.searchFilter)) {
        let i = this.job.title.toLowerCase().indexOf(this.searchFilter)
        return this.job.title.substr(0, i) + 
        '<span class="searched">' + this.job.title.substr(i, this.searchFilter.length) + '</span>' + 
        this.job.title.substr(i + this.searchFilter.length)
      } else return this.job.title
    },
    filteredAuthor: function() {
      if (this.searchFilter.length > 1 && this.job.author.toLowerCase().includes(this.searchFilter)) {
        let i = this.job.author.toLowerCase().indexOf(this.searchFilter)
        return this.job.author.substr(0, i) + 
        '<span class="searched">' + this.job.author.substr(i, this.searchFilter.length) + '</span>' + 
        this.job.author.substr(i + this.searchFilter.length)
      } else return this.job.author
    },
    filteredCity: function() {
      if (this.searchFilter.length > 1 && this.job.city.toLowerCase().includes(this.searchFilter)) {
        let i = this.job.city.toLowerCase().indexOf(this.searchFilter)
        return this.job.city.substr(0, i) + 
        '<span class="searched">' + this.job.city.substr(i, this.searchFilter.length) + '</span>' + 
        this.job.city.substr(i + this.searchFilter.length)
      } else if (this.job.city.length == 0) return this.$t('jc.notSpecified')
      else return this.job.city
    },
    filteredDesc: function() {
      if (this.searchFilter.length > 1 && this.job.description.toLowerCase().includes(this.searchFilter)) {
        let tmpdesc = this.job.description.split('<br>').slice(0,1).join('')
        //console.log(this.job.description)
        tmpdesc = this.strip(tmpdesc)
        let i = tmpdesc.toLowerCase().indexOf(this.searchFilter)
        let res = tmpdesc.substr(0, i) + '<span class="searched">' + tmpdesc.substr(i, this.searchFilter.length) + '</span>' + tmpdesc.substr(i + this.searchFilter.length)
        //console.log(res)
        return res
      } else return this.strip(this.job.description.split('<br>').slice(0,1).join(''))
    },
  },
  methods: {
    formatDate(e) {
      let d = new Date(e)
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    },
    strip(html) {
      return html.replace(/<(?:.|\n)*?>/gm, ' ').replace('  ', ' ');
      // var doc = new DOMParser().parseFromString(html, 'text/html');
      // return doc.body.textContent || "";
    }
  }
}
</script>

<style scoped lang="stylus">
*
  margin 0
  text-align left
  font-family: Montserrat, sans-serif;
.jobscard
  position relative
  box-sizing border-box
  transition-duration 0.1s
  //box-shadow 0 0 2px 1px #dfdfdf
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15)
  border-radius: 10px;
  margin-bottom 18px
  padding 19px 30px
  min-width 551px
  @media screen and (max-width 950px)
    margin-bottom 10px
    padding 10px 12px
  @media screen and (max-width 800px)
    min-width auto
  @media screen and (max-width 550px)
    // padding 6px
    padding 18px 15px 10px 15px
    width 100% //calc(100% - 5px)
    margin-bottom 15px
  &:hover
    box-shadow 0 0 2px 1px var(--violet-btn-color)//#bbb
  a
    text-decoration none
  .cardHeader
    font-weight: bold;
    font-size: 17px;
    line-height: 21px;
    text-transform uppercase
    margin-right 8px
    @media screen and (max-width 550px)
      margin-right 0
  .cityAndCompany
    margin-bottom 15px
    @media screen and (max-width 550px)
      margin-bottom 5px
  .city
    //font-size 0.85em
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color var(--violet-btn-color)
    padding-right: 10px
    border-right: 1px solid var(--color1)
    line-height: 25px
    margin-right: 10px
    @media screen and (max-width 550px)
      // width 50%
      padding-right: 5px
      margin-right: 5px
      font-size: 9px;
      line-height: 20px
  .cityOK
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color var(--violet-btn-color)
    line-height: 25px
    @media screen and (max-width 550px)
      font-size: 9px;
      line-height: 20px
  .author
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    color var(--color1)
    @media screen and (max-width 550px)
      font-size 9px
      line-height 20px
  // .updated__label
  //   margin-right 5px
  //   margin-left auto
  //   @media screen and (max-width 550px)
  //     display none
  .updated__value
    @media screen and (max-width 550px)
      margin-left auto
      font-size 9px
  .salary__outer-wrap
    margin-left 20px
    min-width 100px
    max-width 145px
    @media screen and (max-width 550px)
      margin-left 0
      margin-top 5px
      min-width auto
      max-width 100%
  .cvsent_text
    font-size: 13px;
    color: gray;
    user-select: none
  .line
    display flex
    justify-content space-between
    &:last-child
      margin-bottom 0
  .lowres_twolines
    @media screen and (max-width 550px)
      flex-direction column
  .linetwo
    align-items center
    @media screen and (max-width 550px)
      align-items: flex-start
  .spbtw
    justify-content space-between
  .colx
    display flex
    flex-direction column
  .alignRight
    align-self flex-end

.showContactsLink
  background-image url('~assets/arrow_jc.png')
  background-repeat no-repeat
  background-position right center
  padding-right 15px
  border-bottom 2px solid var(--violet-btn-color)
  font-family: Montserrat, sans-serif;

  font-size: 15px;
  line-height: 18px;
  color var(--color1)
  // display inline-block
  align-self flex-end
  padding-bottom 2px
  @media screen and (max-width: 950px)
    font-size: 14px
    max-width 116px
  @media screen and (max-width: 550px)
    font-size: 12px !important
    line-height: 15px !important
    margin-right auto
    max-width none
    border-bottom 1px solid var(--violet-btn-color)
    align-self center
    // order 2
  &:hover
    color var(--violet-btn-color)
    background-image url('~assets/arrow3.png')
.show550
  display none
  @media screen and (max-width: 550px)
    display inline-block
.sendCVLink
  background-color var(--color-graypink)
  color var(--color1)
  text-decoration none
  border: 2px solid var(--violet-btn-color)
  box-sizing: border-box;
  border-radius: 10px;
  font-family: Montserrat, sans-serif
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  padding 9px 20px
  padding-right 17px
  transition-duration 0.25s
  @media screen and (max-width: 950px)
    padding 5px 10px
    padding-right 8px
    line-height: 26px;
  @media screen and (max-width 550px)
    align-self flex-start
    font-size: 12px !important
    line-height: 15px !important
    padding 8px
  &:hover
    background-color var(--violet-btn-color)
    color white
.contactsPanel
  border 0
  border-radius 10px
  padding 0px
  transition-duration 0.3s
  height 0
  overflow hidden
  color white
.heightTransition
  height auto
  padding 10px
  border: 1px solid var(--violet-btn-color)
  color var(--color1)
  margin 0
  font-family: Montserrat, sans-serif
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
.jobcard__salary p
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 17px !important;
  line-height: 22px;
  color var(--violet-btn-color)
  @media screen and (max-width 550px)
    font-size: 14px;
    line-height: 17px;
.descFormats
  height 21px
  line-height 20px
  font-size 16px
  max-width 100%
  padding 5px
  padding-bottom 0
  margin-right 10px
  word-break break-all
.filteredDesc
  //height 34px
  max-height 34px
  //max-width 383px
  overflow hidden
  word-break break-word
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  line-height: 17px;
  color var(--color1)
  margin-top 12px
  margin-bottom 23px
  @media screen and (max-width: 950px)
    margin-top 5px
    margin-bottom 10px
  @media screen and (max-width 550px)
    font-size: 12px;
    max-height 30px
    line-height: 130%;
    margin-bottom 5px
    margin-top 8px
.joblink
  color var(--color1)
  overflow-wrap: anywhere;
  max-width 130px
  min-width 125px
  &:hover
    color var(--violet-btn-color)
  @media screen and (max-width 550px)
    font-size: 14px;
    line-height 20px
.cvSentSpan
  align-self center
  @media screen and (max-width 550px)
    align-self flex-end
    margin-bottom 10px
</style>

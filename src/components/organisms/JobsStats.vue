<template>
  <div class="jobsstats">
    <div class="jobsstats__display">
      <div class="jobsstats__item" v-for="item in jobslist" :key="item.job_id">
        <div class="left-side">
          <p class="job-title">
            <a class="title-link" target="_blank" :href="'/jobpage?id=' + item.job_id">{{item.title}}</a>
          </p>
          <div>{{$t('jobsStats.views')}} {{Number(item.hits_all)}}</div>
          <div>{{$t('jobsStats.uniqViews')}} {{item.hits_uniq}}</div>
        </div>
        <div class="right-side">
          <div class="jstatus">
            {{
              (item.is_published === true && item.is_closed === false)
                ? $t('jobsStats.published')
                : (item.is_published === true && item.is_closed === true)
                  ? $t('jobsStats.closedByUser')
                  : (item.is_published === false && item.is_closed === false)
                    ? $t('jobsStats.awaitsAdmin')
                    : (item.closed_why !== null && item.closed_why.length > 0)
                      ? $t('jobsStats.closedByAdmin') + ': "' +  item.closed_why + '"'
                      : $t('jobsStats.closedByAdmin')
            }}
          </div>
          <div>
            <q-btn
              v-if="!item.is_closed"
              icon="edit"
              size="sm"
              color="green"
              glossy
              class="controlbtn"
              @click="editJob(item.job_id)"
            >
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('jobsStats.editHint')}}</p>
              </q-tooltip>
            </q-btn>
            <q-btn
              v-else-if="item.is_published == true && item.is_closed == true"
              icon="work"
              size="sm"
              color="blue"
              glossy
              class="controlbtn"
              @click="$store.dispatch('reopenJobById',item.job_id)"
            >
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.reopenHint')}}</p>
              </q-tooltip>
            </q-btn>
            <q-btn
              v-else-if="item.is_published == false && item.is_closed == true"
              icon="build"
              size="sm"
              color="purple"
              glossy
              class="controlbtn"
              @click="$store.dispatch('reopenJobById',item.job_id)"
            >
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.resendHint')}}</p>
              </q-tooltip>
            </q-btn>
            <div style="display: inline;">
              <q-btn
                :disable="item.is_closed"
                icon="work_off"
                size="sm"
                color="orange"
                glossy
                class="controlbtn"
                @click="$store.dispatch('closeJobById',{jid: item.job_id, notifier: $q.notify})"
              >
              </q-btn>
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.closeHint')}}</p>
              </q-tooltip>
            </div>

            <q-btn
              icon="delete_forever"
              size="sm"
              color="red"
              glossy
              class="controlbtn"
              @click="$store.dispatch('deleteJobById',{jid: item.job_id, notifier: $q.notify})"
            >
              <q-tooltip>
                <p style="font-size: 15px; margin: 0">{{$t('jobsStats.deleteHint')}}</p>
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <p v-if="jobslist.length == 0">{{$t('jobsStats.none')}}</p>
  </div>

</template>


<script>
export default {
  name: 'JobsStats',
  computed: {
    jobslist() {
      return this.$store.state.user.ownJobs
    },
  },
  methods: {
    editJob(jid) {
      this.$store.dispatch('setAJNewJobsPageType', 'edit')
      let tmpObj = Object.assign({}, this.jobslist.find(j => j.job_id == jid))
      let jcatOptions = this.$t('App.jcats')

      let jtypeOptions = this.$t('App.jtypeOptions')
      let expOptions = this.$t('App.expOpts')

      let curOpts = this.$t('App.curOpts')
      let searched
      
      searched = jcatOptions.find(c => c.value == tmpObj.jcategory)
      if (!searched) searched = jcatOptions[0]
      tmpObj.jcategory = searched

      searched = curOpts.find(c => c.value == tmpObj.currency)
      if (!searched) searched = curOpts[0]
      tmpObj.currency = searched
      
      searched = expOptions.find(c => c.value == tmpObj.experience)
      if (!searched) searched = expOptions[0]
      tmpObj.experience = searched

      searched = jtypeOptions.find(c => c.value == tmpObj.jtype)
      if (!searched) searched = jtypeOptions[0]
      tmpObj.jtype = searched

      if (tmpObj.contact_mail == null) tmpObj.contact_mail = ''
      if (tmpObj.contact_tel == null) tmpObj.contact_tel = ''

      this.$store.dispatch('setAJEditedObj', tmpObj)
      this.$router.push('/addJob')
    },
  },
}
</script>


<style scoped lang="stylus">
*
  margin 0
.jobsstats
  box-sizing border-box
  width 100%
  font-size 16px
  line-height: 22px;
  color var(--color1)
  @media screen and (max-width: 550px)
    font-size 14px
    line-height: 20px;
  &__display
    display flex
    flex-direction column
  &__item
    background: #FFFFFF;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    margin-bottom 10px
    display flex
    justify-content space-between
    padding 10px 14px
    @media screen and (max-width: 550px)
      margin-bottom 5px
  .jobstat
    &:hover
      transition-duration 0.3s
      background-color #359DFD
      color white
      .link1
        color white
  
.left-side
  text-align left
  max-width calc(70% - 3px)
  width calc(70% - 3px)
  @media screen and (max-width 550px)
    max-width calc(50% - 3px)
    width calc(50% - 3px)
.right-side
  text-align right
  display flex
  flex-direction column
  justify-content space-between
  max-width calc(30% - 3px)
  width calc(30% - 3px)
  @media screen and (max-width 550px)
    max-width calc(50% - 3px)
    width calc(50% - 3px)

.controlbtn
  margin-left 8px
  @media screen and (max-width 550px)
    max-width 30px

.job-title
  //
.title-link
  text-decoration none
  color var(--color1)//#248CEC
  transition-duration 0.3s
  font-weight: bold;
  font-size: 16px;
  line-height: 18px;
  &:hover
    color var(--violet-btn-color)
  @media screen and (max-width 550px)
    font-size: 12px;
    line-height: 15px;

.jstatus
  color var(--violet-btn-color)
  line-height 16px

</style>

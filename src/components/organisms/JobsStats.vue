<template>
  <div class="jobsstats">
    <div>
      <table>
        <thead>
          <tr>
            <td style="width: 22%; min-width: 22%; max-width: 22%; text-align: left">{{$t('jobsStats.title')}}</td>
            <td style="width: 6%; min-width: 6%; max-width: 6%;">{{$t('jobsStats.views')}}</td>
            <td style="width: 6%; min-width: 6%; max-width: 6%;">{{$t('jobsStats.uniqViews')}}</td>
            <!-- <td style="width: 15%; min-width: 15%; max-width: 15%;">Подали резюме</td> -->
            <td style="width: 42%; min-width: 42%; max-width: 42%;">
              {{$t('jobsStats.status')}}
            </td>
            <!-- <td style="width: 33%; min-width: 33%; max-width: 33%;">{{$t('jobsStats.status')}}</td> -->
            <td style="width: 8%; min-width: 8%; max-width: 8%;">{{$t('jobsStats.change')}}</td>
            <td style="width: 8%; min-width: 8%; max-width: 8%;">{{$t('jobsStats.close')}}</td>
            <td style="width: 8%; min-width: 8%; max-width: 8%;">{{$t('jobsStats.delete')}}</td>
          </tr>
        </thead>
        <tr class="jobstat" v-for="item in jobslist" :key="item.job_id">
          <td style="text-align: left"><a class="link1" target="_blank" :href="'/jobpage?id=' + item.job_id">{{item.title}}</a></td>
          <td>{{Number(item.hits_all)}}</td>
          <td>{{item.hits_uniq}}</td>          
          <td style="font-size:15px">
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
          </td>
          <td>
            <q-btn
              v-if="!item.is_closed"
              icon="edit"
              size="sm"
              color="green"
              glossy
              @click="editJob(item.job_id)"
            >
            <!-- $emit('editJob', item.job_id) -->
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.editHint')}}</p>
              </q-tooltip>
            </q-btn>
            <q-btn
              v-else-if="item.is_published == true && item.is_closed == true"
              icon="work"
              size="sm"
              color="blue"
              glossy
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
              @click="$store.dispatch('reopenJobById',item.job_id)"
            >
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.resendHint')}}</p>
              </q-tooltip>
            </q-btn>
          </td>
          <td>
            <q-btn
              v-if="!item.is_closed"
              icon="work_off"
              size="sm"
              color="orange"
              glossy
              @click="$store.dispatch('closeJobById',{jid: item.job_id, notifier: $q.notify})"
            >
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.closeHint')}}</p>
              </q-tooltip>
            </q-btn>
            <span v-else>
              {{$t('jobsStats.closed')}}
            </span>
          </td>
          <td>
            <q-btn
              icon="delete_forever"
              size="sm"
              color="red"
              glossy
              @click="$store.dispatch('deleteJobById',{jid: item.job_id, notifier: $q.notify})"
            >
              <q-tooltip>
                <p style="font-size: 15px;margin: 0">{{$t('jobsStats.deleteHint')}}</p>
              </q-tooltip>
            </q-btn>
          </td>
        </tr>
      </table>
      <p v-if="jobslist.length == 0">{{$t('jobsStats.none')}}</p>
    </div>
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
    editJob(jid) {//Ok
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
  min-width 300px
  table
    border-spacing 0
  thead td
    border-bottom 15px solid transparent
    font-size 14px
  td
    padding 3px
    // font-size 12px
    max-width 85px
    font-size 16px
    line-height 20px
  .line
    display flex
    align-items center
    border 1px solid gray
    padding 5px
  .rowed
    display flex
    box-sizing border-box
    max-width 100vw
    overflow-x: scroll;
  .jobstat
    &:hover
      transition-duration 0.3s
      background-color #359DFD
      color white
      .link1
        color white
  .link1
    text-decoration none
    color #248CEC
    transition-duration 0.6s
    font-weight 500
</style>

<template>
  <div class="hitslist">
    <div>
      <!-- {{cvhitsHistory}} -->
      
      <table style="box-sizing: border-box; width:100%;">
        <thead>
          <tr>
            <td style="width: 30%; min-width: 30%; max-width: 30%; text-align: left">{{$t('hits.job')}}</td>
            <td style="width: 25%; min-width: 25%; max-width: 25%;">{{$t('hits.company')}}</td>
            <td style="width: 15%; min-width: 15%; max-width: 15%;">{{$t('hits.remarks')}}</td>
            <td class="noshow-below550" style="width: 15%; min-width: 15%; max-width: 15%;">{{$t('hits.sent')}}</td>
            <td class="noshow-below550" style="width: 15%; min-width: 15%; max-width: 15%;">{{$t('hits.seen')}}</td>
          </tr>
        </thead>
        <tr class="jobstat" v-for="item in cvhitsHistory" :key="item.cvjob_id">
          <td style="text-align: left">
            <a class="link1" target="_blank" :href="'/jobpage?id=' + item.cvjob_id">
              {{item.title}}
            </a>
          </td>
          <td>
            {{item.company}}
          </td>
          <td>
            <span v-if="item.is_closed">
              {{$t('hits.closed')}}
            </span>
          </td>
          <td class="noshow-below550">
            {{formatDate(item.date_created)}}
          </td>
          <td class="noshow-below550">
            <span v-if="item.date_checked != null">
              {{formatDate(item.date_checked)}}
            <span style="color: mediumseagreen; font-weight: bold; font-size: 16px; line-height: 10px;">✓</span>
            </span>
            <span v-else>
              {{$t('hits.no')}}
            </span>
          </td>
        </tr>
      </table>
      <p v-if="cvhitsHistory.length == 0">{{$t('hits.none')}}</p>
    </div>
  </div>
</template>

<script>
//import JobCard from './../molecules/JobCard'

export default {
  name: 'HitsList',
  props: {
    // jobslist: {type: Array, default: ()=>[]},
    // ownCVs: {type: Array, default: ()=>[]},
    cvhitsHistory: {type: Array, default: ()=>[]},
  },
  data: ()=>{return {
  }},
  computed: {
  },
  methods: {
    formatDate(e) {
      let d = new Date(e)
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
    },
  },
  components: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
*
  margin 0
.hitslist
  padding-top 15px
  box-sizing border-box
  width 100%
  // min-width 300px
  table
    border-spacing 0
    thead
      td
        border-bottom 3px solid transparent
        font-weight 700
    td
      padding 3px
      max-width 85px
      font-size 14px
      @media screen and (max-width 550px)
        font-size 11px
        padding 0
  .line
    display flex
    align-items center
    border 1px solid gray
    padding 5px
  .jobstat
    &:hover
      transition-duration 0.3s
      background-color var(--main-borders-color)//#359DFD
      color white
      .link1
        color white
  .link1
    text-decoration none
    color var(--violet-btn-color)//#248CEC
    transition-duration 0.3s
</style>

<template>
  <div>
    <JobCard
      :cved="ownCVj_ids.includes(item.job_id)"
      :hitcv="ownCVs.find(v=>v.cvjob_id == item.job_id)"
      :job="item" 
      v-for="item in jobslist"
      :key="item.job_id">
    </JobCard>
    <p v-if="jobslist.length == 0 && $store.state.jFilters.txt == ''">{{$t('jobsList.zero')}}</p>
    <p v-else-if="jobslist.length == 0 && $store.state.jFilters.txt != ''">{{$t('jobsList.zerozero1')}} "{{$store.state.jFilters.txt}}" {{$t('jobsList.zerozero2')}}</p>
  </div>
</template>

<script>
import JobCard from './../molecules/JobCard'

export default {
  name: 'JobsList',
  computed: {
    jobslist() {
      return this.$store.state.jobslist
    },
    ownCVs() {
      return this.$store.state.user.ownCVs
    },
    ownCVj_ids() {
      return this.$store.getters.ownCVj_ids
    }
  },
  components: {
    JobCard
  }
}
</script>


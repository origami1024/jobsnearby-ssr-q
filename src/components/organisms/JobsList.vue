<template>
  <div class="jobslist">
    <JobCard
      :cved="ownCVs.map(v=>v.cvjob_id).includes(item.job_id)"
      :hitcv="ownCVs.find(v=>v.cvjob_id == item.job_id)"
      :role="role" @hitcv="hitcv" :lenses="lenses"
      :searchFilter="searchFilter" :job="item" 
      v-for="item in jobslist"
      :key="item.job_id">
    </JobCard>
    <p v-if="jobslist.length == 0 && searchFilter == ''">{{$t('jobsList.zero')}}</p>
    <p v-else-if="jobslist.length == 0 && searchFilter != ''">{{$t('jobsList.zerozero1')}} "{{searchFilter}}" {{$t('jobsList.zerozero2')}}</p>
  </div>
</template>

<script>
import JobCard from './../molecules/JobCard'

export default {
  name: 'JobsList',
  props: {
    ownCVs: {type: Array, default: ()=>[]},
    lenses: String,
    role: String,
    // jobslist: {type: Array, default: ()=>[]},
    sort: String,
    // langsFilter: {type: Array, default: ()=>[]},
    searchFilter: {type: String, default: ''}
  },
  data: ()=>{return {
  }},
  computed: {
    jobslist() {
      return this.$store.state.jobslist
    },
    jobslistFiltered: function() {
      //salary filter
      let filtered = this.jobslist.map(job=>{
        !job.city ? job.city='': null
        !job.description ? job.description='': null
        return job
      })
      
      let sorted
      if (this.sort == 'salary') {
        sorted = filtered.sort((a,b)=>Number(a.salary) < Number(b.salary) ? 1 : -1)
      } else sorted = filtered
      return sorted
    }
  },
  methods: {
    hitcv(id) {
      this.$emit('hitcv', id)
    }
  },
  components: {
    JobCard
  }
}
</script>


<template>
    <div v-if="loading" class="cv-list" style="margin-top: 140px;">
        <div  class="lds-dual-ring"/>
    </div>
    <div class="cv-detail" v-else-if="$store.state.user.role === 'company' && $store.state.user.rights && $store.state.user.rights.includes('bauss')">
        
        <p class="pageHeader">{{$t('cvList.cvListLabel')}}</p>
        
        <div>
            <pre>{{ cv }}</pre>
            <q-btn
                class="headerBtns1 headerBtnRed addJobMargin550 addJobSpecific"
                style="margin-right: 20px;"
                text-color="white" 
                :label="$t('cvDetail.goBack')"
                to="/cv-list"
            />
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
                    this.cv = resp.data
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
</style>
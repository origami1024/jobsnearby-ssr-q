<template>
    <div class="cv-list" v-if="$store.state.user.role === 'company'">
        <!-- TODO: serverside check role before sending?? -->
        <p class="pageHeader">{{$t('cvList.cvListLabel')}}</p>
        <div>
            search-bar
        </div>
        <div>
            1
            2
            3
            4
            5
        </div>
        <div>pagination</div>
        <!-- <div class="cvpage__wrapper" :key="1" style="display: flex; flex-direction: column; align-items: center">
            xxxxx
        </div> -->
    </div>
    <p class="pageHeader" style="margin: 40px auto;" v-else>404. Not found</p>
</template>
<script>
export default {

}
</script>


<style lang="stylus" scoped>
.cv-list
  // max-width 80%
  width 754px
  margin-bottom 70px !important
  @media screen and (max-width 550px)
    width 100%
    padding 0 20px
//   .cvpage__wrapper
//     // margin-top 15px
//     max-width 754px
//     width 754px
//     background var(--menubg-color)
//     border: 0.5px solid #C2C2C6
//     box-sizing: border-box
//     border-radius: 10px;
//     box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
//     padding 10px
//     padding-top 45px
//     padding-bottom 35px
//     margin-bottom 20px
//     @media screen and (max-width 550px)
//       width 100%
//       max-width none
//       padding 26px 34px
</style>
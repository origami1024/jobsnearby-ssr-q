<template>
  <div class="jobs__right-aside">
    <div class="right-aside__salaries-stat statbox">
      <h3
        class="aside-h3" style="margin-left: 7px;"
      >Зарплаты</h3>
      <div class="wrapline">
        <div class="wrapcol0">
          <svg width="8" height="201" viewBox="0 0 8 201" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.59815 0.633789C4.40289 0.438522 4.08631 0.438522 3.89105 0.633789L0.709064 3.81577C0.513802 4.01103 0.513802 4.32761 0.709064 4.52287C0.904327 4.71812 1.22091 4.71812 1.41617 4.52287L4.2446 1.69444L7.07303 4.52287C7.26829 4.71812 7.58487 4.71812 7.78013 4.52287C7.97539 4.32761 7.97539 4.01103 7.78013 3.81577L4.59815 0.633789ZM4.7446 200.003L4.7446 0.987335H3.7446L3.7446 200.003H4.7446Z" fill="#181059"/>
          </svg>
        </div>
        <div class="wrapcol">
          <div class="sal">{{salData.salMin}}</div>
          <div class="boxMin"></div>
        </div>
        <div class="wrapcol">
          <div class="sal">{{salData.salAvg}}</div>
          <div class="boxAvg"></div>
        </div>
        <div class="wrapcol">
          <div class="sal">{{salData.salMax}}</div>
          <div class="boxMax"></div>
        </div>
      </div>
      <div class="wrapline2">
        <svg width="170" height="9" viewBox="0 0 170 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M169.425 4.85377C169.621 4.6585 169.621 4.34192 169.425 4.14666L166.243 0.96468C166.048 0.769418 165.732 0.769418 165.536 0.96468C165.341 1.15994 165.341 1.47652 165.536 1.67179L168.365 4.50021L165.536 7.32864C165.341 7.5239 165.341 7.84049 165.536 8.03575C165.732 8.23101 166.048 8.23101 166.243 8.03575L169.425 4.85377ZM0.997864 5.00021H169.072V4.00021H0.997864V5.00021Z" fill="#181059"/>
        </svg>
      </div>
    </div>
    <div class="right-aside__professions-stat statbox">
      <h3
        class="aside-h3"
      >Топ профессий</h3>
      <div class="professions-list">
        <div class="professions-row" v-for="(top,i) in salData.tops" :key="i">
          <div><a class="professions-link" :href="'/jobpage?id=' + top[2]" target='_blank'>{{top[0]}}</a></div>
          <div>{{top[1]}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'UserStats',
  computed: {
    salData() {
      return this.$store.state.uStats
    },
  },
  methods: {
  },
}
</script>


<style scoped lang="stylus">
.jobs__right-aside
  @media screen and (max-width 800px)
    display none
  .aside-h3
    font-family "Montserrat", sans-serif
    font-weight bold
    font-size 16px !important
    line-height 20px !important
    color var(--color1)
    text-transform uppercase
    width 130px
    margin-bottom 22px
    @media screen and (max-width 1160px)
      margin-bottom 12px
  .professions-list
    width 172px
    @media screen and (max-width: 1160px)
      width 152px
  .professions-row
    display flex
    //justify-content space-between
    margin-bottom 11px
    align-items flex-end
    @media screen and (max-width: 1160px)
      margin-bottom 7px
    div
      font-family "Montserrat", sans-serif !important
      font-size 12px !important
      line-height 15px !important
    div:nth-of-type(1)
      width 68%
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    div:nth-of-type(2)
      width 25%
      margin-left 6%
  .professions-link
    text-decoration none
    color var(--color1)
    font-family "Montserrat", sans-serif !important
    font-size 12px !important
    line-height 15px !important
    &:visited
      color var(--color1)
    &:hover
      color var(--violet-btn-color)

.statbox
  background white
  box-shadow 0px 5px 15px rgba(0, 0, 0, 0.15)
  border-radius 10px
  padding 28px 30px 39px 30px
  width 234px
  box-sizing border-box
  text-align left
  margin-bottom 18px
  @media screen and (max-width: 1160px)
    padding 18px 20px 19px 15px
    width 190px
    margin-bottom 10px
.wrapline
  display flex
  width 155px
  height 100%
  padding-left 6px
  @media screen and (max-width: 1160px)
    width 140px
.wrapline2
  padding 0
  margin 0
  margin-top -10px
  padding-left 9px
  width 170px
  @media screen and (max-width: 1160px)
    width 145px
    svg
      width 145px
.wrapcol
  width 100%
  display flex
  flex-direction column
  justify-content flex-end
  min-height 100%
  padding 0 2.5px
  margin-bottom 4px
  flex-grow 1
  @media screen and (max-width: 1160px)
    padding 0 2px
 .boxMin
   height 51%
   background-color rgba(134, 69, 255, 0.3)
 .boxAvg
   height 67%
   background-color rgba(24, 16, 89, 0.5);
 .boxMax
   height 90%
   background-color #4CBDF5;
 .sal
   text-align center
   font-family: Montserrat;
   font-style: normal;
   font-weight: bold;
   font-size: 10px;
   line-height: 12px;
   color: #181059;
   margin-bottom 11px;
   @media screen and (max-width: 1160px)
    margin-bottom 7px
</style>

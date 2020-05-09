<template>
  <div class="profilenav-wrap" style="min-width: 270px;">
    <q-list padding class="profilenav rounded-borders text-primary">
      <q-item
        v-for="(lr, index) in localroutes"
        :key="index"
        clickable
        :active="localRoute === lr.r"
        @click="$emit('setLocalRoute', lr.r)"
        class="nav__link"
        active-class="nav__link-active"
      >
        <q-item-section style="position:relative;flex-direction: row; align-items: center;">
          <span v-if="lr.badges > 0" style="margin-left: auto;margin-right: 10px;">{{lr.l}}</span>
          <span v-else style="margin-right: 10px; display: inline !important;">{{lr.l}}</span>
          <q-badge v-if="lr.badges > 0" class="badge1" :label="lr.badges"/>
        </q-item-section>
      </q-item>
      <!-- <q-separator spaced /> -->
      <q-item
        clickable
        :active="localRoute == localroutesX.r"
        @click="$emit('setLocalRoute', localroutesX.r)"
        class="nav__link"
        active-class="nav__link-active"
      >
        <q-item-section>{{localroutesX.l}}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>

export default {
  name: 'ProfileNav',
  props: {
    localRoute: String,
    localroutes: Array,
    localroutesX: Object
  }
}
</script>
<style lang="stylus">
.nav__link.q-item
  @media screen and (max-width 550px)
    height 36px
    min-height 36px
</style>
<style scoped lang="stylus">
.profilenav-wrap
  padding-right 16px
  @media screen and (max-width 550px)
    padding 0
.profilenav
  // box-shadow 0 0 3px 0px var(--main-borders-color)
  @media screen and (max-width 550px)
    display flex
    flex-wrap wrap
    justify-content space-between
.badge1
  background-color var(--btn-color)
  border-radius 100%
  width 28px
  height 28px
  margin-right auto
  text-align center
  justify-content center
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2)
  font-family: Montserrat;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  
  // position absolute
  // right 34px
  @media screen and (max-width 550px)
    // right 20px
    height 22px
    width 22px
.nav__link
  //color var(--color1) !important
  background-color var(--menubg-color)
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
  border-radius 10px
  margin-bottom 15px
  font-family: Montserrat, sans-serif
  font-size: 16px;
  line-height: 20px;
  color var(--color1)
  border: 0.5px solid rgba(0, 0, 0, 0.2);
  padding 0
  @media screen and (max-width 550px)
    width calc(50% - 6px)
    font-size: 12px;
    line-height: 15px;
    height 35px
    margin-bottom 10px
.nav__link-active
  color white
  //color var(--color1) !important
  // background #248CEC
  background-color var(--color1)
</style>

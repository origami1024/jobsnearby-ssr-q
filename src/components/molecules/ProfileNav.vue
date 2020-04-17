<template>
  <div class="q-pr-md" style="min-width: 270px;">
    <q-list bordered padding class="profilenav rounded-borders text-primary">
      <q-item
        v-for="(lr, index) in localroutes"
        :key="index"
        clickable
        :active="localRoute === lr.r"
        @click="$emit('setLocalRoute', lr.r)"
        class="nav__link"
        active-class="nav__link-active"
      >
        <q-item-section style="position:relative">
          {{lr.l}}
          <q-badge v-if="lr.badges > 0" style="background-color: var(--btn-color);" floating :label="lr.badges + ' новых'"/>
        </q-item-section>
      </q-item>
      <q-separator spaced />
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

<style scoped lang="stylus">
.profilenav
  box-shadow 0 0 3px 0px var(--main-borders-color)
.nav__link
  //color var(--color1) !important
.nav__link-active
  color white
  //color var(--color1) !important
  background #248CEC
</style>

<template>
  <router-link
    @click.native="$store.dispatch('refreshjobs', {param: 'logoclick'}); $store.dispatch('filtersOff')"
    to="/"
    class="logolink"
  >
    <span class="logoText">
      HUNAR<span style="color: #8645FF; margin-right: -7px">MEN</span>
    </span>
    <q-tooltip
      transition-show="rotate"
      transition-hide="rotate"
    >
      <p style="font-size: 14px; margin: 0">{{$t('App.logoTooltip')}}</p>
    </q-tooltip>
  </router-link>
</template>

<script>
export default {
  name: 'Logo'
}
</script>

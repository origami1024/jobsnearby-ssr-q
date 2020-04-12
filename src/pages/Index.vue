<template>
  <div class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-full.svg"
    >
    <span>{{bigdic}}</span>
    
    <router-link to="/test1">test1</router-link>
    <router-link to="/">MAIN PAGE</router-link>
  </div>
</template>

<script>
export default {
  name: 'PageIndex',
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    // fetch data, validate route and optionally redirect to some other route...

    // ssrContext is available only server-side in SSR mode

    // No access to "this" here as preFetch() is called before
    // the component gets instantiated.

    // Return a Promise if you are running an async job
    // Example:
    if (ssrContext) {
      console.log(Object.keys(ssrContext.req))
      console.log(ssrContext.req.dingsu)
    } else console.log('NO CONTEXT')
    // return store.dispatch('fetchItem', currentRoute.params.id)
  },
  data: ()=>{return {
    bigdic: 'trolingston'
  }},
  computed: {
    // display the item from store state.
    item () {
      return this.$store.state.items[this.$route.params.id]
    }
  }
}
</script>

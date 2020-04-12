<template>
  <div class="flex flex-center">
    TEST1 THIS IS 111
    {{bigdic}}
    <router-link to="/test1">test1</router-link>
    <router-link to="/">MAIN PAGE</router-link>
  </div>
</template>

<script>
export default {
  name: 'test1',
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext }) {
    // fetch data, validate route and optionally redirect to some other route...

    // ssrContext is available only server-side in SSR mode

    // No access to "this" here as preFetch() is called before
    // the component gets instantiated.

    // Return a Promise if you are running an async job
    // Example:
    // return store.dispatch('fetchItem', currentRoute.params.id)
    if (ssrContext) {
      console.log(Object.keys(ssrContext.req))
      console.log(ssrContext.req.dingsu)
    } else console.log('NO CONTEXT')
    
    return {bigdic: 'NOES'}
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

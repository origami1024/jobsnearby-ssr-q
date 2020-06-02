import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'ru',
  fallbackLocale: 'tm',
  messages
})

export default ({ app, ssrContext }) => {
  // Set i18n instance on app
  //set lang from cookies for ssr if they are present
  if (ssrContext && ssrContext.req && ssrContext.req.cookies && ssrContext.req.cookies.lang) {
    i18n.locale = ssrContext.req.cookies.lang
  }
  app.i18n = i18n
  
}


export { i18n }
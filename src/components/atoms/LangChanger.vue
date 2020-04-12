<template>
  <button class="lang-link">{{$i18n.locale.toUpperCase()}}
    <q-menu dense>
      <q-item class="lang-item" dense :class="{picked: $i18n.locale == 'tm'}" clickable v-close-popup @click="setLang('tm')">
        TM
      </q-item>
      <q-item class="lang-item" dense :class="{picked: $i18n.locale == 'ru'}" clickable v-close-popup @click="setLang('ru')">
        RU
      </q-item>
    </q-menu>
  </button>
</template>

<script>
export default {
  name: 'LangChanger',
  methods: {
    setLang(lang) {
      this.$i18n.locale = lang
      window.localStorage.setItem('lang', lang)
    },
  }
}
</script>

<style lang="stylus" scoped>
.lang-link
  border 0
  background-color transparent
  background-image url('~assets/arrow1.png')
  background-repeat no-repeat
  background-position right center
  padding-right 18px
  color var(--color1)
  cursor pointer
  font-family: Montserrat, sans-serif;
  font-size 14px
  line-height 17px
  margin-left 30px
  &:focus
    outline-color var(--violet-btn-color)
  @media screen and (max-width 800px)
    margin-left 20px
.lang-item
  line-height 2.2
  color var(--color1)
.picked
  color var(--violet-btn-color)
  font-weight 700
</style>
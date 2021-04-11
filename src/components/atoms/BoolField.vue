<template>
  <div class="w586">
    <p class="startP"
      style="font-weight: 600;"
      :style="noStarPMarginTop ? 'margin-bottom: 20px' : 'margin: 20px 0 20px'"
    >{{label}}</p>
    <label
      style="display: flex; align-items: center; margin: 12px 0;
        cursor: pointer; color: var(--color1); font-size: 14px;
        user-select: none; font-weight: 500; text-align: left;"
      v-for="lidx in vals.length" :key="lidx"
    >
      <q-radio
        :value="value"
        :val="vals[lidx - 1]"
        color="red-10"
        dense
        style="margin-right: 10px;"
        @input="$emit('input', $event)"
      />
      {{ labels[lidx - 1] }}
    </label>
  </div>
</template>

<script>
export default {
  props: {
    vals: {
      type: Array,
      default: () => [true, false]
    },
    labels: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    noStarPMarginTop: {
      type: Boolean,
      default: false
    },
    // reqd: {
    //   type: Boolean,
    //   default: false
    // },
    value: {
      type: [Boolean, String],
      default: null
    },
    // extended: {
    //   type: Boolean,
    //   default: false
    // }
    // ph: {
    //   type: String,
    //   default: ''
    // },
    // rules: {
    //   type: Array,
    //   default: () => []
    // },
    // lazy: {
    //   type: Boolean,
    //   default: false
    // }
  }
}
</script>

<style lang="stylus" scoped>
*
  margin 0
.w586
  width 586px
  @media screen and (max-width 550px)
    width 100%
.startP
  font-family: Montserrat;
  font-size: 14px;
  font-weight 500
  line-height: 17px;
  color var(--color1)
  position relative
  text-align left
.star
  margin-right 4px
  font-family: Montserrat, sans-serif
  font-size: 14px;
  line-height: 17px;
  color var(--btn-color)
  width 6px
.reqd:before
  content '*'
  font-family Montserrat, sans-serif
  font-size 14px
  line-height 17px
  left -10px
  position absolute
  width 6px
  color var(--btn-color)
</style>

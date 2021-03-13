<template>
  <div class="w586">
    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
      <!-- <p v-if="required" class="star">*</p> //this is inline -->
      <p class="startP" :class="{ reqd }">{{label}}</p>
    </div>
    <q-input
      dense
      outlined
      bg-color="white" color="deep-purple-10"
      :style="{width: '100%'}"
      :hint="null"
      :value="value"
      @input="$emit('input', $event)"
      :placeholder="ph"
      :rules="rules"
      :lazy-rules="lazy"
      ref="qinput"
      :counter="maxlength !== Infinity && !maxlhidden"
      :maxlength="maxlength"
    />
  </div>
</template>

<script>
export default {
  props: {
    maxlhidden: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: Infinity
    },
    label: {
      type: String,
      default: ''
    },
    reqd: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    ph: {
      type: String,
      default: ''
    },
    rules: {
      type: Array,
      default: () => []
    },
    lazy: {
      type: Boolean,
      default: false
    }
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

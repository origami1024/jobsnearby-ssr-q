<template>
  <div class="w586">
    <div class="addJoblabel" style="display: flex; margin-bottom:8px;">
      <!-- <p v-if="required" class="star">*</p> //this is inline -->
      <p class="startP">{{label}}</p>
    </div>
    <div class="select-field">
      <div class="selected" @click="i_focus = !i_focus; moved = false" @focusout="focout" tabindex="1">
        <div v-if="picked.value == emptyTemplate" class="ph">{{ph}}</div>
        <div v-else>{{picked.label}}</div>
      </div>
      <ul class="dd" v-if="i_focus" @mousemove="moved = true">
        <li :class="val == picked && moved == false ? 'highlighted' : ''" @click="selectit(val)" v-for="val in values" :key="val.value">{{val.label}}</li>
      </ul>
    </div>
  </div>
</template>

<script>


export default {
  props: {
    values: Array,
    ph: String,
    emptyTemplate: {type: String, default: 'idc'},
    picked: Object,
    label: String
  },
  data: ()=>{return {
    //picked: {label: 'Не имеет значения', value: 0},
    i_focus: false,
    moved: false
  }},
  methods: {
    pressEnter(e) {
      if (e.keyCode === 13) {
        //window.console.log('13')
        this.$refs.mainInput.blur()
        this.i_focus = false
      }
    },
    focout() {
      setTimeout(x=>{this.i_focus = false},250)
    },
    selectit(item) {
      this.i_focus = false
      //this.picked = item
      //window.console.log(item)
      this.$emit('update:value', item)
    }
  },
  // watch: {
  //   picked(new1) {
  //     this.$emit('update:value', new1)
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
*
  margin 0
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
.select-field
  position relative
  .selected
    color black
    background-color white
    width 100%
    border-radius 10px
    border 0
    height 36px
    box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
    padding 0 12px
    line-height: 36px;
    appearance: none;
    background-image url('~assets/arrow2.png')
    background-repeat no-repeat
    background-position right 11px center
    cursor pointer
    border: 2px solid transparent
    transition-duration .3s
    &:focus
      outline none !important
      // box-shadow 0px 0px 5px var(--violet-btn-color) !important
      border: 2px solid var(--main-borders-color);
    div
      text-align left
      font-size 16px
      line-height: 32px;
      text-overflow ellipsis
      white-space: nowrap;
      overflow hidden

.dd
  margin-top 1px
  border-radius 10px
  position absolute
  background-color white
  color black
  z-index 1
  list-style none
  padding 0
  width 100%
  cursor pointer
  font-family: Montserrat, sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 30px;
  user-select: none;
  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);
  // @media screen and (max-width 1160px)
  //   width 194px
  li
    padding 2px 9px
    border-radius 10px
    font-size 14px
    &:hover
      background-color var(--violet-btn-color)
      color white
.ph
  font-size 16px
  line-height: 32px;
  font-weight 500
  color black
  opacity 0.4
  text-align left
.highlighted
  background-color var(--violet-btn-color)
  color white
</style>

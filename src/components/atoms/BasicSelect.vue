<template>
  <div class="BasicSelect">
    <!-- <input ref="mainInput" @keypress="pressEnter" type="text" v-model="picked" @focusin="i_focus = true" @focusout="focout" :placeholder="ph">
    <ul class="dd" v-if="i_focus">
      <li @click="selectit(city)" v-for="city in cities.slice(1).filter(c=>c.toLowerCase().includes(picked.toLowerCase()))" :key="city">{{city}}</li>
    </ul> -->
    <!-- <select>
      <option v-for="val in values" :key="val.value" :value="val.value">{{val.label}}</option>
    </select> -->
    <div class="selected" @click="i_focus = !i_focus; moved = false" @focusout="focout" tabindex="1">
      <div v-if="picked.value == emptyTemplate" class="ph">{{ph}}</div>
      <div v-else>{{picked.label}}</div>
    </div>
    <ul class="dd" v-if="i_focus" @mousemove="moved = true">
      <li :class="val == picked && moved == false ? 'highlighted' : ''" @click="selectit(val)" v-for="val in values" :key="val.value">{{val.label}}</li>
    </ul>
  </div>
</template>

<script>


export default {
  name: 'BasicSelect',
  props: {
    values: Array,
    ph: String,
    emptyTemplate: {type: String, default: 'idc'},
    picked: Object,
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
.BasicSelect
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
    font-family: Montserrat, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 36px;
    appearance: none;
    background-image url('~assets/arrow2.png')
    background-repeat no-repeat
    background-position right 11px center
    cursor pointer
    &:focus
      outline none !important
      box-shadow 0px 0px 5px var(--violet-btn-color) !important
    div
      font-family: Montserrat, sans-serif;
      font-style: normal;
      font-weight: normal;
      font-size: 12px;
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
  font-weight: normal;
  font-size: 15px;
  line-height: 30px;
  user-select: none;
  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);
  // @media screen and (max-width 1160px)
  //   width 194px
  li
    padding 2px 12px
    border-radius 10px
    &:hover
      background-color var(--violet-btn-color)
      color white
.ph
  font-family: Montserrat, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 36px;
  color black
  opacity 0.3
.highlighted
  background-color var(--violet-btn-color)
  color white
</style>

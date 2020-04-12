<template>
  <div class="DDSelect">
    <input ref="mainInput" @input="$emit('update:city', $event.target.value)" @keypress="pressEnter" type="text" :value="picked" @focusin="i_focus = true" @focusout="focout" :placeholder="ph">
    <button class="DD__reset" v-if="picked != ''" @click="selectit('')">X</button>
    <ul class="dd" v-if="i_focus">
      <li @click="selectit(city)" v-for="city in cities.slice(1).filter(c=>c.toLowerCase().includes(picked.toLowerCase()))" :key="city">{{city}}</li>
    </ul>
  </div>
</template>

<script>


export default {
  name: 'DDSelect',
  props: {
    cities: Array,
    ph: String,
    picked: String
  },
  data: ()=>{return {
    //cities: ['London', 'Moscow', 'Japan'],
    //picked: '',
    i_focus: false,
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
    selectit(city) {
      this.i_focus = false
      //this.picked = city
      //console.log(city)
      this.$emit('update:city', city)
    }
  },
  // watch: {
  //   picked(new1) {
  //     this.$emit('update:city', new1)
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.DDSelect
  position relative
  --height 36px
  input
    width 100%
    border-radius 10px
    border 0
    height var(--height)
    box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
    padding 0 12px
    font-family: Montserrat, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 15px;
    background-image url('~assets/arrow2.png')
    background-repeat no-repeat
    background-position right 11px center
    &:focus
      outline none !important
      box-shadow 0px 0px 5px var(--violet-btn-color) !important
    &::placeholder
      color black
      opacity .3
  .DD__reset
    position absolute
    height 20px
    width 20px
    border-radius 50%
    font-size 12px
    border 0
    color white
    background-color gray//#C00027
    cursor pointer
    top calc((var(--height) / 2) - 10px)
    right 28px
    transition-duration 0.25s
    font-weight bold
    &:focus
      outline none
    &:hover
      background-color black//#D00027
      color #ddd
      
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
  li
    padding 2px 12px
    border-radius 10px
    &:hover
      background-color var(--violet-btn-color)
      color white
.highlighted
  background-color red
</style>

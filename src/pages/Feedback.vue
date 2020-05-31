<template>
  <div class="feedback">
    <div v-if="state == 'ready'" class="fb_inner">
      <!-- <br> -->
      <p class="fb__header">{{$t('fb.header')}}</p>
      <div class="fb__core">
        <label for="fb_topicInp1" class="fb-label">{{$t('fb.topic')}}</label>
        <q-input 
          for="fb_topicInp1"
          v-model="fbData.topic"
          dense
          outlined
          bg-color="white" color="deep-purple-10"
          counter
          maxlength="75"
        />
        <label for="fb_yn1" class="fb-label">{{$t('fb.yourname')}}</label>
        <q-input
          for="fb_yn1"
          dense
          counter
          maxlength="25"    
          bg-color="white" color="deep-purple-10" v-model="fbData.name" outlined
        />
        <label for="fb_mail" class="fb-label">{{$t('fb.hyphenMail')}}</label>
        <q-input
          for="fb_mail"
          dense
          bg-color="white" color="deep-purple-10" v-model="fbData.mail" outlined
          counter
          maxlength="70"
          :rules="[
            val => !!val || $t('fb.mailValReq'),
            val => mailregex.test(val) || $t('fb.mailValFormat')
          ]"
        />        
        <label for="fb_mail" class="fb-label">{{$t('fb.textLabel')}}</label>
        <q-input 
          maxlength="500"
          counter
          dense
          outlined
          bg-color="white" color="deep-purple-10"
          v-model="fbData.body"
          class="fb_textarea"
          type="textarea"
        />
        <q-btn style="margin-top: 15px; min-width: 180px; background-color: var(--violet-btn-color) !important;" class="headerBtns1 headerBtnRed" color="red-10" :label="$t('fb.btnSend')" @click="sendFB" />
        <!-- unelevated -->
      </div>
    </div>
    <div v-else class="fb_inner">
      <p>{{
        state == 'OK'
          ? $t('fb.messageSuccess')
          : $t('fb.messageError')}}</p>
      <div style="width: 100%; margin-bottom: 15px;">
        <q-btn class="headerBtns1 headerBtnRed" style="margin-right: 10px" color="red-10" :label="$t('fb.btnSendMore')" @click="state='ready'" />
        <q-btn class="headerBtns1 headerBtnRed" color="red-10" :label="$t('fb.toMain')" @click="fbDataFlush(); state='ready'; $router.push('/')" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'FeedBack',
  data: ()=>{return {
    state: 'ready', //justSentOk, justSentBad
    mailregex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    fbData: {
      topic: '',
      name: '',
      mail: '',
      body: ''
    }
  }},
  methods: {
    fbDataFlush() {
      this.fbData = {
        topic: '',
        name: '',
        mail: '',
        body: '',
      }
    },
    sendFB() {
      // console.log(this.fbData)
      if (
        this.fbData.mail.length > 3 &&
        this.fbData.mail.length < 71 &&
        this.mailregex.test(this.fbData.mail)
      ) {
        let url = '/fb'
        this.$axios
          .post(url, this.fbData, {headers: {'Content-Type' : 'application/json' }, withCredentials: true,})
          .then(response => {
            if (response.data == 'OK') {
              this.$q.notify(this.$t('fb.fbSuccess'))
              this.state = 'OK'
              this.fbDataFlush()
            } else {
              this.$q.notify(this.$t('fb.fbError'))
              this.state = 'BAD'
            }
        })
      } else {
        this.$q.notify({type:'negative', message: this.$t('fb.reqMail')})
      }
      
    }
  }
}
</script>

<style scoped lang="stylus">
.feedback
  max-width 620px
  width 620px
  min-height 70vh
  @media screen and (max-width 550px)
    width 100%
    max-width none
  .fb_inner
    box-shadow 0 0 3px 1px var(--main-borders-color)
    margin-top 15px
    background: #EDEEF2;
    border: 0.5px solid rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1)
    border-radius 10px
    @media screen and (max-width 550px)
      width calc(100% - 40px)
      margin 0 20px
      margin-bottom 20px
  .fb__core
    padding 15px 34px
    padding-bottom 36px
  .fb__header
    margin 0
    padding 10px
    border-bottom 1px solid rgba(134, 69, 255, 0.2) //var(--violet-light)
    font-family: Montserrat, sans-serif
    font-size 16px
    font-weight: bold;
    color var(--btn-color)
    text-transform uppercase
    @media screen and (max-width 550px)
      font-size: 12px !important
      line-height: 15px !important

.fb-label
  color var(--color1)
  font-family: Montserrat, sans-serif
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  text-align: left;
  margin-bottom: 7px;
  display: block
  @media screen and (max-width 550px)
    margin-bottom: 6px;

</style>
<style lang="stylus">
  .feedback .q-field--outlined .q-field__control:before
    border 0 !important
  .feedback .q-field__control
    // outline 2px solid orange
    font-size: 12px;
    line-height: 15px;
    border-radius 10px
    box-shadow 0px 2px 15px rgba(0, 0, 0, 0.1)
    height 36px
    min-height 36px !important
  .feedback .q-field__native
    height 36px !important
    min-height 36px !important
    padding 0 !important
  .feedback .q-field__native input
    height 36px
  .feedback .q-field__append
    height 36px
  .feedback .q-field__bottom
    padding-right 0
  .feedback .q-input
    margin-bottom 0px !important

  .feedback .fb_textarea .q-field__native
    height 100px !important
    min-height none !important
    padding 5px 0 !important
  .feedback .fb_textarea .q-field__control
    height auto
  .feedback .fb_textarea .q-field__native input
    height auto
  .feedback .fb_textarea .q-field__append input
    height auto
  .feedback .fb_textarea .q-field__control input
    height auto
</style>
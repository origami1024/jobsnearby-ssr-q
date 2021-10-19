<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div v-if="showBanner" class="banner-container">
      <div class="constrain">
        <q-banner
          inline-actions
          dense
          class="text-white"
        >
          <template v-slot:avatar>
            <q-avatar
              size="48px"
            >
              <img src="/statics/icons/icon-512x512.png">
            </q-avatar>
          </template>

          <b>{{$t('pwaInstall.text')}}</b>

          <template v-slot:action>
            <q-btn
              @click="installApp"
              flat
              dense
              :label="$t('pwaInstall.yes')"
              class="q-px-sm"
            />
            <q-btn
              @click="showBanner = false"
              flat
              dense
              :label="$t('pwaInstall.later')"
              class="q-px-sm"
            />
            <q-btn
              @click="neverShowAppInstallBanner"
              flat
              dense
              :label="$t('pwaInstall.no')"
              class="q-px-sm"
            />
          </template>
        </q-banner>
      </div>
    </div>
  </transition>
</template>
<script>
let deferredPrompt;

export default {
  name: 'PwaMessage',
  data () {
    return {
      showBanner: false
    }
  },
  methods: {
    sendToYandex() {
      try {
        window[`yaCounter64814416`].reachGoal('installPwaHeader');
      } catch (error) {
        console.error(error);
      }
    },
    initBanner() {
      let neverShowAppInstallBanner = this.$q.localStorage.getItem('neverShowAppInstallBanner')
      if (!neverShowAppInstallBanner) {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredPrompt = e;
          this.showAppInstallBanner();
        });
      }
    },
    installApp() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice
          .then((choiceResult) => {
            if(choiceResult.outcome === 'dismissed') {
              console.log('User cancelled home screen install');
            } else {
              console.log('User added to home screen');
              this.neverShowAppInstallBanner();
            }
            deferredPrompt = null;
          });
      }
      this.sendToYandex()
    },
    showAppInstallBanner() {
      setTimeout(() => {
        this.showBanner = true
      }, 3000)
    },
    neverShowAppInstallBanner() {
      this.showBanner = false;
      this.$q.localStorage.set('neverShowAppInstallBanner', true)
    }
  },
  mounted() {
    this.initBanner();
  }
}
</script>
<style>
.banner-container .q-banner {
  background-color: #8645ff;
}
</style>

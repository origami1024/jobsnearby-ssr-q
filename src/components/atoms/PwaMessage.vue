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
    initBanner() {
      let neverShowAppInstallBanner = this.$q.localStorage.getItem('neverShowAppInstallBanner')

      if (!neverShowAppInstallBanner) {
        window.addEventListener('beforeinstallprompt', (e) => {
          // Prevent showing the prompt
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          // Update UI notify the user they can install the PWA
          this.showAppInstallBanner();
        });
      }
    },
    installApp() {
      // Hide the app provided install promotion
      if (deferredPrompt) {
        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice
          .then((choiceResult) => {
            if(choiceResult.outcome === 'dismissed') {
              console.log('User cancelled home screen install');
            } else {
              console.log('User added to home screen');
              this.neverShowAppInstallBanner();
            }
            // We no longer need the prompt.  Clear it up.
            deferredPrompt = null;
          });
      }
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

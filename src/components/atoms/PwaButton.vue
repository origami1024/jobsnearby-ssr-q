<template>
  <div v-if="showButton" class="pwa-button">
    <q-btn
      @click="installApp"
      flat
      dense
      :label="$t('pwaInstall.button')"
      class="headerBtns1 violetBtns"
    />
  </div>
</template>
<script>
let deferredPrompt;

export default {
  name: 'PwaButton',
  data() {
    return {
      showButton: true
    }
  },
  methods: {
    initButton() {
        window.addEventListener('beforeinstallprompt', (e) => {
          // Prevent showing the prompt
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          // Update UI notify the user they can install the PWA
          // this.showAppInstallButton();
        });
    },
    installApp() {
      // Hide the app provided install promotion
      if (deferredPrompt) {
        // Show the prompt
        deferredPrompt.prompt();
      }
      else {
          this.$q.notify({
            message: 'Приложение уже установлено!'
          })
      }
      this.sendToYandex()
    },
  },
  mounted() {
    this.initButton();
  }
}
</script>

<style>
.pwa-button button {
  max-width: none;
  padding: 0 8px;
  height: 35px;
  font-weight: bold;
  align-self: flex-start;
  border-radius: 10px;
  height: auto!important;
  transition-duration: 0.3s;
  background-color: var(--violet-btn-color) !important;
  color: #fff !important;
  font-family: Montserrat, sans-serif;
  padding: 0 5px !important;
  text-align: center;
  display: inline-block;
  margin: 16px 0 0 0 !important;
  text-transform: uppercase;
}
</style>

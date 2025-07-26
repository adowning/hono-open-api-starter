<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { onMounted } from 'vue';

// Define props to make the component reusable
const props = defineProps({
  gameId: {
    type: String,
    required: true,
  },
  sessionId:{
    type: String,
    required: true
  }
});

// --- Head Management ---
// Use VueUse to manage the document's head content, making it dynamic
useHead({
  title: '...',
  htmlAttrs: {
    style: 'background: black',
    translate: 'no',
    class: 'notranslate',
  },
  meta: [
     { 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' },
  { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
    { name: 'viewport', content: 'width=device-width, user-scalable=no, initial-scale=1' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'google', content: 'notranslate' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'theme-color', content: '#ffffff' },
  ],
  link: [
    { rel: 'apple-touch-icon', sizes: '180x180', href: `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/assets/default/page/favicons/apple-touch-icon.png` },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/assets/default/page/favicons/favicon-32x32.png` },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/assets/default/page/favicons/favicon-16x16.png` },
    { rel: 'mask-icon', href: `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/assets/default/page/favicons/safari-pinned-tab.svg`, color: '#5bbad5' },
    { rel: 'shortcut icon', href: `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/assets/default/page/favicons/favicon.ico` },
  ],
});


// --- Script Loading & Initialization ---
// Helper to dynamically load external scripts
const loadScript = (src: string, crossOrigin: boolean = true): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    if (crossOrigin) {
      script.crossOrigin = 'anonymous';
    }
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.body.appendChild(script);
  });
};

// onMounted ensures the DOM is ready before we try to manipulate it
onMounted(async () => {
  // Define the global object structure
  window.com = window.com || {};
  window.com.casino = window.com.casino || {};
  
  // Set CDN paths based on the gameId prop
  const cdnBase = `https://cdn-eu.cloudedge.info/all/games/slots/${props.gameId}/`;
  window.com.casino.cdn = cdnBase;
  window.com.casino.baseCdn = 'https://cdn-eu.cloudedge.info/all/games/';
  window.com.casino.barsPath = 'https://cdn-eu.cloudedge.info/all/games/bars-next/';
  window.com.casino.bridgePath = 'https://cdn-eu.cloudedge.info/all/games/bridge/';
  
  // Load the main bridge script and wait for it to be ready
  await loadScript(`${window.com.casino.bridgePath}bridge.min.js?t=${Date.now()}`);

  // This logic now runs *after* the bridge script has loaded
  (function () {
    'use strict';
    const get = (key: string) => new URLSearchParams(window.location.search).get(key);

    const preconfig = {
      bridge: {
        postParams: [],
        feedUrl: 'https://feed-rtg.redtiger.com/',
        provider: 'kronos',
        operator: 'redtiger',
        timestamp: `?t=${Date.now()}`,
        notifications: {
          inRealPlay: true,
          inDemoPlay: false,
          showUnfinishedWins: true,
          showUnfinishedNoWins: false,
        },
        bridgeLaunch: true,
      },
      server: {
        rgsApi: 'http://localhost:9999/rcp/',
        launchParams: {
          gameId: props.gameId, // Use the prop here
        },
      },
      game: {
        namespace: 'com.casino.game',
        preconfig: {
          cdn: window.com.casino.cdn,
          delayedBalanceUpdate: false,
          defaultLang: 'en',
          splash: true,
          hideCurrency: get('hideCurrency') === 'true',
          disclaimer: '',
          skin: 'next-name-payouts',
          skinURL: get('skinURL'),
          gameType: 'slot',
          gameAppId: props.gameId, // Use the prop here
          responsive: true,
          addedAnticipation: get('addedAnticipation') !== 'false',
        },
      },
      bars: {
        basePath: window.com.casino.barsPath,
        options: {
          historySrc: 'https://cdn-eu.cloudedge.info/all/games/history/',
          hasGamble: true,
        },
      },
      // ... other config sections
    };

    // Initialize the bridge with the configuration
    if (window.com.casino.bridge) {
      window.com.casino.bridge.init(preconfig);
    }
  })();

  // Load non-essential scripts
  // loadScript('https://static.cloudflareinsights.com/beacon.min.js/vcd15cbe7772f49c399c6a5babf22c1241717689176015', false);
});
</script>

<template>
  <div>
    <img
      class="loading-icon"
      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto"
      src="https://cdn-eu.cloudedge.info/all/assets/loading.svg"
    />
  </div>
</template>

<style scoped>
/* You can add component-specific styles here if needed */
</style>
<template>
  <!-- <div class="container"></div>
    <div class="spinner"></div>
    <div class="backdrop"></div> -->
  <div class="container">
    <div class="loader" style="transform: translateY(-20px) scale(0.4) translateX(20px)">
      <span style="font-size: 42px; font-weight: 700" class="glow">xxloadingxx</span>
      <span style="--i: 1"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 2"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 3"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 4"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 5"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 6"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 7"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 8"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 9"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 10"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 11"><i class="fa-solid fa-star"></i></span>
      <span style="--i: 12"><i class="fa-solid fa-star"></i></span>
    </div>
  </div>
  <!-- <div class="logo"> -->
  <!-- <img src="/images/logo.png" w="200" h="180" /> -->
  <!-- </div> -->
</template>

<script setup lang="ts">
  // export default {
  //     data() {
  //         return {
  //             loading: true,
  //             showBackdrop: true,
  //         };
  //     },
  //     mounted() {
  //         // setTimeout(() => {
  //         //     this.loading = false;
  //         // }, 2000);
  //     },
  // };
  const showLoading = ref(false)
  onMounted(() => {
    setTimeout(() => {
      showLoading.value = true
    }, 300)
  })
</script>

<style scoped>
  .container {
    z-index: 999;
    margin: 0;
    top: 0px;
    left: 0px;
    z-index: 999999999;
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    background-image: url('/images/common/loading.png');
    background-size: 100% 100%;
    min-height: 300px;
    height: 100%;
    max-width: 580px;
    width: 100%;
    width: 100%;
  }

  .logo {
    z-index: 99099;
    position: absolute;
    width: auto;
    height: 180px;
    display: flex;
    align-items: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    justify-content: center;
  }

  .loader {
    z-index: 9909;
    position: absolute;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    top: 55%;
    left: 25%;
    transform: translate(-50%, -50%);
    justify-content: center;
    animation: animateColor 5.2s linear infinite;
  }

  @keyframes animateColor {
    0% {
      filter: hue-rotate(0deg);
    }

    100% {
      filter: hue-rotate(360deg);
    }
  }

  .loader span {
    position: absolute;
    transform-origin: 150px;
    transform: translateX(-150px) rotate(calc(var(--i) * 30deg));
    filter: drop-shadow(0 0 5px #3cc2ff) drop-shadow(0 0 15px #3cc2ff) drop-shadow(0 0 30px #3cc2ff);
  }

  .loader span i {
    position: relative;
    color: #3cc2ff;
    animation: rotate-stars 2.4s linear infinite;
    animation-delay: calc(var(--i) * -0.2s);
  }

  @keyframes rotate-stars {
    0% {
      transform: rotate(0deg) scale(0);
    }

    50% {
      transform: rotate(180deg) scale(3);
    }

    100% {
      transform: rotate(360deg) scale(0);
    }
  }

  .loader span::before {
    content: '\f005';
    position: absolute;
    font-family: fontAwesome;
    font-size: 0.75em;
    color: #131a1c;
    animation: rotate-particle 2.4s linear infinite;
    animation-delay: calc(var(--i) * -0.2s);
  }

  @keyframes rotate-particle {
    0% {
      scale: 1;
      opacity: 0;
      rotate: 0deg;
    }

    50% {
      scale: 1;
      opacity: 1;
      rotate: 180deg;
    }

    100% {
      scale: 0;
      opacity: 0;
      rotate: 360deg;
      filter: drop-shadow(-150px 0 #3cc2ff) drop-shadow(150px 0 #3cc2ff)
        drop-shadow(0 150px #3cc2ff) drop-shadow(0 -150px #3cc2ff);
    }
  }

  /* .container {
        position: absolute;
        width: 100vw;
        height: 100vh;
        filter: blur(1.5rem);
        z-index: 999999;
    }

    .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        z-index: 1000;

    }

    .show-backdrop {
        display: block;
    }

    .spinner {
        position: absolute;
        filter: blur(0);
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        z-index: 999999;
        width: 50px;
        height: 50px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: translate(-50%, -50%) rotate(0deg);
        }

        100% {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    } */
</style>

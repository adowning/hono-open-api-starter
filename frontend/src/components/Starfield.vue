<template>
  <div class="starfield-wrapper bg-black/30 backdrop-blur-sm p-3 rounded-lg shadow-2xl border border-blue-500/20">
    <!-- The main container for the starfield effect -->
    <div ref="starContainer" class="star-container w-full h-full rounded-md relative overflow-hidden bg-cover bg-center"
      style="background-image: url('/images/starsbg.png');">
      <!-- Stars will be dynamically added here by the script -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// --- Type Definitions ---
interface StarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Holds all data for a single star instance
interface StarInstance {
  element: HTMLImageElement;
  position: StarPosition;
}

// --- Component State ---
const starContainer = ref<HTMLDivElement | null>(null);

// --- Animation & Layout Configuration ---
const starUrls: string[] = [
  'https://gameui.cashflowcasino.com/images/stars/star0.avif',
  'https://gameui.cashflowcasino.com/images/stars/star1.avif',
  'https://gameui.cashflowcasino.com/images/stars/star2.avif',
  'https://gameui.cashflowcasino.com/images/stars/star3.avif'
];
const numStars: number = 15;
const starSize: number = 50;
const minSpacing: number = 20;

// This runs once the component is mounted to the DOM
onMounted(() => {
  if (!starContainer.value) {
    console.error('Starfield container not found.');
    return;
  }

  const container: HTMLDivElement = starContainer.value;
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const starInstances: StarInstance[] = [];

  // --- Core Functions ---

  /**
  * Checks if two rectangular areas overlap, including a minimum spacing buffer.
  */
  const checkOverlap = (rect1: StarPosition, rect2: StarPosition): boolean => {
    const noOverlap =
      rect1.x > rect2.x + rect2.width + minSpacing ||
      rect1.x + rect1.width + minSpacing < rect2.x ||
      rect1.y > rect2.y + rect2.height + minSpacing ||
      rect1.y + rect1.height + minSpacing < rect2.y;
    return !noOverlap;
  };

  /**
  * Finds a new, non-overlapping position for a given star and applies it.
  */
  const findAndSetNewPosition = (instance: StarInstance) => {
    const otherInstances = starInstances.filter(inst => inst !== instance);
    let newPosition: StarPosition | null = null;
    let isPositionSafe = false;
    let attempts = 0;
    const maxAttempts = 200;

    while (!isPositionSafe && attempts < maxAttempts) {
      attempts++;
      const candidateX = Math.random() * (containerWidth - starSize);
      const candidateY = Math.random() * (containerHeight - starSize);
      const candidatePos: StarPosition = { x: candidateX, y: candidateY, width: starSize, height: starSize };

      if (!otherInstances.some(other => checkOverlap(candidatePos, other.position))) {
        isPositionSafe = true;
        newPosition = candidatePos;
      }
    }

    if (isPositionSafe && newPosition) {
      instance.position = newPosition;
      instance.element.style.left = `${(newPosition.x / containerWidth) * 100}%`;
      instance.element.style.top = `${(newPosition.y / containerHeight) * 100}%`;
    } else {
      console.warn('Could not find a new non-overlapping position. Hiding star for one cycle.');
      instance.element.style.opacity = '0';
    }
  };


  /**
  * Handles the cycling animation for types A and C (grow/shrink, grow-only).
  */
  const animateStarContinuous = (instance: StarInstance, animationName: string) => {
    const runCycle = () => {
      // 1. Find a new position.
      findAndSetNewPosition(instance);

      // 2. Set up the listener that will restart the cycle.
      instance.element.addEventListener('animationend', (event: AnimationEvent) => {
        // Only restart if the correct animation finished.
        if (event.animationName === animationName) {
          setTimeout(runCycle, Math.random() * 4000 + 2000);
        }
      }, { once: true });

      // 3. Reset the animation to force a re-trigger.
      instance.element.style.animation = 'none';
      // This line is crucial. It forces the browser to "reflow" the element,
      // acknowledging that the animation has been removed.
      void instance.element.offsetHeight;

      // 4. Apply the new animation with halved duration.
      const duration = animationName === 'star-type-a-animation'
        ? Math.random() * 3.5 + 4 // Was 7 + 8
        : Math.random() * 2.5 + 3; // Was 5 + 6
      instance.element.style.animation = `${animationName} ${duration}s linear forwards`;
    };
    // Start the very first cycle after a random delay.
    setTimeout(runCycle, Math.random() * 5000);
  };

  /**
  * Handles the multi-step fade/spin animation for intermittent stars (Type B).
  */
  const animateStarTypeB = (instance: StarInstance) => {
    const runAnimationCycle = () => {
      findAndSetNewPosition(instance);

      const star = instance.element;
      star.style.animation = '';
      star.style.transform = 'scale(1) rotate(0deg)';
      star.style.opacity = '0';

      star.style.animation = 'star-type-b-fade-in 0.5s ease-out forwards';

      star.addEventListener('animationend', function onFadeInEnd(event) {
        if (event.animationName !== 'star-type-b-fade-in') return;

        setTimeout(() => {
          star.addEventListener('animationend', function onCycleEnd(event) {
            if (event.animationName !== 'star-type-b-fade-out' && event.animationName !== 'star-type-b-spin-out') return;
            setTimeout(runAnimationCycle, Math.random() * 7000 + 8000);
          }, { once: true });

          if (Math.random() < 0.5) {
            star.style.animation = 'star-type-b-fade-out 0.5s ease-in forwards';
          } else {
            star.style.animation = 'star-type-b-spin-out 1s ease-in-out forwards';
          }
        }, 500);
      }, { once: true });
    };
    setTimeout(runAnimationCycle, Math.random() * 8000);
  };

  // --- Initialization Loop ---
  let typeACStarCount = 0;
  const maxTypeACStars = 2;

  for (let i = 0; i < numStars; i++) {
    let initialPosition: StarPosition | null = null;
    let isPositionSafe = false;
    let attempts = 0;
    const maxAttempts = 200;

    while (!isPositionSafe && attempts < maxAttempts) {
      attempts++;
      const candidateX = Math.random() * (containerWidth - starSize);
      const candidateY = Math.random() * (containerHeight - starSize);
      const candidatePos: StarPosition = { x: candidateX, y: candidateY, width: starSize, height: starSize };

      if (!starInstances.some(inst => checkOverlap(candidatePos, inst.position))) {
        isPositionSafe = true;
        initialPosition = candidatePos;
      }
    }

    if (isPositionSafe && initialPosition) {
      const starElement = document.createElement('img');
      let starTypeIndex = Math.floor(Math.random() * starUrls.length);

      const isTypeACCandidate = starTypeIndex === 0 || starTypeIndex === 3;
      if (isTypeACCandidate && typeACStarCount >= maxTypeACStars) {
        starTypeIndex = Math.random() < 0.5 ? 1 : 2;
      }

      starElement.src = starUrls[starTypeIndex];
      starElement.classList.add('star-image');
      starElement.style.left = `${(initialPosition.x / containerWidth) * 100}%`;
      starElement.style.top = `${(initialPosition.y / containerHeight) * 100}%`;
      starElement.onerror = () => { starElement.style.display = 'none'; };
      container.appendChild(starElement);

      const instance: StarInstance = {
        element: starElement,
        position: initialPosition,
      };
      starInstances.push(instance);

      if (starTypeIndex === 0 || starTypeIndex === 3) {
        typeACStarCount++;
        if (Math.random() < 0.5) {
          animateStarContinuous(instance, 'star-type-c-animation');
        } else {
          animateStarContinuous(instance, 'star-type-a-animation');
        }
      } else {
        animateStarTypeB(instance);
      }
    } else {
      console.warn(`Could not find an initial non-overlapping position for star ${i + 1}.`);
    }
  }
});
</script>

<style>
/* Styles are global, allowing JS to find the keyframes by name. */
.starfield-wrapper {
  width: 393px;
  height: 852px;
}

.star-image {
  position: absolute;
  width: clamp(25px, 5vw, 50px);
  height: auto;
  transform-origin: center center;
  will-change: transform, opacity;
  opacity: 0;
}

@keyframes star-type-a-animation {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }

  60% {
    opacity: 1;
    transform: scale(1.5) rotate(216deg);
  }

  75% {
    opacity: 1;
    transform: scale(1.5) rotate(270deg);
  }

  100% {
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}

@keyframes star-type-c-animation {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }

  80% {
    opacity: 1;
    transform: scale(2.0) rotate(288deg);
  }

  100% {
    opacity: 0;
    transform: scale(3) rotate(360deg);
  }
}

@keyframes star-type-b-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes star-type-b-fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes star-type-b-spin-out {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: rotate(720deg);
    opacity: 0;
  }
}
</style>

<template>
  <div :class="['h-full', isDesktop ? 'w-[430px] mx-auto' : 'w-full']">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { width: windowWidth } = useWindowSize();

const isDesktop = computed(() => windowWidth.value > 1024);

const starImages = [
  '/images/stars/star0.avif',
  '/images/stars/star1.avif',
  '/images/stars/star2.avif',
  '/images/stars/star3.avif',
];

const particleImages = [
  '/images/stars/particle02.png',
  '/images/stars/particle03.png',
  '/images/stars/particle05.png',
];

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  image: HTMLImageElement;
  life: number;
  maxLife: number;
  // direction
  vx: number;
  vy: number;
  rotationSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  image: HTMLImageElement;
  life: number;
  maxLife: number;
  rotationSpeed: number;
}

let stars: Star[] = [];
let particles: Particle[] = [];
let loadedImages: Record<string, HTMLImageElement> = {};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

const createStar = (width: number, height: number) => {
  const imageSrc = starImages[Math.floor(Math.random() * starImages.length)];
  const maxLife = 2000 + Math.random() * 3000;
  const speedModifier = isDesktop.value ? 1 / 3 : 1;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0,
    opacity: 0,
    rotation: Math.random() * 360,
    image: loadedImages[imageSrc],
    life: maxLife,
    maxLife: maxLife,
    vx: (Math.random() - 0.5) * 0.1 * speedModifier,
    vy: (Math.random() - 0.5) * 0.1 * speedModifier,
    rotationSpeed: (Math.random() - 0.5) * 0.1 * speedModifier,
  };
};

const createParticle = (x: number, y: number) => {
  const imageSrc = particleImages[Math.floor(Math.random() * particleImages.length)];
  const maxLife = 500 + Math.random() * 500;
  return {
    x,
    y,
    size: 0,
    opacity: 0,
    rotation: Math.random() * 360,
    image: loadedImages[imageSrc],
    life: maxLife,
    maxLife,
    rotationSpeed: (Math.random() - 0.5) * 2,
  };
};

const update = (width: number, height: number) => {
  const sizeModifier = isDesktop.value ? 12 : 1;
  // Update stars
  stars.forEach((star, index) => {
    star.life -= 16;
    if (star.life <= 0) {
      stars[index] = createStar(width, height);
    }

    const lifeRatio = star.life / star.maxLife;
    star.opacity = 1 - Math.abs(lifeRatio - 0.5) * 2;
    star.size = (1 - Math.abs(lifeRatio - 0.5) * 2) * 30 * sizeModifier;
    star.rotation += star.rotationSpeed;
    star.x += star.vx;
    star.y += star.vy;

    if (Math.random() < 0.05) {
        particles.push(createParticle(star.x, star.y));
    }
  });

  // Update particles
  particles.forEach((particle, index) => {
    particle.life -= 16;
    if (particle.life <= 0) {
      particles.splice(index, 1);
      return;
    }

    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = 1 - Math.abs(lifeRatio - 0.5) * 2;
    particle.size = (1 - Math.abs(lifeRatio - 0.5) * 2) * 10;
    particle.rotation += particle.rotationSpeed;
  });
};

const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const drawItem = (item: Star | Particle) => {
        ctx.save();
        ctx.globalAlpha = item.opacity;
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation * Math.PI / 180);
        ctx.drawImage(item.image, -item.size / 2, -item.size / 2, item.size, item.size);
        ctx.restore();
    };

    stars.forEach(drawItem);
    particles.forEach(drawItem);
};

let animationFrameId: number;

const animate = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  const rect = canvasRef.value.getBoundingClientRect();
  update(rect.width, rect.height);
  draw(ctx);

  animationFrameId = requestAnimationFrame(animate);
};

const setupCanvas = () => {
    if (canvasRef.value) {
        const canvas = canvasRef.value;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx?.resetTransform();
        ctx?.scale(dpr, dpr);

        const starCount = isDesktop.value ? 25 : 50;
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(createStar(rect.width, rect.height));
        }
    }
}

onMounted(async () => {
  const allImages = [...starImages, ...particleImages];
  const imagePromises = allImages.map(loadImage);
  const loaded = await Promise.all(imagePromises);
  allImages.forEach((src, i) => {
    loadedImages[src] = loaded[i];
  });

  setupCanvas();
  animate();

  window.addEventListener('resize', setupCanvas);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', setupCanvas);
});
</script>
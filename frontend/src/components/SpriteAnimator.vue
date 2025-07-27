<template>
  <canvas ref="canvasRef" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  animationData: {
    frames: {
      frame: { x: number; y: number; w: number; h: number };
      rotated: boolean;
      trimmed?: boolean;
      spriteSourceSize: { x: number; y: number; w: number; h: number };
      sourceSize: { w: number; h: number };
    }[];
  };
  imageUrl: string;
  width: number;
  height: number;
  frameRate?: number;
  initialDelayMax?: number; // in seconds
  loopDelay?: number; // in seconds
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const image = new Image();
let frameIndex = 0;
let startTimeoutId: NodeJS.Timeout;
let loopTimeoutId: NodeJS.Timeout;
let lastFrameTime = 0;
let animationFrameId: number;

const frameList = props.animationData.frames as {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}[];

const drawFrame = (index: number) => {
  const canvas = canvasRef.value;
  if (!canvas || !image.complete || image.naturalHeight === 0) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const currentFrame = frameList[index];
  if (!currentFrame) return;

  const { frame, sourceSize, spriteSourceSize } = currentFrame;

  // Calculate the scaling factor to fit the original, untrimmed source size
  // into the component's bounding box, preserving aspect ratio.
  const scale = Math.min(props.width / sourceSize.w, props.height / sourceSize.h);

  // These are the final dimensions of the visible sprite part on the canvas
  const targetWidth = spriteSourceSize.w * scale;
  const targetHeight = spriteSourceSize.h * scale;

  // This is where the sprite should be drawn on the canvas to respect trimmed space
  const destX = spriteSourceSize.x * scale;
  const destY = spriteSourceSize.y * scale;

  ctx.clearRect(0, 0, props.width, props.height);
  ctx.save();

  // We draw the sub-rectangle from the spritesheet (frame) onto the destination
  // rectangle on the canvas.
  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    frame.w,
    frame.h,
    destX,
    destY,
    targetWidth,
    targetHeight
  );

  ctx.restore();
};


const animate = (timestamp: number) => {
  const frameInterval = 1000 / (props.frameRate || 60);
  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = timestamp - lastFrameTime;

  if (deltaTime > frameInterval) {
    lastFrameTime = timestamp - (deltaTime % frameInterval);
    drawFrame(frameIndex);
    frameIndex++;

    if (frameIndex >= frameList.length) {
      frameIndex = 0;
      if (props.loopDelay && props.loopDelay > 0) {
        cancelAnimationFrame(animationFrameId);
        loopTimeoutId = setTimeout(() => {
          lastFrameTime = 0;
          animationFrameId = requestAnimationFrame(animate);
        }, props.loopDelay * 1000);
        return;
      }
    }
  }
  animationFrameId = requestAnimationFrame(animate);
};

const startAnimationCycle = () => {
  cancelAnimationFrame(animationFrameId);
  clearTimeout(startTimeoutId);
  clearTimeout(loopTimeoutId);

  const initialDelay = (props.initialDelayMax || 0) * 1000 //Math.random() * (props.initialDelayMax || 0) * 1000;

  startTimeoutId = setTimeout(() => {
    frameIndex = 0;
    lastFrameTime = 0;
    animationFrameId = requestAnimationFrame(animate);
  }, initialDelay);
};

onMounted(() => {
  image.src = props.imageUrl;
  image.onload = () => {
    drawFrame(0); // Draw the first frame immediately
    startAnimationCycle(); // Then, start the animation cycle with delays
  };
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  clearTimeout(startTimeoutId);
  clearTimeout(loopTimeoutId);
});

watch(() => [props.animationData, props.imageUrl], () => {
  image.src = props.imageUrl; // onload will handle the rest
});
</script>

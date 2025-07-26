<template>
  <div
    ref="containerRef"
    :class="cn('w-full h-full', props.class)"
  >
    <canvas
      ref="canvasRef"
      class="pointer-events-none"
      :width="canvasSize.width"
      :height="canvasSize.height"
    />
  </div>
</template>

<script lang="ts" setup>
import { cn } from "@/lib/utils";
import { ref, onMounted, onBeforeUnmount, toRefs, computed } from "vue";

interface FlickeringGridProps {
  starSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  class?: string;
  maxOpacity?: number;
}

const props = withDefaults(defineProps<FlickeringGridProps>(), {
  starSize: 12,
  gridGap: 6,
  flickerChance: 0.3,
  color: "rgb(0, 0, 0)",
  maxOpacity: 0.3,
});

const { starSize, gridGap, flickerChance, color, maxOpacity, width, height } = toRefs(props);

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const context = ref<CanvasRenderingContext2D>();

const isInView = ref(false);
const canvasSize = ref({ width: 0, height: 0 });

const computedColor = computed(() => {
  if (!context.value) return "rgba(255, 0, 0,";

  const hex = color.value.replace(/^#/, "");
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b},`;
});

function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): {
  cols: number;
  rows: number;
  opacities: Float32Array;
  dpr: number;
} {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const cols = Math.floor(width / (starSize.value + gridGap.value));
  const rows = Math.floor(height / (starSize.value + gridGap.value));

  const opacities = new Float32Array(cols * rows);
  for (let i = 0; i < opacities.length; i++) {
    opacities[i] = Math.random() * maxOpacity.value;
  }
  return { cols, rows, opacities, dpr };
}

function updateOpacities(opacities: Float32Array, deltaTime: number) {
  for (let i = 0; i < opacities.length; i++) {
    if (Math.random() < flickerChance.value * deltaTime) {
      opacities[i] = Math.random() * maxOpacity.value;
    }
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  opacities: Float32Array,
  dpr: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const opacity = opacities[i * rows + j];
      ctx.fillStyle = `${computedColor.value}${opacity})`;

      const x = i * (starSize.value + gridGap.value) * dpr;
      const y = j * (starSize.value + gridGap.value) * dpr;
      const starDrawingSize = starSize.value * dpr;
      const cx = x + starDrawingSize / 2;
      const cy = y + starDrawingSize / 2;

      drawStar(ctx, cx, cy, 5, starDrawingSize / 2, starDrawingSize / 4);
      ctx.fill();
    }
  }
}

const gridParams = ref<ReturnType<typeof setupCanvas>>();

function updateCanvasSize() {
  const newWidth = width.value || containerRef.value!.clientWidth;
  const newHeight = height.value || containerRef.value!.clientHeight;

  canvasSize.value = { width: newWidth, height: newHeight };
  gridParams.value = setupCanvas(canvasRef.value!, newWidth, newHeight);
}

let animationFrameId: number | undefined;
let resizeObserver: ResizeObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let lastTime = 0;

function animate(time: number) {
  if (!isInView.value) return;

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  updateOpacities(gridParams.value!.opacities, deltaTime);
  drawGrid(
    context.value!,
    canvasRef.value!.width,
    canvasRef.value!.height,
    gridParams.value!.cols,
    gridParams.value!.rows,
    gridParams.value!.opacities,
    gridParams.value!.dpr,
  );
  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return;
  context.value = canvasRef.value.getContext("2d")!;
  if (!context.value) return;

  updateCanvasSize();

  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isInView.value = entry.isIntersecting;
      animationFrameId = requestAnimationFrame(animate);
    },
    { threshold: 0 },
  );

  resizeObserver.observe(containerRef.value);
  intersectionObserver.observe(canvasRef.value);
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
});
</script>

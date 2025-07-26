/* eslint-disable @typescript-eslint/no-explicit-any */
// /tmp/hono-open-api-starter/frontend/src/composables/useAnimationLayer.ts
import { ref, shallowRef, type Component } from 'vue'
import { useEventManager } from './EventManager'
import SpriteAnimator from '@/components/SpriteAnimator.vue'

// --- Interfaces ---

interface SpriteAnimatorProps {
    animationData: any
    imageUrl: string
    width: number
    height: number
    frameRate?: number
    initialDelayMax?: number
    loopDelay?: number
}

interface AnimationPosition {
    top: string
    left: string
    transform?: string
    zIndex?: number
}

export interface AnimationInstance {
    id: string // Unique ID for this animation instance
    ownerId?: string // Optional: ID of the component that created it
    component: Component
    props: SpriteAnimatorProps
    style: AnimationPosition
}

// --- Singleton State ---
const animations = ref<AnimationInstance[]>([])
const eventManager = useEventManager()

// --- Event Handlers ---

/**
 * Adds a new animation to the layer.
 * The config requires a unique `id`.
 */
const addAnimation = (config: Omit<AnimationInstance, 'component'>) => {
    const existing = animations.value.find((a) => a.id === config.id)
    if (existing) {
        console.warn(
            `Animation with ID ${config.id} already exists. Use 'animation:update' instead.`
        )
        return
    }
    animations.value.push({
        ...config,
        component: shallowRef(SpriteAnimator),
    })
}

/**
 * Updates an existing animation's properties, like its position.
 */
const updateAnimation = (
    id: string,
    partialConfig: Partial<Omit<AnimationInstance, 'id' | 'component'>>
) => {
    const anim = animations.value.find((a) => a.id === id)
    if (anim) {
        // Merge new style and props with existing ones
        if (partialConfig.style) {
            anim.style = { ...anim.style, ...partialConfig.style }
        }
        if (partialConfig.props) {
            anim.props = { ...anim.props, ...partialConfig.props }
        }
        // Update other top-level properties if provided
        if (partialConfig.ownerId) {
            anim.ownerId = partialConfig.ownerId
        }
    } else {
        console.warn(`Animation with ID ${id} not found for update.`)
    }
}

/**
 * Removes a specific animation by its unique ID.
 */
const removeAnimation = (id: string) => {
    animations.value = animations.value.filter((a) => a.id !== id)
}

/**
 * Removes all animations created by a specific owner.
 * Useful for cleanup when a component is unmounted.
 */
const clearByOwner = (ownerId: string) => {
    animations.value = animations.value.filter((a) => a.ownerId !== ownerId)
}

/**
 * Removes all animations from the layer.
 */
const clearAll = () => {
    animations.value = []
}

// --- Singleton Setup ---
// Registers listeners on the global event bus. This code runs only once.
eventManager.on('animation:add', addAnimation as (...args: unknown[]) => void)
eventManager.on(
    'animation:update',
    updateAnimation as (...args: unknown[]) => void
)
eventManager.on(
    'animation:remove',
    removeAnimation as (...args: unknown[]) => void
)
eventManager.on(
    'animation:clear-by-owner',
    clearByOwner as (...args: unknown[]) => void
)
eventManager.on('animation:clear-all', clearAll as (...args: unknown[]) => void)

// --- Composable ---
/**
 * Provides access to the global animation layer state.
 * @returns The reactive list of animations to be rendered.
 */
export function useAnimationLayer() {
    return {
        animations,
    }
}

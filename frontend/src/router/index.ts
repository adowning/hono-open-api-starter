import { useAuthStore } from '@/stores/auth.store'
import { useAppStore } from '@/stores/app.store'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RtgGame from '../views/RtgGame.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true },
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/games/redtiger',
            name: 'rtgGame',
            component: RtgGame,
        },
    ],
})

router.beforeEach(async (_to, _from, next) => {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    // Wait for auth initialization readiness to avoid redirect races
    if (!authStore.authReady) {
        await new Promise<void>((resolve) => {
            const id = setInterval(() => {
                if (authStore.authReady) {
                    clearInterval(id)
                    resolve()
                }
            }, 10)
        })
    }

    // Ensure loader is not masking the login screen
    if (_to.path === '/login') {
        appStore.hideLoading()
    }

    if (
        !authStore.isAuthenticated &&
        _to.path !== '/login' &&
        _to.path !== '/games/redtiger'
    ) {
        next('/login')
    } else {
        next()
    }
})

export default router

import { useAuthStore } from '@/stores/auth.store'
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
            path: '/redtiger',
            name: 'rtgGame',
            component: RtgGame,
        },
    ],
})

router.beforeEach((_to, _from, next) => {
    const authStore = useAuthStore()
    if (
        !authStore.isAuthenticated &&
        _to.path !== '/login' &&
        _to.path !== '/redtiger'
    ) {
        next('/login')
    } else {
        next()
    }
    // globalStore.startLoading()
})

export default router

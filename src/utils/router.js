import { createRouter, createWebHistory } from 'vue-router'
import Reservation from '../components/Reservation.vue'
import VenueDetail from '../components/VenueDetail.vue'



const Dummy = { template: '<div style="padding:20px;"><h2>页面建设中...</h2></div>' }

const routes = [
    {
        path: '/reservation',
        name: 'Reservation',
        component: Reservation
    },
    {
        path: '/community',
        name: 'Community',
        component: Dummy
    },
    {
        path: '/news',
        name: 'News',
        component: Dummy
    },
    {
        path: '/',
        redirect: '/reservation'  // 默认重定向到预约页
    },
    { path: '/venue/:id', component: VenueDetail }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

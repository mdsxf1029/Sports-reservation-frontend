import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import OrderDetail from '../views/OrderDetail.vue'

const routes = [
    {
        path: '/',
        component: App
    },
    {
        path: '/orderdetail',
        name: 'OrderDetail',
        component: OrderDetail
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
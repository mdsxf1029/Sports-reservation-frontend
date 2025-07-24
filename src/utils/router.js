import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import Home from '../views/Home.vue';
import OrderDetail from '../views/OrderDetail.vue';
import VenueManagement from '../views/VenueManagement.vue';
import ViolationManagement from '../views/ViolationManagement.vue';
import PostManagement from '../views/PostManagement.vue';
import PostEditor from '../views/PostEditor.vue';
import PostViewer from '../views/PostViewer.vue';
import AppealManagement from '../views/AppealManagement.vue';
import ViolationHistory from '../views/ViolationHistory.vue';
import Reservation from '../views/Reservation.vue'
import VenueDetail from '../views/VenueDetail.vue'
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Profile from '../views/profile/Profile.vue';
import CourtReservation from '../views/CourtReservation.vue';

const Dummy = { template: '<div style="padding:20px;"><h2>ҳ页面建设中...</h2></div>' }

const routes = [
    {
        path: '/',
        component: App
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/profile',
        component: Profile
    },
    {
        path: '/venue',
        component: VenueManagement
    },

    {
        path: '/violation',
        component: ViolationManagement
    },
    {
        path: '/violation/history',
        component: ViolationHistory
    },
    {
        path: '/post',
        component: PostManagement
    },
    {
        path: '/post/posteditor',
        component: PostEditor
    },
    {
        path: '/post/postviewer',
        component: PostViewer
    },
    {
        path: '/appeal',
        component: AppealManagement
    },
    {
        path: '/orderdetail',
        name: 'OrderDetail',
        component: OrderDetail
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    },
    {
        path: '/court-reservation',
        name: 'CourtReservation',
        component: CourtReservation,
    },
    {
        path: '/community',
        name: 'Community',
        component: () => import('../views/CommunityHome.vue')
    },
    {
        path: '/news',
        name: 'News',
        component: Dummy
    },
    {
        path: '/venue/:id',
        component: VenueDetail
    },
];


const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import Home from '../views/Home.vue';
import OrderDetail from '../views/OrderDetail.vue';
import VenueManagement from '../views/VenueManagement.vue';
import ViolationManagement from '../views/ViolationManagement.vue';
import PostManagement from '../views/PostManagement.vue';
import AppealManagement from '../views/AppealManagement.vue';

import Reservation from '../views/Reservation.vue'
import VenueDetail from '../views/VenueDetail.vue'
import CommunityHome from '../views/CommunityHome.vue';
import PostViewer from '../views/PostViewer.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Profile from '../views/profile/Profile.vue';
import CourtReservation from '../views/CourtReservation.vue';
import VenueList from '../views/VenueList.vue';
import News from '../views/News.vue';
import PostEditor from '../views/PostEditor.vue';
import NewsManagement from '../views/NewsManagement.vue';

const Dummy = { template: '<div style="padding:20px;"><h2>页面建设中...</h2></div>' }

const routes = [
    {
        path: '/',
        redirect: '/home'
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
        name: 'Profile',
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
        path: '/post',
        component: PostManagement
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
        path: '/reservation',
        name: 'Reservation',
        component: Reservation,
    },
    {
        // 社区首页
        path: '/community',
        name: 'Community',
        component: CommunityHome
    },
    {
        // 帖子详情页（占位符）
        path: '/community/post/postviewer/:postId',
        name: 'PostViewer',
        component: PostViewer,
        props: true
    },
    {
        path: '/community/posteditor',
        component: PostEditor
    },
    {
        path: '/news',
        name: 'News',
        component: News
    },
    {
        path: '/news-management',
        component: NewsManagement
    },
    {
        path: '/venue/:id',
        component: VenueDetail
    },
    {
        path: '/venuelist',
        component: VenueList
    },
];


const router = createRouter({
    history: createWebHistory(),
    routes

});

export default router;


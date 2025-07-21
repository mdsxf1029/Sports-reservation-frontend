
import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import OrderDetail from '../views/OrderDetail.vue';
import VenueManagement from '../views/VenueManagement.vue';
import ViolationManagement from '../views/ViolationManagement.vue';
import PostManagement from '../views/PostManagement.vue';
import AppealManagement from '../views/AppealManagement.vue';
import ViolationHistory from '../views/ViolationHistory.vue';
//import Reservation from '../views/Reservation.vue'
import VenueDetail from '../views/VenueDetail.vue'
import Home from '../views/Home.vue'
import VenueList from '../views/VenueList.vue'


const Dummy = { template: '<div style="padding:20px;"><h2>ҳ�潨����...</h2></div>' }


const routes = [
    {
        path: '/',
        component: App
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
        path: '/appeal',
        component: AppealManagement
    },
    {
        path: '/orderdetail',
        name: 'OrderDetail',
        component: OrderDetail
    },
  //{
  //      path: '/reservation',
  //      name: 'Reservation',
  //      component: Reservation
  //  },
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
    { path: '/venue/:id', component: VenueDetail },
    {
        path: '/venuelist',
        name: 'VenueList',
        component: VenueList
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes

});

export default router;


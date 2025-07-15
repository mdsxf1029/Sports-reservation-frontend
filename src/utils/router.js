import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import OrderDetail from '../views/OrderDetail.vue';
import VenueManagement from '../views/VenueManagement.vue';
import ViolationManagement from '../views/ViolationManagement.vue';
import PostManagement from '../views/PostManagement.vue';
import AppealManagement from '../views/AppealManagement.vue';
import ViolationHistory from '../views/ViolationHistory.vue';


const routes = [
  {
    path: '/',
    redirect: '/violation'
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

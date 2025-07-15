import { createRouter, createWebHistory } from 'vue-router';
import VenueManagement from '../components/VenueManagement.vue';
import ViolationManagement from '../components/ViolationManagement.vue';
import PostManagement from '../components/PostManagement.vue';
import AppealManagement from '../components/AppealManagement.vue';

const routes = [
  { path: '/', redirect: '/violation' },
  { path: '/venue', component: VenueManagement },
  { path: '/violation', component: ViolationManagement },
  { path: '/post', component: PostManagement },
  { path: '/appeal', component: AppealManagement }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
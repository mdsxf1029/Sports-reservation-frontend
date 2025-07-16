import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue'; 
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Profile from '../views/profile/Profile.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

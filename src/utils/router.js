import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue'; 
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

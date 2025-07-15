<template>
    <div id="app">
        <HeaderNavbar class="header-navbar" />
        <div class="route-view-container">
            <router-view />
        </div>
        <FooterNavbar class="footer-navbar" />
    </div>
</template>


<script setup>
    //import HeaderNavbar from './components/HeaderNavbar.vue'
    //import FooterNavbar from './components/FooterNavbar.vue'
    //import Reservation from './components/Reservation.vue'
</script>

<style scoped>
    /* 固定顶部导航栏 */
    .header-navbar {
        position: fixed;
        top: 0;
        z-index: 1000;
        width: 100%;
    }

    /* 中间内容区：要留出顶部高度 */
    .route-view-container {
        display: flex;
        flex-direction: column;
        padding-top: 60px; /* 留出 header 高度 */
        padding-bottom: 70px; /* 留出 footer 高度 */
        min-height: calc(100vh - 130px); /* 保证页面填满 */
        background-color: #f8f8f8;
        overflow-y: auto;
    }

    /* 底部导航栏 */
    .footer-navbar {
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 999;
    }
</style>

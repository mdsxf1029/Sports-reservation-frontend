
<template>
  <div>
    <HeaderNavbar class="header-navbar"/>
    <div class="route-view-container">
      <ViolationManagement />
    </div>
    <FooterNavbar class="footer-navbar"/>
  </div>
</template>

<script>
import HeaderNavbar from './components/HeaderNavbar.vue'
import FooterNavbar from './components/FooterNavbar.vue'
import ViolationManagement from './components/ViolationManagement.vue';

export default {
  components: {
    HeaderNavbar,
    FooterNavbar,
    ViolationManagement
  }
};
</script>

<style scoped>
.header-navbar{
  position: fixed;
  z-index: 1000;
  width: 100%;
}

.route-view-container{
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.footer-navbar{
  width: 100%;
}

</style>

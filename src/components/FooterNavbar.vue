<template>
  <footer class="footer-navbar">
    <div class="footer-center">
      <a href="https://cs.tongji.edu.cn/" target="_blank">
        <img
          src="../assets/LogosAndIcons/Tongji.png"
          alt="TongjiLogo"
          class="footer-logo"
          height="40"
        />
      </a>
      <a href="https://github.com/mdsxf1029/Sports-reservation-frontend" target="_blank">
        <img
          src="../assets/LogosAndIcons/GitHub.png"
          alt="GithubLogo"
          class="footer-logo"
          height="40"
        />
      </a>

      <div class="footer-content">
        <el-link :underline="false" class="footer-link">关于我们</el-link>
        <span class="separator">|</span>
        <el-link :underline="false" class="footer-link" @click="showPrivacyPolicy = true">隐私政策</el-link>
        <span class="separator">|</span>
        <el-link :underline="false" class="footer-link" @click="showDisclaimer = true">免责声明</el-link>
        <span class="separator">|</span>
        <el-link :underline="false" class="footer-link" @click="showCodeOfConduct = true">行为准则</el-link>
        <span class="separator">|</span>
        <el-link :underline="false" class="footer-link" @click="showContactUs = true">联系我们</el-link>
        <span class="separator">|</span>
        <el-link :underline="false" class="footer-link" @click="showFeedback = true">反馈</el-link>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const showPrivacyPolicy = ref(false)
const showDisclaimer = ref(false)
const showCodeOfConduct = ref(false)
const showContactUs = ref(false)
const showFeedback = ref(false)
</script>

<style scoped>
.footer-navbar {
  width: 100%;
  padding: 16px 0;
  background-color: #f8f8f8;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-center {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 2000px; /* 限制宽度避免挤压换行 */
}

.footer-logo {
  vertical-align: middle; /* 改为垂直对齐中间 */
}

.footer-content {
  display: flex;
  flex-wrap: nowrap; /* 避免多余换行 */
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 1;
  /*overflow: hidden;*/
}

.separator {
  color: #999;
  user-select: none;
  margin: 0 10px;
}

.footer-link {
  font-size: 16px;
  white-space: nowrap; /* 保持一行 */
}

</style>

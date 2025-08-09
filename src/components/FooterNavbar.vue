
<template>
  <div class="footer-navbar">
    <a href="https://cs.tongji.edu.cn/" target="_blank">
      <img src="../assets/LogosAndIcons/Tongji.png"
           alt="TongjiLogo"
           class="footer-logo"
           height="40"/>
    </a>

    <a href="https://github.com/mdsxf1029/Sports-reservation-frontend" target="_blank">
      <img src="../assets/LogosAndIcons/GitHub.png"
           alt="GithubLogo"
           class="footer-logo"
           height="40"/>
    </a>

    <div class='footer-content'>
      <p>
        <el-link :underline='false' class='footer-link' >
          关于我们
        </el-link>
        <span class="separator">|</span>
        <el-link :underline='false' class='footer-link' @click='showPrivacyPolicy=true'>
          隐私政策
        </el-link>
        <span class="separator">|</span>
        <el-link :underline='false' class='footer-link' @click='showDisclaimer=true'>
          免责声明
        </el-link>
        <span class="separator">|</span>
        <el-link :underline='false' class='footer-link' @click='showCodeOfConduct=true'>
          行为准则
        </el-link>
        <span class="separator">|</span>
        <el-link :underline='false' class='footer-link' @click='showContactUs=true'>
          联系我们
        </el-link>
        <span class="separator">|</span>
        <el-link :underline='false' class='footer-link' @click='showFeedback=true'>
          反馈
        </el-link>
      </p>
    </div>
  </div>

  <el-dialog>

  </el-dialog>

  <el-dialog>

  </el-dialog>

  <el-dialog>

  </el-dialog>

  <el-dialog>

  </el-dialog>

  <el-dialog>

  </el-dialog>
</template>

<script setup>
import {ref} from 'vue'
const showPrivacyPolicy= ref(false);
const showDisclaimer = ref(false);
const showCodeOfConduct = ref(false);
const showContactUs = ref(false);
const showFeedback = ref(false);

</script>

<style scoped>
.footer-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 70px;
  background: #ffffff;
  border-top: 1px solid #e9ecef;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 1000;
  
  /* 改为居中对齐样式 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  
  /* 确保所有子元素垂直居中 */
  line-height: 1;
  
  /* 阴影效果 */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-logo {
  margin-right: 15px;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.footer-logo:hover {
  opacity: 0.8;
}

.footer-logo img {
  vertical-align: middle;
}

.footer-navbar .footer-content {
  font-size: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  height: 100%;
  width: auto;
  max-width: none;
  margin: 0;
  padding: 0;
  gap: 0;
}

.footer-navbar .footer-content p {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1;
  height: 100%;
}

.footer-navbar .footer-link {
  font-size: 16px;
  color: #666;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  padding: 0;
  margin: 0;
}

.footer-navbar .footer-link:hover {
  color: #2062ea;
}

.footer-navbar .separator {
  color: #999;
  user-select: none;
  margin: 0 10px;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-navbar {
    justify-content: center;
    flex-direction: row;
    height: 70px;
    padding: 0 15px;
    gap: 10px;
  }
  
  .footer-logo {
    margin-right: 10px;
  }
  
  .footer-content p {
    justify-content: center;
    flex-direction: row;
    gap: 8px;
  }
  
  .separator {
    display: inline-flex;
  }
  
  .footer-link {
    font-size: 14px;
  }
}
</style>
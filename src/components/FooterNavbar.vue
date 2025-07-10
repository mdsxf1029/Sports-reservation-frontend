
<template>
  <el-container class="footer-navbar">
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
  </el-container>

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
.footer-navbar{
  position: relative;
  width: 100%;
  height: 70px;
  justify-content: center;
}

.footer-logo{
  margin-right: 10px;
  margin-top: 10px;
}

.footer-content{
  font-size:16px;
}

.separator {
  color: #999;
  user-select: none;
  margin-left: 10px;
  margin-right: 10px
}

.footer-link{
  font-size:16px;
}
</style>
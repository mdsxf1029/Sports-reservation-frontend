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
        <el-link :underline='false' class='footer-link' @click='showAboutUs=true'>关于我们</el-link>
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

  <!-- 关于我们对话框 -->
  <el-dialog
    v-model="showAboutUs"
    title="关于我们"
    width="500px"
    center
  >
    <div class="dialog-content">
      <h3>运动场馆预约平台</h3>
      <p>我们致力于为用户提供便捷、高效的运动场馆预约服务。</p>
      
      <h4>我们的使命</h4>
      <p>让每个人都能轻松找到并预约心仪的运动场地，享受健康快乐的运动时光。</p>
      
      <h4>核心功能</h4>
      <ul>
        <li>🏟️ 多样化场馆选择：篮球、羽毛球、乒乓球、健身房等</li>
        <li>📅 实时预约系统：查看场地可用时间，即时预约</li>
        <li>👥 社区互动：与其他运动爱好者交流分享</li>
        <li>💰 积分奖励：预约使用获得积分，兑换优惠</li>
      </ul>
      
      <h4>开发团队</h4>
      <p>同济大学计算机科学与技术学院学生团队倾力打造。</p>
    </div>
  </el-dialog>

  <!-- 隐私政策对话框 -->
  <el-dialog
    v-model="showPrivacyPolicy"
    title="隐私政策"
    width="600px"
    center
  >
    <div class="dialog-content">
      <h4>信息收集</h4>
      <p>我们仅收集为您提供服务所必需的信息：</p>
      <ul>
        <li>注册信息：邮箱、用户名等基本信息</li>
        <li>预约信息：场地预约记录、使用情况</li>
        <li>使用数据：登录时间、功能使用频率（匿名统计）</li>
      </ul>
      
      <h4>信息使用</h4>
      <p>您的信息仅用于：</p>
      <ul>
        <li>✅ 提供预约服务和账户管理</li>
        <li>✅ 改善平台功能和用户体验</li>
        <li>✅ 发送重要通知和服务更新</li>
        <li>❌ 绝不出售或共享给第三方</li>
      </ul>
      
      <h4>数据安全</h4>
      <p>我们采用行业标准的安全措施保护您的数据，包括加密存储、安全传输等。</p>
    </div>
  </el-dialog>

  <!-- 免责声明对话框 -->
  <el-dialog
    v-model="showDisclaimer"
    title="免责声明"
    width="550px"
    center
  >
    <div class="dialog-content">
      <h4>服务说明</h4>
      <p>本平台为场馆预约信息服务平台，我们努力确保信息准确，但不保证：</p>
      <ul>
        <li>场馆信息的绝对准确性和实时性</li>
        <li>服务的不间断性和完全可靠性</li>
        <li>预约成功后场馆方面的服务质量</li>
      </ul>
      
      <h4>用户责任</h4>
      <p>用户在使用本平台时需要：</p>
      <ul>
        <li>✅ 提供真实、准确的个人信息</li>
        <li>✅ 遵守场馆规定和预约时间</li>
        <li>✅ 文明使用平台功能</li>
        <li>❌ 不得恶意预约或扰乱秩序</li>
      </ul>
      
      <h4>责任限制</h4>
      <p>对于因使用本平台而产生的任何直接或间接损失，本平台不承担责任。如遇纠纷，请先与场馆方协商解决。</p>
    </div>
  </el-dialog>

  <!-- 行为准则对话框 -->
  <el-dialog
    v-model="showCodeOfConduct"
    title="行为准则"
    width="520px"
    center
  >
    <div class="dialog-content">
      <h4>🏅 做一个文明的运动者</h4>
      
      <h4>预约规范</h4>
      <ul>
        <li>🎯 按时到场，如需取消请提前操作</li>
        <li>🎯 一人一约，不得代他人大量预约</li>
        <li>🎯 爱护场地设施，保持环境整洁</li>
        <li>🎯 遵守场馆开放时间和使用规定</li>
      </ul>
      
      <h4>社区互动</h4>
      <ul>
        <li>💬 友善交流，互相尊重</li>
        <li>💬 分享真实的运动体验</li>
        <li>💬 不发布广告、垃圾信息</li>
        <li>💬 维护积极向上的社区氛围</li>
      </ul>
      
      <h4>违规处理</h4>
      <p>违反行为准则的用户可能面临：</p>
      <ul>
        <li>⚠️ 警告提醒</li>
        <li>⚠️ 限制预约功能</li>
        <li>⚠️ 暂停账户使用</li>
        <li>⚠️ 严重违规将永久封禁</li>
      </ul>
    </div>
  </el-dialog>

  <!-- 联系我们对话框 -->
  <el-dialog
    v-model="showContactUs"
    title="联系我们"
    width="450px"
    center
  >
    <div class="dialog-content">
      <h4>📞 多种联系方式</h4>
      
      <div class="contact-item">
        <h4>🎓 开发团队</h4>
        <p>同济大学计算机科学与技术学院</p>
      </div>
      
      <div class="contact-item">
        <h4>📧 邮件联系</h4>
        <p>技术支持：support@tongji-sports.cn</p>
        <p>商务合作：business@tongji-sports.cn</p>
      </div>
      
      <div class="contact-item">
        <h4>🕐 工作时间</h4>
        <p>周一至周五：9:00 - 18:00</p>
        <p>周末：10:00 - 16:00</p>
      </div>
      
      <div class="contact-item">
        <h4>🏠 地址</h4>
        <p>上海市杨浦区四平路1239号</p>
        <p>同济大学嘉定校区</p>
      </div>
      
      <div class="contact-item">
        <h4>🔗 在线支持</h4>
        <p>GitHub Issues: 报告技术问题</p>
        <p>用户反馈: 使用平台内反馈功能</p>
      </div>
    </div>
  </el-dialog>

  <!-- 反馈对话框 -->
  <el-dialog
    v-model="showFeedback"
    title="用户反馈"
    width="500px"
    center
  >
    <div class="dialog-content">
      <h4>💡 您的建议很重要</h4>
      <p>帮助我们改进平台，为您提供更好的服务！</p>
      
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="反馈类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
            <el-option label="功能建议" value="suggestion"></el-option>
            <el-option label="问题报告" value="bug"></el-option>
            <el-option label="使用体验" value="experience"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="详细描述">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的反馈内容..."
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        
        <el-form-item label="联系方式">
          <el-input
            v-model="feedbackForm.contact"
            placeholder="邮箱或手机号（选填，便于我们回复您）"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <div class="feedback-tips">
        <h4>💭 常见反馈类型</h4>
        <ul>
          <li>🔧 功能优化建议</li>
          <li>🐛 发现的问题或Bug</li>
          <li>🎨 界面设计改进</li>
          <li>📱 移动端体验</li>
          <li>⚡ 性能优化建议</li>
        </ul>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showFeedback = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog>

  </el-dialog>
</template>

<script setup>
import {ref} from 'vue'
import { ElMessage } from 'element-plus'

// 对话框显示状态
const showAboutUs = ref(false)
const showPrivacyPolicy = ref(false)
const showDisclaimer = ref(false)
const showCodeOfConduct = ref(false)
const showContactUs = ref(false)
const showFeedback = ref(false)

// 反馈表单数据
const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})

// 提交反馈
const submitFeedback = () => {
  if (!feedbackForm.value.type || !feedbackForm.value.content) {
    ElMessage.warning('请填写反馈类型和详细描述')
    return
  }
  
  // 这里可以调用API提交反馈
  console.log('反馈内容:', feedbackForm.value)
  
  ElMessage.success('反馈提交成功！感谢您的宝贵建议')
  
  // 重置表单并关闭对话框
  feedbackForm.value = {
    type: '',
    content: '',
    contact: ''
  }
  showFeedback.value = false
}
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

/* 对话框内容样式 */
.dialog-content {
  line-height: 1.6;
  color: #333;
}

.dialog-content h3 {
  color: #2062ea;
  margin-bottom: 15px;
  font-size: 20px;
}

.dialog-content h4 {
  color: #333;
  margin: 20px 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.dialog-content p {
  margin: 10px 0;
  color: #666;
}

.dialog-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.dialog-content li {
  margin: 8px 0;
  color: #555;
}

.contact-item {
  background: #f8f9fa;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
}

.contact-item h4 {
  margin: 0 0 8px 0;
  color: #2062ea;
}

.contact-item p {
  margin: 4px 0;
  color: #555;
}

.feedback-tips {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #d4edda;
}

.feedback-tips h4 {
  color: #0066cc;
  margin: 0 0 10px 0;
}

.feedback-tips ul {
  margin: 0;
  padding-left: 20px;
}

.feedback-tips li {
  margin: 5px 0;
  color: #555;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

</style>

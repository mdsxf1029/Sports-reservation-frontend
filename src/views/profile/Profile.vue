<template>
  <div class="all-page"> 
    <div class="main-content">
    <HeaderNavbar class="navbar"/>
    <div class = "top-bar"> 
        <!-- 背景图区域 -->
        <div class="profile-bg"></div>
        <!-- 个人信息卡片 -->
        <div class="profile-card">
            <img class="avatar" src="@/assets/Backgrounds/Flower2.jpg" alt="头像"/>
                <div class="profile-info">
                <div class="name">{{ userProfile.name }}</div>
                <div class="desc">{{ userProfile.id }} {{ userProfile.department }}</div>
            </div>
            <button class="edit-btn">编辑个人资料</button>
        </div>
    </div>
    <!-- Tab栏 -->
    <div class="tab-card">
        <div class="tabs">
        <span class="tab" :class="{active: activeTab === 'profile'}" @click="activeTab = 'profile'">个人资料</span>
        <span class="tab" :class="{active: activeTab === 'favorite'}" @click="activeTab = 'favorite'">收藏</span>
        <span class="tab" :class="{active: activeTab === 'reservation'}" @click="activeTab = 'reservation'">预约</span>
        <span class="tab" :class="{active: activeTab === 'points'}" @click="activeTab = 'points'">积分</span>
        <span class="tab" :class="{active: activeTab === 'notification'}" @click="activeTab = 'notification'">信息通知中心</span>
        
    </div>
        <div class="tab-content">
        <!-- 个人资料内容 -->
        <TabContent 
          v-if="activeTab === 'profile'" 
          title="个人资料" 
          :showAddButton="false"
        >
          <div class="profile-details">
            <div class="profile-section">
              <h3>基本信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>姓名：</label>
                  <span>{{ userProfile.name }}</span>
                </div>
                <div class="info-item">
                  <label>学号/工号：</label>
                  <span>{{ userProfile.id }}</span>
                </div>
                <div class="info-item">
                  <label>专业/部门：</label>
                  <span>{{ userProfile.department }}</span>
                </div>
                <div class="info-item">
                  <label>身份：</label>
                  <span>{{ userProfile.role }}</span>
                </div>
                <div class="info-item">
                  <label>邮箱：</label>
                  <span>{{ userProfile.email }}</span>
                </div>
                <div class="info-item">
                  <label>手机号：</label>
                  <span>{{ userProfile.phone }}</span>
                </div>
              </div>
            </div>
            
            <div class="profile-section">
              <h3>运动偏好</h3>
              <div class="preference-tags">
                <span v-for="sport in userProfile.sportsPreferences" :key="sport" class="preference-tag">
                  {{ sport }}
                </span>
              </div>
            </div>
            
            <div class="profile-section">
              <h3>个人简介</h3>
              <p class="bio">{{ userProfile.bio }}</p>
            </div>
            
            <div class="profile-section">
              <h3>统计信息</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ userProfile.stats.totalReservations }}</div>
                  <div class="stat-label">总预约次数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userProfile.stats.totalHours }}</div>
                  <div class="stat-label">运动总时长</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userProfile.stats.favoriteVenues }}</div>
                  <div class="stat-label">收藏场馆</div>
                </div>
              </div>
            </div>
          </div>
        </TabContent>
        
        <!-- 收藏内容 -->
        <TabContent 
          v-if="activeTab === 'favorite'" 
          title="我的收藏"
          :showAddButton="true"
          @add="addFavorite"
        >
          <FavoriteItem 
            v-for="(item, index) in favoriteList" 
            :key="index"
            :content="item.content"
            :removable="true"
            @remove="removeFavorite(index)"
          />
        </TabContent>
        
        <!-- 预约内容 -->
        <TabContent 
          v-if="activeTab === 'reservation'" 
          title="我的预约"
        >
          <ReservationItem 
            v-for="(item, index) in reservationList" 
            :key="index"
            :content="item.content"
            :status="item.status"
            :statusType="item.statusType"
          />
        </TabContent>
        
        <!-- 通知内容 -->
        <TabContent 
          v-if="activeTab === 'notification'" 
          title="信息通知中心"
        >
          <NotificationItem 
            v-for="(item, index) in notificationList" 
            :key="index"
            :content="item.content"
            :time="item.time"
            :isRead="item.isRead"
          />
        </TabContent>
        
        <!-- 积分内容 -->
        <TabContent 
          v-if="activeTab === 'points'" 
          title="我的积分"
          :showAddButton="false"
        >
          <div class="points-summary">
            <div class="current-points">
              <span class="points-label">当前积分</span>
              <span class="points-value">{{ currentPoints }}</span>
            </div>
          </div>
          <PointsItem 
            v-for="(item, index) in pointsList" 
            :key="index"
            :content="item.content"
            :pointsChange="item.pointsChange"
            :changeType="item.changeType"
            :time="item.time"
          />
        </TabContent>
        </div>
    </div>
    </div>
    <BackToTop/>
    <footer>
        <FooterNavbar/>
    </footer>
    </div>
</template>

<script>
import {ref} from 'vue'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import FooterNavbar from '@/components/FooterNavbar.vue'
import FavoriteItem from '@/components/profile/FavoriteItem.vue'
import ReservationItem from '@/components/profile/ReservationItem.vue'
import NotificationItem from '@/components/profile/NotificationItem.vue'
import PointsItem from '@/components/profile/PointsItem.vue'
import TabContent from '@/components/profile/TabContent.vue'
import BackToTop from '../../components/BackToTop.vue'

        
export default {
  components: { 
    HeaderNavbar, 
    FooterNavbar,
    FavoriteItem,
    ReservationItem,
    NotificationItem,
    PointsItem,
    TabContent,
    BackToTop
  },
  data() {
    return {
      activeTab: 'profile', // 默认显示个人资料选项卡
      currentPoints: 1250, // 当前积分总数
      
      // 用户个人资料数据
      userProfile: {
        name: '洗衣粉',
        id: '2354264',
        department: '软件工程',
        role: '学生',
        email: 'washingpowder@tongji.edu.cn',
        phone: '138****8888',
        sportsPreferences: ['篮球', '羽毛球', '跑步', '游泳'],
        bio: '热爱运动，享受健康生活。喜欢团队合作运动，也享受独自跑步的时光。希望通过运动结识更多志同道合的朋友。',
        stats: {
          totalReservations: 156,
          totalHours: '280小时',
          favoriteVenues: 8
        }
      },
      
      // 收藏数据
      favoriteList: [
        { content: '⭐ 羽毛球馆A - 环境优美，设施齐全' },
        { content: '⭐ 游泳馆B - 水质清澈，教练专业' }
      ],
      // 预约数据
      reservationList: [
        { content: '🏀 篮球场地 - 明天 15:00-17:00', status: '已确认', statusType: 'active' },
        { content: '🏊‍♂️ 游泳池 - 本周六 09:00-11:00', status: '待确认', statusType: 'pending' }
      ],
      // 通知数据
      notificationList: [
        { content: '📢 您的篮球场预约已确认', time: '30分钟前', isRead: false },
        { content: '💰 会员积分+50，继续加油！', time: '2小时前', isRead: true }
      ],
      // 积分数据
      pointsList: [
        { content: '完成篮球场预约', pointsChange: '+50', changeType: 'increase', time: '2小时前' },
        { content: '取消羽毛球预约', pointsChange: '-20', changeType: 'decrease', time: '1天前' },
        { content: '首次注册奖励', pointsChange: '+100', changeType: 'increase', time: '3天前' },
        { content: '连续签到奖励', pointsChange: '+30', changeType: 'increase', time: '5天前' }
      ]
    }
  },
  methods: {
    // 添加收藏
    addFavorite() {
      const newFavorite = {
        content: `⭐ 新收藏场馆 - ${new Date().toLocaleString()}`
      }
      this.favoriteList.unshift(newFavorite)
    },
    // 移除收藏
    removeFavorite(index) {
      this.favoriteList.splice(index, 1)
    }
  }
}
</script>

<style scoped>
/*全局样式*/
.all-page {
  display: flex; 
  min-height: 100vh;
  width: 100%; /* 改为100%而不是100vw */
  max-width: 100vw; /* 确保不超出视口 */
  margin: 0 auto;
  background: #F5F5F5;
  flex-direction: column;
  padding-top: 90px;   /* 顶栏高度+适当间距 */
  overflow-x: hidden; /* 防止水平溢出 */
  box-sizing: border-box; /* 确保padding计算在宽度内 */
} 
/* 顶栏导航 */
.navbar {
  width: 100%; /* 改为100%而不是99vw */
  position: fixed;
  margin: 0 auto;
  top: 0; 
  z-index: 100; /* 顶层 */
}
/* 主内容区域 */
.main-content {
  
  padding-top: 4px; /* 顶栏高度 */
}
/* 顶部工具栏 */
.top-bar {
  padding: 4px 24px;  
  max-width: 100%; /* 改为100%确保不超出容器 */
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box; /* 确保padding计算在宽度内 */
}
/* 背景图区域 */
.profile-bg { 
  height: 20vh;
  width: 90%;
  margin: 0 auto;
  background: url('@/assets/Backgrounds/Flower1.jpg') center/cover no-repeat; 
}
/* 个人信息卡片 */
.profile-card {
  position: relative;  
  width: 90%;
  margin: 0 auto 30px auto; /* 增加30px下边距 */
  background: #fff;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12); 
  border-radius: 12px; /* 圆角 */
  display: flex;
  align-items: center;
  padding: 30px ;
  box-sizing: border-box; /* padding包含在width内 */
  z-index: 10;
}

/* 头像样式 */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f7f7f7;
  margin-right: 32px;
  object-fit: cover;
}
/* 个人信息样式 */
.profile-info {
  flex: 1;
}
/* 个人信息文本样式 */
.name {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  margin-bottom: 6px;
}
/* 个人信息描述 */
.desc {
  font-size: 18px;
  color: #444;
}
/* 编辑按钮 */
.edit-btn {
  padding: 8px 20px;
  border: 1.5px solid #2062ea;
  background: #fff;
  color: #2062ea;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background .2s;
  margin-left: 20px;
}
/* 鼠标悬停效果 */
.edit-btn:hover {
  background: #f0f6ff;
}
/* Tab栏 */
.tab-card {
  width: 75%;
  margin: 0 auto 40px auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 20px 24px 32px 24px;
}
/* Tab标题样式 */
.tabs {
  display: flex;
  border-bottom: 1.5px solid #ececec;
  margin-bottom: 12px;
}
/* Tab按钮样式 */
.tab {
  margin-right: 48px;
  font-size: 17px;
  color: #222;
  cursor: pointer;
  padding: 8px 16px 6px 16px;
  transition: color .2s, border .2s;
  border-bottom: 2.5px solid transparent;
  border-radius: 4px;
}
/* Tab按钮悬停效果 */
.tab.active {
  color: #2062ea;
  border-bottom: 2.5px solid #2062ea;
  font-weight: 600;
}
/* Tab内容区 */
.tab-content {
  min-height: 200px;
}

/* 积分摘要样式 */
.points-summary {
  background: linear-gradient(135deg, #ff9500, #ffad33);
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 149, 0, 0.3);
}

.current-points {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-label {
  font-size: 18px;
  font-weight: 500;
}

.points-value {
  font-size: 32px;
  font-weight: bold;
}

/* 个人资料详情样式 */
.profile-details {
  padding: 0;
}

.profile-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.profile-section h3 {
  color: #2062ea;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8f4ff;
}

/* 信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
}

.info-item label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
  margin-right: 12px;
}

.info-item span {
  color: #333;
  font-size: 15px;
}

/* 运动偏好标签 */
.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preference-tag {
  background: linear-gradient(135deg, #2062ea, #4b82f6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(32, 98, 234, 0.3);
}

/* 个人简介 */
.bio {
  color: #666;
  line-height: 1.6;
  font-size: 15px;
  margin: 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #2062ea;
}

/* 统计信息网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #2062ea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}
/* 底部footer */
footer {
  margin-top: auto;
  width: 100%;
  text-align: center;
  padding: 8px 0 4px 0; /* 上下各10px和8px的内边距 */
  background: #FFF;
  font-size: 14px;
}

</style>

<template>
  <div>
    <HeaderNavbar class="header-navbar"/>
    <div id="content">
        <div class="center-card">
            <el-menu :default-active='activeIndex' class='order-navbar' mode='horizontal' :ellipsis='false'>
                <el-container>
                    <el-icon class="arrow-icon" @click="goBackToReservation"><ArrowLeft/></el-icon>
                    <h1>订单详情</h1>
                </el-container>
            </el-menu>
            <div v-if="orderDetail" class="card-container">
              <div class="card-left">
                <el-image
                  :src="orderDetail.venue.venue_picture_url"
                  fit="cover"
                  class="card-image"
                  :preview-src-list="[orderDetail.venue.venue_picture_url]"
                  preview-teleported
                />
                <h2>{{ orderDetail.venue.venue_name }}</h2>
                <div class="venue-location">
                  <el-link underline="never" class='location-link' @click="showVenueLocation = true">
                    <el-icon class="location-icon"><Location/></el-icon>
                    {{ orderDetail.venue.venue_location }}
                  </el-link>
                </div>
              </div>

              <div class="divider"></div>

              <div class="card-right">
                <div class="brief">
                  <h3>{{ orderDetail.venue.venue_type }}</h3>
                  <h4>最大容纳：{{ orderDetail.venue.venue_capacity }}人</h4>
                </div>
                <h5 class="date-weekday">
                  <span>{{ reservationInfo.dateStr }}</span>
                  <span>{{ reservationInfo.weekday }}</span>
                </h5>
                <h6 class="appointment">
                  <span>{{ orderDetail.venue.venue_subname }}</span> 
                  <span>{{ reservationInfo.timeRange }}</span>
                </h6>

                <hr class="divider-line" />

                <div class="bill">
                  <span>订单号：</span>
                  <span>{{ orderDetail.bill.bill_id }}</span>
                </div>
                <div class="bill">
                  <span>订单创建时间：</span>
                  <span>{{ reservationInfo.applyStr }}</span>
                </div>
                <div class="bill">
                  <span>支付方式：</span>
                  <span>现场支付</span>
                </div>
                <div class="bill">
                  <span>总计：</span>
                  <span>{{ orderDetail.bill.bill_amount }}元</span>
                </div>
                <div class="bill">
                  <span>预约人：</span>
                  <span>{{ orderDetail.user.user_id }} {{ orderDetail.user.user_name }}</span>
                </div>

                <div class="btn">
                  <el-button class="cancel" @click="goBackToReservation">取消预约</el-button>
                  <el-button class="confirm" @click="confirmReservation">确认预约</el-button>
                </div>

                <div class="notice">确认预约默认同意遵守各场馆管理规定，在现场管理人员的指导下开展活动。</div>
              </div>
            </div>
        </div>
    </div>
  </div>
  <div>
    <el-dialog
      v-model="visible"
      title="预约成功"
      width="30%"
      :center="true" 
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div style="display: flex; justify-content: center; margin-bottom: 10px;">
        <el-icon style="font-size: 72px; color: #2C7BE5;">
          <SuccessFilled />
        </el-icon>
      </div>
      <p style="text-align: center;font-size: 16px;">页面将在 {{ countdown }} 秒后跳转...</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowLeft, Location, SuccessFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { fetchOrderDetail, fetchConfirmInfo } from '../utils/api'
import HeaderNavbar from '../components/HeaderNavbar.vue'

const route = useRoute()
const router = useRouter()

const activeIndex = ref('0')
const orderDetail = ref(null)
const successDialogVisible = ref(false)
const visible = ref(false)
const countdown = ref(5)
let timer = null

const loadDetail = async () => {
  const id = route.params.id;
  try {
    const res = await fetchOrderDetail(id);
    orderDetail.value = res.data;
  } catch (err) {
    console.error('加载订单详情失败：', err);
  }
};

const formatReservationInfo = (begin, end, apply) => {
  const beginDate = new Date(begin)
  const endDate = new Date(end)
  const applyDate = new Date(apply)

  const dateStr = beginDate.toISOString().split('T')[0]
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekDays[beginDate.getDay()]

  const formatTime = (d) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  const timeRange = `${formatTime(beginDate)} - ${formatTime(endDate)}`

  const pad = (n) => n.toString().padStart(2, '0')
  const applyStr = `${applyDate.getFullYear()}-${pad(applyDate.getMonth() + 1)}-${pad(applyDate.getDate())} ${pad(applyDate.getHours())}:${pad(applyDate.getMinutes())}:${pad(applyDate.getSeconds())}`

  return {
    dateStr,
    applyStr,   
    weekday,
    timeRange
  }
} 

const reservationInfo = computed(() => {
  if (!orderDetail.value) return {}
  const { begin_time, end_time, apply_time } = orderDetail.value.appointment
  return formatReservationInfo(begin_time, end_time, apply_time)
})

const goBackToReservation = () => {
  router.back();
}

const confirmReservation = async () => {
  const id = route.params.id;
  try {
    const res = await fetchConfirmInfo(id)

    if (res.data.success) {
      visible.value = true
      countdown.value = 5

      timer = setInterval(() => {
        countdown.value--
        if (countdown.value == 0) {
          clearInterval(timer)
          router.push('/profile')
        }
      }, 1000)
    } else {
      ElMessage.error('预约失败：' + (res.data.message || '请重试'));
    } 
  } catch (err) {
    ElMessage.error('预约失败，网络异常');
  }
}

onMounted(() => {
  loadDetail();
})

</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 顶部导航栏 */
.header-navbar {
  position: fixed;
  z-index: 1000;
  width: 100%;
  top: 0;
  left: 0;
  height: 60px;
}

/* 具体内容 */
#content {
  background: rgba(154, 154, 154, 0.22);
  width: 100%;
  min-height: calc(100vh - 70px);
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 内容卡片 */
.center-card {
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 0 32px;
  min-width: 1400px;
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
}

/* 订单导航 */
.order-navbar {
  width: 100%;
  height: 100px;  
  display: flex;
  margin-bottom: 84px;
}

.arrow-icon {
  font-size: 32px;
  margin: 40px 20px 0 0;
  cursor: pointer;
}

h1 {
  font-size: 32px;
  margin : 30px 0;
}

/* 订单具体详情展示 */
.card-container {
  display: flex;
  align-items: stretch;
  gap: 20px;
}

.card-left, .card-right {
  flex: 1;
}

/* 订单左部分 */
.card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-image {
  width: 600px;
  height: 400px;
  object-fit: cover;
}

.location-icon {
  font-size: 20px;
  margin-right: 10px;
  vertical-align: middle;
}

.location-link {
  font-size: 18px;
}

h2 {
  font-size: 28px;
  margin : 30px 0;
}

/* 订单中间分割线 */
.divider {
  width: 1px;
  background-color: #ddd;
}

/* 订单右部分 */
.brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px 0 30px;
}

.brief h3,
.brief h4 {
  margin: 0;
}

h3 {
  font-size: 24px;
}

h4 {
  font-size: 22px;
  color: blue;
}

.date-weekday,
.appointment {
  display: flex;
  gap: 12px; 
  margin: 0;
  padding: 20px 30px 0 30px;
}

.date-weekday {
  font-size: 19px;
}

.appointment {
  font-size: 18px;
  color: grey;
}

/* 上下分隔线 */
.divider-line {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin: 30px 0;
  width: 100%;
}

/* 订单具体信息展示 */
.bill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  margin: 0;
  padding: 20px 30px 0 30px;
}

.bill span:first-child {
  font-weight: bold;
  color: black;
}

.bill span:last-child {
  text-align: right;
  color: black;
  flex-shrink: 0;
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 确认取消按钮 */
.btn {
  display: flex;
  justify-content: center;
  gap: 170px; 
  margin-top: 80px; 
}

.btn .el-button {
  padding: 22px 26px;
  font-size: 16px;
  border-radius: 14px;
  font-weight: 500;
  color: white;
}

.btn .cancel {
  background-color: #6C6C6C;
  color: #fff;
  border: none;
}

.btn .cancel:hover {
  background-color: #595959;
}

.btn .confirm {
  background-color: #0F40F5;
  color: #fff;
  border: none;
}

.btn .confirm:hover {
  background-color: #173ffc;
}

.notice {
  text-align: center; 
  font-size: 14px;    
  font-weight: normal;  
  color: grey;      
  margin: 25px 0;
}

/* 预约成功弹窗 */
::v-deep(.el-dialog__header) {
  font-size: 32px !important;
  font-weight: bold;
}
</style>

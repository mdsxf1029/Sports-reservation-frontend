<!-- CourtReservation.vue -->
<template>
  <div class="court-reservation">
    <!-- 顶部栏 -->
    <header class="header-bar">
      <el-button class="back-btn" type="text" @click="goBack">
        <el-icon style="font-size: 24px;">
          <ArrowLeft />
        </el-icon>
      </el-button>
      <div class="title">{{ venueName }}</div>
    </header>

    <!-- 主体区域 -->
    <main class="content-wrapper">
      <!-- 中间主要内容 -->
      <section class="main-panel">
        <!-- 日期选择栏 -->
        <div class="date-bar">
          <div
            v-for="(date, index) in weekDates"
            :key="index"
            :class="['date-item', { selected: index === selectedDate }]"
            @click="selectedDate = index"
          >
            {{ date.dateLabel }}
          </div>
        </div>

        <!-- 表格区域 -->
        <div class="court-grid">
          <div class="header-row">
            <div class="cell time-header"></div>
            <div class="cell" v-for="court in courts" :key="court">{{ court }}</div>
          </div>
          <div v-for="time in timeSlots" :key="time" class="row">
            <div class="cell time-cell">{{ time }}</div>
            <div
              v-for="court in courts"
              :key="court + time"
              :class="['cell', getStatusClass(court, time)]"
              @click="handleClick(court, time)"
            >🏸</div>
          </div>
        </div>

        <!-- 底部栏 -->
        <footer class="footer">
          <div class="summary">
            合计：¥{{ totalPrice }}元 ｜ 本周剩余 {{ remainingHours }} 小时 ｜ 今日剩余 {{ dailyLimit }} 次
          </div>
          <el-button class="confirm-btn" type="primary" @click="confirmBooking">确认预约</el-button>
        </footer>

        <!-- 弹窗 -->
        <el-dialog
          v-model="showPopup"
          title="选择成功"
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
          <p style="text-align: center;font-size: 16px;">页面将在 {{ countdown }} 秒后跳转订单详情页</p>
        </el-dialog>
      </section>

      <!-- 右侧图例 -->
      <aside class="legend">
        <div class="legend-item"><span class="color available"></span>未被选定</div>
        <div class="legend-item"><span class="color selected"></span>已选中</div>
        <div class="legend-item"><span class="color locked"></span>不可预约</div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ArrowLeft, SuccessFilled } from '@element-plus/icons-vue'
const router = useRouter()
const route = useRoute()


// 拿到前一页传来的球场名称，没有时显示默认
const venueName = route.query.venueName|| '未知球类场馆'

// 球场和时间段数据
//const courts = ref([])         
// 测试：场地列表
const courts = ref(['场地1', '场地2', '场地3', '场地4','场地5','场地6','小场地1', '小场地2'])

const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 获取今天的日期
const today = new Date()
// 生成从今天开始的连续 7 天（包含今天）
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(today.getDate() + i)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return {
    week: weekLabels[date.getDay()],
    dateLabel: `${mm}-${dd}`,         // 用于显示
    fullDate: `${yyyy}-${mm}-${dd}`   // 用于传后端
  }
})
const fullDate = computed(() => weekDates[selectedDate.value].fullDate)
const lockedCells = ref(new Set())
const selectedDate = ref(1)
const selectedCells = ref(new Set())
const dailyLimit = ref(2)
const remainingHours = ref(2)
const pricePerSlot = 20  // 测试每个时间段价格 ¥20
const totalPrice = ref(0)
const showPopup = ref(false)
const countdown = ref(5)
let timer = null
let orderId = null 

// 模拟接口拦截
const MOCK_MODE = true

if (MOCK_MODE) {
  const mockData = {}  // 模拟数据库

  window.fetch = async (url, options) => {
    // GET /api/get-locked-cells?date=XXXX
    if (url.startsWith('/api/get-locked-cells')) {
      const date = new URLSearchParams(url.split('?')[1]).get('date')
      return new Response(JSON.stringify({
        success: true,
        locked: mockData[date] || []
      }))
    }

    // POST /api/check-and-lock
    if (url === '/api/check-and-lock') {
      const body = JSON.parse(options.body)
      const { court_id, date, time_slot } = body
      mockData[date] = mockData[date] || []
      const exists = mockData[date].some(
        item => item.court_id === court_id && item.time_slot === time_slot
      )
      if (exists) {
        return new Response(JSON.stringify({
          success: false,
          message: '已被锁定'
        }))
      } else {
        mockData[date].push({ court_id, time_slot })
        return new Response(JSON.stringify({ success: true }))
      }
    }

    // POST /api/confirm-booking
    if (url === '/api/confirm-booking') {
      const body = JSON.parse(options.body)
      const { reservations } = body
      for (const r of reservations) {
        mockData[r.date] = mockData[r.date] || []
        mockData[r.date].push({ court_id: r.court_id, time_slot: r.time_slot })
      }
      return new Response(JSON.stringify({ success: true }))
    }

    // 默认返回
    return new Response(JSON.stringify({ success: false, message: 'Unknown API' }))
  }
}

//用户限制
async function loadUserLimitStatus() {
  try {
    const res = await fetch('/api/user-limit-status')
    const data = await res.json()
    if (data.success) {
      dailyLimit.value = data.daily_limit
      remainingHours.value = data.remaining_hours
    }
  } catch {
    alert('加载预约额度失败')
  }
}

// 场地列表
async function loadCourtsFromBackend() {
  try {
    const res = await fetch(`/api/venues?name=${encodeURIComponent(venueName)}`)
    const data = await res.json()
    if (data.success) {
      courts.value = data.venues.map(v => v.venue_subname)
    } else {
      alert('加载场地失败：' + data.message)
    }
  } catch (e) {
    alert('网络错误，无法加载场地')
  }
}

// 时间段列表
async function loadTimeSlotsFromBackend() {
  try {
    const res = await fetch('/api/time-slots')
    const data = await res.json()
    if (data.success) {
      timeSlots.splice(0, timeSlots.length, ...data.slots.map(slot => `${slot.begin_time}-${slot.end_time}`))
    } else {
      alert('加载时间段失败')
    }
  } catch (e) {
    alert('网络错误，无法加载时间段')
  }
}

//预约成功弹窗
function showSuccessPopup() {
  showPopup.value = true
  countdown.value = 5
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      goToOrders()
    }
  }, 1000)
}

// 跳转到“订单”页面
function goToOrders() {
  clearInterval(timer)
  showPopup.value = false
  if (orderId) {
    router.push(`/order/${orderId}`) 
  } else {
    alert('订单号缺失，跳转失败')
  }
}

// 返回上一页的函数
function goBack() {
  window.history.back()
}

//根据“当前格子是否被选中”来返回对应的 CSS 样式类名
function getStatusClass(court, time) {
  const key = `${court}-${time}`
  if (lockedCells.value.has(key) && !selectedCells.value.has(key)) {
    return 'locked'
  }
  return selectedCells.value.has(key) ? 'selected' : 'available'
}

// 点击一个格子时，切换选中/取消状态（不做异步锁定）
function toggleSelect(court, time) {
  const key = `${court}-${time}`
  if (selectedCells.value.has(key)) {
    selectedCells.value.delete(key)
    totalPrice.value -= pricePerSlot
    remainingHours.value += 1
    dailyLimit.value += 1
    return
  }
  if (selectedCells.value.size >= dailyLimit.value) {
    alert(`您的预约超过上限，最多预约 ${dailyLimit.value} 个时间段`)
    return
  }
  selectedCells.value.add(key)
  totalPrice.value += pricePerSlot
  remainingHours.value -= 1
  dailyLimit.value -= 1
}

//点击场地后显示
function handleClick(court, time) {
  const key = `${court}-${time}`
  if (lockedCells.value.has(key)) {
    alert('该场地已被预约，无法选择')
    return
  }
  toggleSelect(court, time)
}

//调用后端接口检查并锁定选中的场地和时间
/*async function checkAndLock(court, time) {
  const key = `${court}-${time}`
  try {
    const res = await fetch('/api/check-and-lock', {                                      //需要后端接口：检查是否锁定选中的场地和时间
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        venue_id: court, 
        date: fullDate.value, 
        time_slot: time,
      }),
    })
    const data = await res.json()
    if (data.success) {
      lockedCells.value.add(key)
      return true
    } else {
      alert(data.message || '该场地已被预约，无法选择')
      return false
    }
  } catch {
    alert('网络错误，请稍后再试')
    return false
  }
}*/

//点击预约按钮时，提交预约信息
//需要后端接口：确认预约
async function confirmBooking() {
  if (selectedCells.value.size === 0) {
    alert('请先选择时间段')
    return
  }

  const selectedList = Array.from(selectedCells.value).map(key => {
    const [court, time] = key.split('-')
    return {
      venue_id: court, 
      date: fullDate.value,
      time_slot: time
    }
  })

  try {
    const res = await fetch('/api/confirm-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservations: selectedList })
    })
    const data = await res.json()
    if (data.success) {
      // 存下 orderId
      orderId = data.order_id

      // 加入 lockedCells
      selectedList.forEach(item => {
        const key = `${item.venue_id}-${item.time_slot}`
        lockedCells.value.add(key)
      })

      selectedCells.value.clear()
      totalPrice.value = 0
      showSuccessPopup()
    } else {
      alert(data.message || '预约失败')
    }
  } catch (err) {
    alert('网络错误，请稍后再试')
  }
}

//调用后端接口获取指定日期的预约数据
async function loadLockedCells() {
  const date = fullDate.value
  try {
    const res = await fetch(`/api/get-locked-cells?date=${date}`)
    const data = await res.json()
    if (data.success) {
      // 清空原锁定格子
      lockedCells.value.clear()
      // 将后端返回的预约数据加入 lockedCells
      data.locked.forEach(item => {
        const key = `${item.court_id}-${item.time_slot}`
        lockedCells.value.add(key)
      })
    } else {
      alert(data.message || '加载预约信息失败')
    }
  } catch {
    alert('网络错误，加载预约信息失败')
  }
}

//增加监听 selectedDate 变化，加载当天预约
watch(selectedDate, async (newVal, oldVal) => {
  await loadLockedCells()
})
//页面加载时，调用一次初始化当前日期的锁定数据
onMounted(async () => {
  console.log('venueName:', venueName)
  console.log('weekDates:', weekDates)
  console.log('selectedDate:', selectedDate.value)
  console.log('courts:', courts.value)
  //await loadTimeSlotsFromBackend()   // 加载开放时间段
  //await loadCourtsFromBackend()     // 先加载场地列表
  //await loadLockedCells()           // 然后加载预约信息
})
</script>

<style scoped>
.court-reservation {
  font-family: "Segoe UI", sans-serif;
  background: #f7f9fb;
  padding: 1rem;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
  position: relative;
  background: #fff;
}

.back-btn {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: black;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.content-wrapper {
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  gap: 2rem;
}

.main-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.date-bar {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.date-item {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: #e6eaf3;
  cursor: pointer;
  transition: 0.2s;
}

.date-item.selected {
  background: #0f40f5;
  color: white;
}

.court-grid {
  overflow-x: auto;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
}

.row, .header-row {
  display: flex;
}

.cell {
  width: 100px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  border: 1px solid #eee;
}

.time-header, .time-cell {
  background: #f0f2f5;
  font-weight: 480;
}

.available {
  background: #e0f7fa;
  cursor: pointer;
}

.selected {
  background: #0f40f5;
  color: white;
}

.locked {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.95rem;
  color: #666;
}

.confirm-btn {
  background: #0f40f5;
  border: none;
}

.legend {
  width: 220px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  height: fit-content;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #444;
  font-size: 14px;
}

.color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #aaa;
}

.color.available {
  background: #e0f7fa;
}

.color.selected {
  background: #0f40f5;
}

.color.locked {
  background: #ccc;
}

::v-deep(.el-dialog__header) {
  font-size: 32px !important;
  font-weight: bold;
}
</style>
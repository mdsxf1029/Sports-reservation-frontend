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
        <!-- 黑名单提示 -->
        <div v-if="isBlacklisted" class="blacklist-banner">
          <el-icon style="margin-right: 6px; color: #d9534f;">
            <WarningFilled />
          </el-icon>
          <span>您已被加入黑名单，无法预约</span>
        </div>

        <!-- 日期选择栏 -->
        <div class="date-bar">
          <div v-for="(date, index) in weekDates" :key="index"
            :class="['date-item', { selected: index === selectedDate }]" @click="selectDate(index)">
            {{ date.dateLabel }}
          </div>
        </div>
        <!-- 表格区域 -->
        <div class="court-grid" :style="{ gridTemplateColumns: `120px repeat(${courts.length || 3}, 1fr)` }">
          <!-- 加载中骨架屏 -->
          <template v-if="isLoading">
            <!-- 表头骨架 -->
            <div class="header-row">
              <div class="cell time-header"></div>
              <div class="cell" v-for="n in 3" :key="'skeleton-head-' + n">
                <el-skeleton :rows="1" animated style="width: 80px" />
              </div>
            </div>

            <!-- 时间行骨架 -->
            <div v-for="n in 5" :key="'skeleton-row-' + n" class="row">
              <div class="cell time-cell">
                <el-skeleton :rows="1" animated style="width: 60px" />
              </div>
              <div v-for="m in 3" :key="'skeleton-cell-' + n + '-' + m" class="cell">
                <el-skeleton :rows="1" animated style="width: 30px" />
              </div>
            </div>
          </template>

          <!-- 真正的数据表格 -->
          <template v-else>
            <!-- 表头 -->
            <div class="header-row">
              <div class="cell time-header"></div>
              <div class="cell" v-for="court in courts" :key="court.id">{{ court.name }}</div>
            </div>
            <!-- 时间行 -->
            <div v-for="time in filteredTimeSlots" :key="time.id" class="row">
              <div class="cell time-cell">{{ time.label }}</div>
              <div v-for="court in courts" :key="court.id + '-' + time.id"
                :class="['cell', getStatusClass(court.id, time.id)]" @click="handleClick(court.id, time.id)">
                🕭
              </div>
            </div>
          </template>
        </div>

        <!-- 底部栏 -->
        <footer class="footer">
          <div class="summary">
            合计：¥{{ totalPrice }}元 ｜ 每日限额 {{ dailyLimit }} 小时 ｜ {{ formattedSelectedDate }} 剩余 {{ remainingHours }} 小时
          </div>

          <el-button class="confirm-btn" type="primary" @click="confirmBooking">确认预约</el-button>
        </footer>
        <!-- 弹窗 -->
        <el-dialog v-model="showPopup" title="选择成功" width="30%" :center="true" :close-on-click-modal="false"
          :show-close="false">
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

const lockedCache = new Map()
window.lockedCache = lockedCache
import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ArrowLeft, SuccessFilled } from '@element-plus/icons-vue'
import { AuthService } from '@/utils/auth.js'
import axios from 'axios'

const isLoading = ref(true)
const router = useRouter()
const route = useRoute()
// 拿到前一页传来的球场名称，没有时显示默认
const venueName = route.query.venueName || '未知球类场馆'
// 球场和时间段数据
const courts = ref([])
const timeSlots = ref([])
const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 获取今天的日期
const today = new Date()
// 生成从今天开始的连续 7 天（包含今天）
const selectedDate = ref(0)
const filteredTimeSlots = computed(() => {
  return timeSlots.value
    .filter(slot => {
      const slotDate = slot.begin_time.split(' ')[0].replace(/\//g, '-') // 例如 "2025-08-27"
      return slotDate === weekDates[selectedDate.value].fullDate
    })
    .map(slot => {
      const begin = slot.begin_time.split(' ')[1].slice(0, 5)
      const end = slot.end_time.split(' ')[1].slice(0, 5)
      return {
        id: slot.time_slot_id,
        label: `${begin} - ${end}`,
        ...slot
      }
    })
})
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const date = new Date()
  date.setDate(today.getDate() + i)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return {
    week: weekLabels[date.getDay()],
    dateLabel: `${mm}-${dd}`,
    fullDate: `${yyyy}-${mm}-${dd}`
  }
})
const fullDate = computed(() => weekDates[selectedDate.value].fullDate)
const lockedCells = ref(new Set())
//const selectedDate = ref(1)
const selectedCells = ref(new Set())
const dailyLimit = ref(2)
const remainingHours = ref(2)
const pricePerSlot = ref(0)
const totalPrice = ref(0)
const showPopup = ref(false)
const countdown = ref(3)
const isBlacklisted = ref(false)

let timer = null
let orderId = null

window.lockedCache = lockedCache
window.lockedCells = lockedCells
window.fullDate = fullDate
window.loadLockedCells = loadLockedCells

//将选中的日期格式化
const formattedSelectedDate = computed(() => {
  if (!weekDates[selectedDate.value]) return ''
  const dateStr = weekDates[selectedDate.value].fullDate
  const dateObj = new Date(dateStr)
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}月${day}日`
})

//获取场地价格
async function loadVenuePrice(venueId) {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('/api/venues/get', {
      params: {
        page: 1,
        pageSize: 10,
        keyword: venueName,   // 用场馆名称搜索
        status: '',           // 不限制开/关状态
        type: ''              // 不限制类型
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // 精确找到对应场地
    const venue = res.data?.data?.list?.find(v => v.id === venueId)
    if (venue) {
      pricePerSlot.value = venue.price
      console.log("获取价格成功:", venue.price)
    } else {
      console.warn("未找到目标场地:", venueId)
    }
  } catch (err) {
    console.error("获取场地价格失败:", err)
  }
}

//记录用户选择的日期,清空之前选择的场地时间段
async function selectDate(index) {
  selectedDate.value = index
  selectedCells.value.clear()
  totalPrice.value = 0
  //await loadLockedCells()
}

//用户限制
async function loadUserLimitStatus(useMock = true, date) {
  if (useMock) {
    dailyLimit.value = 2
    remainingHours.value = 2
    return
  }

  try {
    const res = await axios.post(
      '/api/courtreservation/user-limit-status',
      { date },   // 使用传入的所选日期
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = res.data
    if (data.success) {
      dailyLimit.value = data.dailyLimit
      remainingHours.value = data.remainingHours
    }
  } catch (err) {
    console.error(err)
    alert('加载预约额度失败')
  }
}

// 场地列表
async function loadCourtsFromBackend() {
  const cacheKey = `courts_${venueName}`

  // 先尝试读缓存
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      courts.value = JSON.parse(cached)
      return   // 命中缓存直接返回，不再请求接口
    } catch (err) {
      console.warn("缓存解析失败:", err)
    }
  }

  // 如果没有缓存，再请求接口
  try {
    const res = await axios.get('/api/venues', {
      params: { name: venueName },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = res.data
    if (data.success) {
      courts.value = data.venues.map(v => ({
        id: v.venue_id,
        name: v.venue_subname
      }))

      // 写缓存
      sessionStorage.setItem(cacheKey, JSON.stringify(courts.value))
    } else {
      alert("加载场地失败：" + data.message)
    }
  } catch (e) {
    console.error("加载场地错误:", e)
    alert("网络错误，无法加载场地")
  }
}

// 时间段列表
async function loadTimeSlotsFromBackend() {
  const cacheKey = "timeSlots_cache"
  const cacheTTL = 1000 * 60 * 60 // 缓存 1 小时

  //先读缓存
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < cacheTTL) {
        timeSlots.value = data
        //console.log("使用缓存的 timeSlots")
        return // 命中缓存直接返回
      }
    } catch (err) {
      console.warn("缓存解析失败:", err)
    }
  }

  // 没缓存 / 缓存过期 → 请求接口
  try {
    const res = await axios.get('/api/courtreservation/time-slots', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = res.data
    if (data.success && Array.isArray(data.slots)) {
      timeSlots.value = data.slots.map(slot => ({
        time_slot_id: slot.time_slot_id,
        begin_time: slot.begin_time,
        end_time: slot.end_time
      }))

      // 写缓存
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: timeSlots.value,
          timestamp: Date.now()
        })
      )
    } else {
      alert("加载时间段失败：返回格式不符合预期")
    }
  } catch (e) {
    console.error("加载时间段错误:", e)
    alert("网络错误，无法加载时间段")
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
function getStatusClass(courtId, timeId) {
  const key = `${courtId}-${timeId}`
  if (lockedCells.value.has(key) && !selectedCells.value.has(key)) {
    return 'locked'
  }
  return selectedCells.value.has(key) ? 'selected' : 'available'
}

// 点击一个格子时，切换选中/取消状态（不做异步锁定）
function toggleSelect(courtId, timeId) {
  const key = `${courtId}-${timeId}`
  const selectedList = Array.from(selectedCells.value).map(key => {
    const [courtId, timeSlotId] = key.split('-')
    const courtObj = courts.value.find(c => c.id == courtId)
    return {
      venueId: parseInt(courtId),
      venueSubname: courtObj ? courtObj.name : '',
      date: fullDate.value,
      timeSlotId: parseInt(timeSlotId),
      status: "upcoming"
    }
  })
  if (selectedCells.value.has(key)) {
    selectedCells.value.delete(key)
    totalPrice.value -= pricePerSlot.value
    remainingHours.value = Math.max(0, remainingHours.value + 1)  // 每次取消增加 1
  } else {
    selectedCells.value.add(key)
    totalPrice.value += pricePerSlot.value
    remainingHours.value = Math.max(0, remainingHours.value - 1)  // 每次选中减少 1
  }
}

//检查用户是否在黑名单中
async function checkBlacklist() {
  try {
    const res = await axios.get('/api/blacklist?page=1&pageSize=100', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const list = res.data?.data || []
    const userId = localStorage.getItem('userId') // 登录时存储的用户 ID

    // 查找当前用户是否在黑名单，且状态有效
    const record = list.find(item => item.userId == userId && item.bannedStatus === 'valid')

    if (record) {
      isBlacklisted.value = true
      blacklistReason.value = record.bannedReason || '违规操作'
      console.warn("用户在黑名单中:", record)
    } else {
      isBlacklisted.value = false
    }
  } catch (err) {
    console.error("获取黑名单失败:", err)
  }
}

//点击场地后显示
async function handleClick(courtId, timeId) {

  if (isBlacklisted.value) {
    alert(`您已被加入黑名单，无法预约`)
    return
  }
  const key = `${courtId}-${timeId}`

  if (lockedCells.value.has(key)) {
    alert('该场地已被预约，无法选择')
    return
  }

  // 判断剩余次数
  if (!selectedCells.value.has(key)) {
    if (remainingHours.value <= 0) {
      const date = weekDates[selectedDate.value].fullDate
      alert(`${date} 的预约时长已用完`)
      return
    }
  }

  // 如果已经选过一个，再点新的，直接提示
  if (selectedCells.value.size >= 1 && !selectedCells.value.has(key)) {
    alert('每次预约仅限一个场地的一个时段')
    return
  }
  // 先在前端切换选中状态（立即变蓝）
  toggleSelect(courtId, timeId)

  // 异步调用后端接口校验锁定
  const courtObj = courts.value.find(c => c.id == courtId)
  const body = {
    venueId: parseInt(courtId),
    venueSubname: courtObj ? courtObj.name : '',
    date: fullDate.value,
    timeSlotId: parseInt(timeId)
  }

  try {
    const authResult = AuthService.checkLoginStatus()
    if (!authResult.isValid) {
      toggleSelect(courtId, timeId)
      AuthService.handleAuthFailure(authResult.reason, router)
      return
    }

    const res = await axios.post('/api/courtreservation/check', body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const data = res.data

    if (!data.success) {
      // 已被锁定 → 回滚 UI
      toggleSelect(courtId, timeId) // 撤销选中状态
      alert(data.message || "该时段已被锁定")

      // 刷新 lockedCells 保持前端状态与后端一致
      await loadLockedCells(fullDate.value, true)
    }
  } catch (err) {
    // 网络异常 → 回滚
    toggleSelect(courtId, timeId)
    alert("网络错误，请稍后重试")
  }
}

//调用后端接口检查并锁定选中的场地和时间,拉取某天所有已锁定的格子,定义缓存
async function loadLockedCells(date, forceReload = false) {
  try {
    const cacheKey = `locked_${date}`

    if (!forceReload) {
      // 1. 优先从 sessionStorage 取缓存
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const cells = JSON.parse(cached)
          lockedCells.value = new Set(cells)
          // 顺便写进内存缓存
          lockedCache.set(date, cells)
          return
        } catch (err) {
          console.warn("锁定数据缓存解析失败:", err)
        }
      }

      // 2. 内存缓存兜底
      if (lockedCache.has(date)) {
        lockedCells.value = new Set(lockedCache.get(date))
        return
      }
    }

    // 3. 请求接口获取最新锁定数据
    const authResult = AuthService.checkLoginStatus()
    if (!authResult.isValid) {
      toggleSelect(courtId, timeId)
      AuthService.handleAuthFailure(authResult.reason, router)
      return
    }

    const res = await axios.get('/api/courtreservation/get-locked-cells', {
      params: { date },
      headers: {
        accept: "*/*",
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const data = res.data
    if (data.success) {
      const cells = data.locked.map(item => `${item.venue_id}-${item.time_slot_id}`)

      // 更新内存缓存
      lockedCache.set(date, cells)

      // 更新 sessionStorage 持久缓存
      sessionStorage.setItem(cacheKey, JSON.stringify(cells))

      // 更新响应式数据
      // 更新响应式数据
      lockedCells.value.clear()
      cells.forEach(cell => lockedCells.value.add(cell))
    } else {
      console.warn("接口返回失败:", data.message)
      alert(data.message || "获取锁定信息失败")
    }
  } catch (err) {
    console.error("网络错误:", err)
    alert("网络错误，请稍后再试")
  }
}

//点击预约按钮时，提交预约信息
async function confirmBooking() {
  if (selectedCells.value.size === 0) {
    alert('请先选择时间段')
    return
  }

  const selectedList = Array.from(selectedCells.value).map(key => {
    const [courtId, timeSlotId] = key.split('-')
    const courtObj = courts.value.find(c => c.id == courtId)
    return {
      venueId: parseInt(courtId),
      venueSubname: courtObj ? courtObj.name : '',
      date: fullDate.value,
      timeSlotId: parseInt(timeSlotId),
      status: "upcoming"
    }
  })

  try {
    const authResult = AuthService.checkLoginStatus()
    if (!authResult.isValid) {
      AuthService.handleAuthFailure(authResult.reason, router)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      return
    }

    const res = await axios.post(
      '/api/courtreservation/confirm-booking',
      {
        success: true,
        appointments: selectedList
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = res.data

    if (data.success) {
      orderId = data.appointment_id

      // 1. 等待锁定状态刷新完成
      await loadLockedCells(fullDate.value, true) // forceReload = true，强制刷新

      // 2. 再清空选中格子和更新 UI
      selectedCells.value.clear()

      // 3. 弹窗提示
      showSuccessPopup()
    } else {
      alert(data.message || '预约失败')
    }
  } catch (err) {
    console.error(err)
    alert('网络错误，请稍后再试')
  }
}

// 页面加载时初始化数据
onMounted(async () => {
  isLoading.value = true
  await Promise.allSettled([
    loadCourtsFromBackend(),
    loadTimeSlotsFromBackend(),
  ])
  isLoading.value = false

  // 如果路由带了 date 参数，优先选中
  if (route.query.date) {
    const index = weekDates.findIndex(d => d.fullDate === route.query.date)
    if (index !== -1) {
      selectedDate.value = index
    }
  }

  // 初始化锁定格子
  await loadLockedCells(fullDate.value, true)

  // 初始化时查额度，传 fullDate.value
  await loadUserLimitStatus(false, fullDate.value)
  if (courts.value.length > 0) {
    await loadVenuePrice(courts.value[0].id)
  }
  // 页面加载时检查黑名单
  await checkBlacklist()

  // 如果在黑名单，给个提示（可选）
  if (isBlacklisted.value) {
    alert(`您已被加入黑名单，无法预约\n原因：${blacklistReason.value}`)
  }
})

// watch：切换日期时，自动走缓存
watch(selectedDate, async newVal => {
  const date = weekDates[newVal].fullDate
  selectedCells.value.clear()
  totalPrice.value = 0
  await loadLockedCells(date)
  await loadUserLimitStatus(false, date)
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

.blacklist-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff3f3;
  color: #d9534f;
  border: 1px solid #f5c2c7;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
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
  display: grid;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
}

.header-row,
.row {
  display: contents;
  /* 让子元素跟随 grid 分布 */
}

.cell {
  min-width: 80px;
  height: 48px;
  line-height: 48px;
  text-align: center;
  border: 1px solid #eee;
}

.time-header,
.time-cell {
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

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
          <div v-for="(date, index) in weekDates" :key="index"
            :class="['date-item', { selected: index === selectedDate }]" @click="selectDate(index)">
            {{ date.dateLabel }}
          </div>
        </div>
        <!-- 表格区域 -->
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
            合计：¥{{ totalPrice }}元 ｜ 本周剩余 {{ remainingHours }} 小时 ｜ 今日剩余 {{ dailyLimit }} 次
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

//console.log('route.query.date =', route.query.date)

import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ArrowLeft, SuccessFilled } from '@element-plus/icons-vue'

const isLoading = ref(true)
const router = useRouter()
const route = useRoute()
// 拿到前一页传来的球场名称，没有时显示默认
const venueName = route.query.venueName || '未知球类场馆'
// 球场和时间段数据
const courts = ref([])
const timeSlots = ref([])
// 测试：场地列表
//const courts = ref(['场地1', '场地2', '场地3', '场地4', '场地5', '场地6', '小场地1', '小场地2'])
//const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00']
const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 获取今天的日期
const today = new Date()
// 生成从今天开始的连续 7 天（包含今天）
const selectedDate = ref(0)
const filteredTimeSlots = computed(() => {
  return timeSlots.value
    .filter(slot => {
      const slotDate = slot.begin_time.split(' ')[0].replace(/\//g, '-') // 例如 "2025-08-27"
      // 这里用 weekDates[selectedDate.value].fullDate 来比对
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
    dateLabel: `${mm}-${dd}`,         // 用于显示
    fullDate: `${yyyy}-${mm}-${dd}`   // 用于传后端
  }
})
const fullDate = computed(() => weekDates[selectedDate.value].fullDate)
const lockedCells = ref(new Set())
//const selectedDate = ref(1)
const selectedCells = ref(new Set())
const dailyLimit = ref(2)
const remainingHours = ref(2)
const pricePerSlot = 20  // 测试每个时间段价格 ¥20
const totalPrice = ref(0)
const showPopup = ref(false)
const countdown = ref(5)
let timer = null
let orderId = null

window.lockedCache = lockedCache
window.lockedCells = lockedCells
window.fullDate = fullDate
window.loadLockedCells = loadLockedCells

async function selectDate(index) {
  selectedDate.value = index
  selectedCells.value.clear()
  totalPrice.value = 0
  //await loadLockedCells()
}
/*
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
  */
//用户限制
// 用户限制
async function loadUserLimitStatus(useMock = true) {
  if (useMock) {
    // 写死测试数据
    dailyLimit.value = 2
    remainingHours.value = 2
    return
  }

  // 调接口
  try {
    const res = await fetch('http://47.83.188.207:5101/api/user-limit-status')
    const data = await res.json()
    if (data.success) {
      dailyLimit.value = data.daily_limit
      remainingHours.value = data.remaining_hours
    }
  } catch {
    alert('加载预约额度失败')
  }
}

async function login() {
  const res = await fetch("http://47.83.188.207:5101/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "user",
      email: "2147896541@qq.com",
      password: "12345678",
      way: 0,
    }),
  })

  const result = await res.json()
  if (result.code === 0) {
    const { userId, token, userName } = result.data

    // 存到 localStorage
    localStorage.setItem("userId", userId)
    localStorage.setItem("token", token)
    localStorage.setItem("userName", userName)

    console.log("登录成功，已保存 userId 和 token:", userId, token)
  } else {
    console.error("登录失败:", result.msg)
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
      return   // ✅ 命中缓存直接返回，不再请求接口
    } catch (err) {
      console.warn("缓存解析失败:", err)
    }
  }

  // 如果没有缓存，再请求接口
  try {
    const res = await fetch(
      `http://47.83.188.207:5101/api/venues?name=${encodeURIComponent(venueName)}`
    )
    const data = await res.json()
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
    const res = await fetch("http://47.83.188.207:5101/api/courtreservation/time-slots")
    if (!res.ok) {
      throw new Error("网络响应失败")
    }
    const data = await res.json()
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
  if (selectedCells.value.has(key)) {
    selectedCells.value.delete(key)
    totalPrice.value -= pricePerSlot
  } else {
    selectedCells.value.add(key)
    totalPrice.value += pricePerSlot
  }
}

//点击场地后显示
async function handleClick(courtId, timeId) {
  const key = `${courtId}-${timeId}`

  if (lockedCells.value.has(key)) {
    alert('该场地已被预约，无法选择')
    return
  }

  // ✅ 判断剩余次数
  if (!selectedCells.value.has(key)) {
    if (dailyLimit.value <= 0) {
      alert('今天的预约次数已用完')
      return
    }
    if (remainingHours.value <= 0) {
      alert('本周的预约时长已用完')
      return
    }
  }

  // 如果已经选过一个，再点新的，直接提示
  if (selectedCells.value.size >= 1 && !selectedCells.value.has(key)) {
    alert('一次只能选择一个场地')
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
    //const token =localStorage.getItem('authToken') ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDEiLCJ1bmlxdWVfbmFtZSI6IuWYv-WYvyIsImVtYWlsIjoiMjE0Nzg5NjU0MUBxcS5jb20iLCJyb2xlIjoibm9ybWFsIiwibmJmIjoxNzU2ODcwNjgzLCJleHAiOjE3NTY4NzQyODMsImlhdCI6MTc1Njg3MDY4MywiaXNzIjoiWW91cklzc3VlciIsImF1ZCI6IllvdXJBdWRpZW5jZSJ9.oL2dJcupcT-IYu5X8MutDkfTeQPzlLX5CVi8HyMnE8o'
    const token = localStorage.getItem('token')
    const res = await fetch("http://47.83.188.207:5101/api/courtreservation/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()

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

//调用后端接口检查并锁定选中的场地和时间
// 拉取某天所有已锁定的格子
// 定义缓存
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
    //const yourToken =localStorage.getItem("authToken") ||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDEiLCJ1bmlxdWVfbmFtZSI6IuWYv-WYvyIsImVtYWlsIjoiMjE0Nzg5NjU0MUBxcS5jb20iLCJyb2xlIjoibm9ybWFsIiwibmJmIjoxNzU2ODcwNjgzLCJleHAiOjE3NTY4NzQyODMsImlhdCI6MTc1Njg3MDY4MywiaXNzIjoiWW91cklzc3VlciIsImF1ZCI6IllvdXJBdWRpZW5jZSJ9.oL2dJcupcT-IYu5X8MutDkfTeQPzlLX5CVi8HyMnE8o"
    const yourToken = localStorage.getItem('token')
    const url = `http://47.83.188.207:5101/api/courtreservation/get-locked-cells?date=${date}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${yourToken}`,
      },
    })

    const data = await res.json()
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
//需要后端接口：确认预约
//调用后端接口获取指定日期的预约数据
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
    //const token = localStorage.getItem('access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDEiLCJ1bmlxdWVfbmFtZSI6IuWYv-WYvyIsImVtYWlsIjoiMjE0Nzg5NjU0MUBxcS5jb20iLCJyb2xlIjoibm9ybWFsIiwibmJmIjoxNzU2ODcwNjgzLCJleHAiOjE3NTY4NzQyODMsImlhdCI6MTc1Njg3MDY4MywiaXNzIjoiWW91cklzc3VlciIsImF1ZCI6IllvdXJBdWRpZW5jZSJ9.oL2dJcupcT-IYu5X8MutDkfTeQPzlLX5CVi8HyMnE8o'
    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      return
    }

    const res = await fetch('http://47.83.188.207:5101/api/courtreservation/confirm-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        success: true,
        appointments: selectedList
      })
    })

    if (res.status === 401) {
      alert('Token 已过期，请重新登录')
      return
    }

    const data = await res.json()
    if (data.success) {
      orderId = data.appointment_id

      // 1. 等待锁定状态刷新完成
      await loadLockedCells(fullDate.value, true) // forceReload = true，强制刷新

      // 2. 再清空选中格子和更新 UI
      selectedCells.value.clear()
      totalPrice.value = 0
      dailyLimit.value = Math.max(0, dailyLimit.value - 1)
      remainingHours.value = Math.max(0, remainingHours.value - selectedList.length)

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

onMounted(async () => {
  await login()
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
  loadUserLimitStatus(true)  // true = 写死数据，false = 调接口

})



// watch：切换日期时，自动走缓存
watch(selectedDate, async newVal => {
  const date = weekDates[newVal].fullDate
  selectedCells.value.clear()
  totalPrice.value = 0
  await loadLockedCells(date)
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

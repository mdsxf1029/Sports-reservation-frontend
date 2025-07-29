<!-- CourtReservation.vue -->
<template>
  <div class="header-bar">
    <el-button class="back-btn" type="text" @click="goBack">
      <el-icon style="font-size: 24px;"><ArrowLeft /></el-icon>
        <div class="title">{{ venueName }}</div>
      </el-button>   
  </div>

  <div class="container">
    <div class="main-content">
      <!-- 日期选择栏 -->
      <div class="date-bar">
        <div
          v-for="(date, index) in weekDates"
          :key="index"
          :class="['date-item', { selected: index === selectedDate }]"
          @click="selectedDate = index"
        >
          <div>{{ date.dateLabel }}</div>
        </div>
      </div>

      <!-- 预约成功弹窗 -->
      <div v-if="showPopup" class="popup">
        <div class="popup-content">
          <p>{{ countdown }} 秒后返回“我的订单”页面</p>
          <button @click="goToOrders">立即前往</button>
        </div>
      </div>

      <!-- 预约表格 -->
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
          >
            🏸
          </div>
        </div>
      </div>

      <!-- 底部汇总和按钮 -->
      <div class="footer">
        <div class="summary">
          合计：¥{{ totalPrice }}元 本周剩余 {{ remainingHours }} 小时，今日剩余 {{ dailyLimit }} 次
        </div>
        <button class="confirm-btn" @click="confirmBooking">确认预约</button>
      </div>
    </div>

    <!-- 右侧图例说明区 -->
    <div class="legend">
      <div class="legend-item">
        <div class="color-box available"></div>
        <span>浅蓝色 - 未被选定</span>
      </div>
      <div class="legend-item">
        <div class="color-box locked"></div>
        <span>灰色 - 已被选定</span>
      </div>
      <div class="legend-item">
        <div class="color-box selected"></div>
        <span>深蓝色 - 预选中</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
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

// 点击一个格子时，切换它的“选中/未选中”状态，最多只能选中两个格子
async function toggleSelect(court, time) {
  const key = `${court}-${time}`
  if (selectedCells.value.has(key)) {
    selectedCells.value.delete(key)
    totalPrice.value -= pricePerSlot  // 减去价格
    return
  }
  if (selectedCells.value.size >= dailyLimit.value) {
    alert(`您的预约超过上限，最多预约 ${dailyLimit.value} 个时间段`)
    return
  }
  const locked = await checkAndLock(court, time)
  if (locked) {
    selectedCells.value.add(key)
    totalPrice.value += pricePerSlot  // 增加价格
     remainingHours.value -= 1         // 预约后减少剩余小时
    dailyLimit.value -= 1             // 预约后减少当日可预约次数
  }
}

//点击场地后显示
function handleClick(court, time) {
  const key = `${court}-${time}`
  if (lockedCells.value.has(key)) {
    alert('该场地已被预约，无法选择')
  } else {
    toggleSelect(court, time)
  }
}

//调用后端接口检查并锁定选中的场地和时间
async function checkAndLock(court, time) {
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
}

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
/* 右侧图标容器样式 */
.legend {
  width: 400px;                 /* 固定宽度 */
  border: 1px solid #ccc;       /* 边框颜色和样式 */
  padding: 12px;                /* 内边距 */
  border-radius: 8px;           /* 圆角 */
  font-size: 14px;              /* 字体大小 */
  user-select: none;            /* 禁止文本选中 */
  background: #fafafa;          /* 背景色 */
  height: fit-content;          /* 高度适应内容 */
  margin-top: 50px;             /* 顶部外边距 */
  margin-left: 60px;            /* 左侧外边距 */
}
.legend-item span {
  white-space: nowrap; /* 不允许换行 */
}

/* 图例中每一项的样式，水平排列 */
.legend-item {
  display: flex;                /* 使用弹性盒模型 */
  align-items: center;          /* 垂直居中对齐 */
  margin-bottom: 10px;          /* 底部外边距 */
}

/* 颜色方块基础样式 */
.color-box {
  width: 24px;                  /* 宽度 */
  height: 24px;                 /* 高度 */
  border-radius: 4px;           /* 圆角 */
  margin-right: 8px;            /* 右边距，和文字分开 */
  border: 1px solid #999;       /* 边框颜色 */
}

/* 颜色方块-可用状态 */
.color-box.available {
  background: #e0f7fa;          /* 浅蓝色背景 */
}

/* 颜色方块-锁定状态 */
.color-box.locked {
  background: #ddd;             /* 灰色背景 */
}

/* 颜色方块-选中状态 */
.color-box.selected {
  background: #0F40F5;          /* 深蓝色背景 */
  border-color: #0F40F5;        /* 边框颜色同背景 */
}

/* 顶部标题栏容器 */
.header-bar {
  display: flex;                /* 弹性盒布局 */
  align-items: center;          /* 垂直居中 */
  position: relative;           /* 方便定位子元素 */
  height: 70px;                 /* 高度 */
  border-bottom: 1px solid #ddd; /* 底部边框 */
  margin-bottom: 0rem;          /* 底部外边距 */
}

/* 返回按钮样式 */
.back-btn {
  position: absolute;           /* 绝对定位 */
  left: 10px;                  /* 左侧距离 */
  background-color: transparent; /* 背景透明 */
  border: none;                /* 无边框 */
  color: #000000;              /* 黑色字体 */
  font-size: 16px;             /* 字体大小 */
  cursor: pointer;             /* 鼠标样式为指针 */
  z-index: 10;                 /* 保证层级在上 */
}

/* 标题文字样式 */
.title {
  flex: 1;                     /* 占满剩余空间 */
  text-align: center;          /* 居中对齐文字 */
  font-weight: 600;            /* 加粗 */
  font-size: 26px;             /* 字体大小 */
  margin-left: 10px;
  margin-top: 10px;
}

/* 主容器，左右布局 */
.container {
  display: flex;
  gap: 20px;
  padding: 1rem;
  font-family: sans-serif;

  max-width: 1100px;    /* 限制最大宽度，根据你内容宽度调 */
  margin: 0 auto;       /* 左右自动外边距，实现居中 */
}


/* 主内容区域 */
.main-content {
  flex: 1;                    /* 占满剩余宽度 */
  max-width: 900px;           /* 最大宽度限制 */
  display: flex;              /* 弹性盒 */
  flex-direction: column;     /* 纵向排列 */
  align-items: center;        /* 子元素水平居中 */
}

/* 预约表格主体 */
.court-grid {
  border: 1px solid #ccc;     /* 边框 */
  width: fit-content;         /* 根据内容宽度自适应 */
  margin: 0 auto 1rem;        /* 水平居中，底部留空 */
  margin-left: 40px;
}

/* 日期选择栏 */
.date-bar {
  display: flex;              /* 水平排列 */
  justify-content: space-around; /* 子元素均匀分布 */
  margin-bottom: 0.5rem;        /* 底部间距 */
  margin-top: -10px;          /* 向上偏移10px */
}

/* 单个日期项 */
.date-item {
  text-align: center;         /* 文字居中 */
  padding: 0.5rem;            /* 内边距 */
  cursor: pointer;            /* 鼠标指针样式 */
  background: white;          /* 白色背景 */
  color: black;               /* 黑色字体 */
}

/* 选中的日期样式 */
.date-item.selected {
  background: #0F40F5;        /* 蓝色背景 */
  color: white;               /* 白色字体 */
  border-radius: 0.5rem;      /* 圆角 */
}

/* 表格行样式，横向排列 */
.header-row, .row {
  display: flex;
}

/* 单元格通用样式 */
.cell {
  border: 1px solid #ccc;     /* 边框 */
  width: 100px;               /* 固定宽度 */
  height: 40px;               /* 固定高度 */
  text-align: center;         /* 文字居中 */
  line-height: 40px;          /* 文字垂直居中 */
}

/* 时间表头单元格宽度 */
.time-header {
  width: 100px;
}

/* 时间列单元格背景 */
.time-cell {
  background: #f5f5f5;        /* 浅灰背景 */
}

/* 可选状态单元格 */
.available {
  background: #e0f7fa;        /* 浅蓝色背景 */
  cursor: pointer;            /* 鼠标为指针 */
}

/* 选中状态单元格 */
.selected {
  background: #0F40F5;        /* 深蓝背景 */
  color: white;               /* 字体白色 */
}

/* 底部区域 */
.footer {
  margin-top: 0rem;
  width:fit-content;
  margin-left: 40px;
  display: flex;           /* 设置为弹性布局 */
  justify-content: space-between; /* 两端对齐 */  /* 控制对齐方式（left/center/right） */
  align-items: center;     /* 垂直居中 */
  gap: 20rem;               /* 控件之间的间距（可选） */
}

.confirm-btn {
  background: #0F40F5;        /* 深蓝背景 */
  color: white;               /* 白色字体 */
  padding: 0.5rem 1rem;       /* 内边距 */
  border: none;               /* 无边框 */
  border-radius: 4px;         /* 圆角 */
  cursor: pointer;            /* 鼠标变手指 */
  margin-left: auto;
}

/* 锁定状态样式 */
.locked {
  background: #ddd;           /* 灰色背景 */
  color: #aaa;                /* 灰色字体 */
  cursor: not-allowed;        /* 禁用鼠标指针 */
}

/* 弹窗遮罩层 */
.popup {
  position: fixed;            /* 固定定位 */
  top: 0;                    /* 顶部对齐 */
  left: 0;                   /* 左对齐 */
  right: 0;                  /* 右对齐 */
  bottom: 0;                 /* 底对齐 */
  background: rgba(0, 0, 0, 0.4); /* 半透明黑色背景 */
  display: flex;             /* 弹性布局 */
  justify-content: center;   /* 水平居中 */
  align-items: center;       /* 垂直居中 */
  z-index: 1000;             /* 层级最高 */
}

/* 弹窗内容盒子 */
.popup-content {
  background: white;         /* 白色背景 */
  padding: 2rem;             /* 内边距 */
  border-radius: 8px;        /* 圆角 */
  text-align: center;        /* 文字居中 */
}

</style>
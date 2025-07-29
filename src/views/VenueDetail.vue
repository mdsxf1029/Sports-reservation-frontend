<template>
    <TopNavbar title="运动场地预约" />

    <div v-if="venue" class="venue-detail-layout">
        <!-- 上半部分 -->
        <div class="top-section">
            <!-- 左上角 - 图片 -->
            <div class="image-section">
                <img :src="venue.image" class="venue-img" />
            </div>

            <!-- 右上角 - 信息卡片 -->
            <div class="info-section">
                <div class="info-card">
                    <h2>{{ venue.name }}</h2>
                    <p><strong>📍 地址：</strong>{{ venue.address }}</p>
                    <p><strong>⏰ 开放时间：</strong>{{ venue.hours }}</p>
                    <p><strong>🏟️ 场地设施：</strong>羽毛球场地4片，小场地2片</p>
                    <p><strong>💰 收费：</strong>学生10元/小时，教师20元/小时</p>
                    <p><strong>📋 使用须知：</strong>每日2次，每次1小时</p>
                </div>
            </div>
        </div>

        <!-- 下半部分 -->
        <div class="bottom-section">
            <!-- 左下角 - 预约日历 -->
            <div class="calendar-section">
                <h3>预约日历</h3>
                <div class="date-grid">
                    <div class="date-card"
                         v-for="item in reservationStatus"
                         :key="item.date"
                         :class="{ available: item.status === '可预约', full: item.status === '已订满' }"
                         @click="goToReservation(item.date)">
                        <p class="weekday">{{ item.weekday }}</p>
                        <p class="date">{{ item.date }}</p>
                        <p class="status">{{ item.status }}</p>
                    </div>
                </div>
            </div>

            <!-- 右下角 - 月历 -->
            <div class="monthly-calendar-section">
                <div class="calendar-card">
                    <el-calendar v-model="selectedDate">
                        <template #date-cell="{ data }">
                            <div class="custom-date"
                                 :class="{
                                     today: isToday(data.day),
                                     selected: data.isSelected
                                 }">
                                {{ data.day.split('-')[2].padStart(2, '0') }}
                            </div>
                        </template>
                    </el-calendar>
                </div>
            </div>
        </div>
    </div>

    <div v-else style="padding: 30px; color: gray;">未找到场馆信息</div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'
    import TopNavbar from '../components/TopNavbar.vue'

    const route = useRoute()
    const router = useRouter()

    const venue = ref(null)
    const reservationStatus = ref([])
    const selectedDate = ref(new Date())

    // ✅ 获取场馆详情
    async function loadVenue() {
        try {
            const res = await axios.get(`https://m1.apifoxmock.com/m1/6792249-6505029-default/api/venues/${route.params.id}`)
            if (res.data.code === 200) {
                venue.value = res.data.data
            }
        } catch (error) {
            console.error('获取场馆详情失败', error)
        }
    }

    // ✅ 获取预约状态
    async function loadReservationStatus() {
        try {
            const res = await axios.get(`https://m1.apifoxmock.com/m1/6792249-6505029-default/api/venues/${route.params.id}/reservations`)
            if (res.data.code === 200) {
                reservationStatus.value = res.data.data
            }
        } catch (error) {
            console.error('获取预约状态失败', error)
        }
    }

    // ✅ 页面加载时执行
    onMounted(() => {
        loadVenue()
        loadReservationStatus()
    })

    // ✅ 点击预约跳转
    function goToReservation(date) {
        router.push({ path: '/court-reservation', query: { date } })
    }

    

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime())
    }
    function parseDay(date) {
        try {
            // 如果是字符串如 "2025-7-21"
            if (typeof date === 'string') {
                const parts = date.split('-')
                return parts[2] ? parts[2].padStart(2, '0') : ''
            }

            // 如果是 Date 对象
            if (date instanceof Date) {
                return date.getDate().toString().padStart(2, '0')
            }

            return ''
        } catch {
            return ''
        }
    }

    function isToday(date) {
        if (!isValidDate(date)) return false
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    function isSelected(date) {
        if (!isValidDate(date)) return false
        return (
            date.getDate() === selectedDate.value.getDate() &&
            date.getMonth() === selectedDate.value.getMonth() &&
            date.getFullYear() === selectedDate.value.getFullYear()
        )
    }
    function getDayNumber(date) {
        try {
            if (date instanceof Date && !isNaN(date)) {
                return date.getDate()
            }
            return ''
        } catch {
            return ''
        }
    }
</script>

<style scoped>
    .venue-detail-layout {
        display: flex;
        flex-direction: column;
        gap: 30px; /* 从 20px 增加到 30px */
        padding: 30px;
        background-color: #f4faff;
        min-height: 100vh;
        overflow: hidden;
    }

    /* 上半部分 */
    .top-section {
        display: flex;
        gap: 20px;
        height: 360px;
        flex-shrink: 0;
        margin-bottom: 20px; /* 新增：增加底部间距 */
    }

    .bottom-section {
        display: flex;
        gap: 20px;
        height: auto;
        padding-bottom: 20px;
        margin-top: 20px; /* 新增：增加顶部间距 */
    }

    /* 左上角 - 图片区域 */
    .image-section {
        flex: 1;
    }

    .venue-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* 右上角 - 信息区域 */
    .info-section {
        flex: 1.2;
    }

    .info-card {
        background-color: #ffffff;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        font-size: 15px;
        line-height: 1.8;
        color: #444;
        height: 90%;
        overflow-y: auto;
    }

        .info-card h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #007bff;
        }

    /* 下半部分 */
    .bottom-section {
        display: flex;
        gap: 20px;
        flex: 1;
        min-height: 0;
    }

    /* 左下角 - 预约日历 */
    .calendar-section {
        flex: 1.5;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

        .calendar-section h3 {
            margin: 0;
            font-size: 18px;
            color: #007bff;
        }

    .date-grid {
        display: flex;
        gap: 12px;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 6px;
        align-items: stretch;
    }

    .date-card {
        min-width: 90px;
        flex-shrink: 0;
        padding: 15px 10px;
        border-radius: 10px;
        background-color: #e6f0ff;
        text-align: center;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

        .date-card:hover {
            transform: translateY(-3px);
            background-color: #d0e7ff;
        }

        .date-card .weekday {
            font-weight: bold;
            color: #007bff;
            margin: 0 0 4px 0;
        }

        .date-card .date {
            margin: 4px 0;
            color: #666;
        }

        .date-card .status {
            font-weight: bold;
            margin: 4px 0 0 0;
        }

        .date-card.available .status {
            color: green;
        }

        .date-card.full .status {
            color: red;
        }

    /* 右下角 - 月历 */
    .monthly-calendar-section {
        flex: 0.8;
    }

    .calendar-card {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        background-color: #002b55;
        color: #fff;
        height: 100%;
    }

    /* ✅ 正确方式覆盖 el-calendar 样式 */
    ::v-deep(.el-calendar) {
        background-color: transparent;
        color: #fff;
        border: none;
        height: 100%;
    }

    ::v-deep(.el-calendar__header) {
        background-color: #003b80;
        color: #fff;
        padding: 12px 20px;
        font-size: 16px;
        font-weight: bold;
        border-bottom: 1px solid #00488a;
    }

    ::v-deep(.el-calendar__body) {
        padding: 12px;
    }

    ::v-deep(.el-calendar-table td) {
        height: 45px;
        text-align: center;
        border: none;
    }

    ::v-deep(.el-calendar-day) {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    /* 去除 el-calendar 选中单元格的默认白色背景 */
    ::v-deep(.el-calendar-table td.is-selected) {
        background-color: transparent;
    }

    /* 去除顶部横线（关键） */
    ::v-deep(.el-calendar-table thead tr th) {
        border: none;
    }

    /* 去除左边竖线 */
    ::v-deep(.el-calendar-table tr td:first-child) {
        border-left: none;
    }

    .custom-date {
        width: 32px;
        height: 32px;
        margin: auto;
        line-height: 32px;
        border-radius: 50%;
        transition: 0.2s;
        color: #ffffff;
        font-weight: bold;
        font-size: 14px;
    }

        .custom-date.today {
            background-color: #005fc1;
            color: #000;
        }

        .custom-date.selected {
            background-color: #e6f0ff;
            color: black;
            border: none;
        }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .venue-detail-layout {
            padding: 15px;
        }

        .top-section,
        .bottom-section {
            flex-direction: column;
            height: auto;
        }

        .top-section {
            gap: 15px;
        }

        .bottom-section {
            gap: 15px;
        }

        .image-section {
            height: 200px;
        }

        .info-card {
            padding: 16px;
        }

        .calendar-section {
            height: 300px;
        }

        .monthly-calendar-section {
            height: 350px;
        }
    }
</style>
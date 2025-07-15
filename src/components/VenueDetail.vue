<template>
    <div class="venue-detail-layout">
        <!-- 左侧图片 -->
        <div class="left-image">
            <img :src="venue.image" class="venue-img" />
        </div>

        <!-- 右侧信息 -->
        <div class="right-info">
            <div class="venue-info">
                <h2>{{ venue.name }}</h2>
                <p>{{ venue.address }}</p>
                <p>{{ venue.hours }}</p>
                <p>场地设施：羽毛球场地4片，小场地2片</p>
                <p>收费：学生10元/小时，教师20元/小时</p>
                <p>使用须知：每日2次，每次1小时</p>
            </div>

            <div class="date-status-list">
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
    </div>
</template>

<script setup>
    import { useRoute, useRouter } from 'vue-router'
    import { computed } from 'vue'

    const route = useRoute()
    const router = useRouter()

    const venues = [
        {
            id: 1,
            name: '四平校区一·二九训练馆',
            address: '上海市杨浦区四平路校区一·二九训练馆',
            hours: '09:00 - 21:00',
            image: new URL('@/assets/venues/badminton.jpg', import.meta.url).href
        }
    ]

    const venue = computed(() =>
        venues.find(v => v.id === Number(route.params.id))
    )

    const reservationStatus = [
        { weekday: '周一', date: '07-14', status: '已订满' },
        { weekday: '周二', date: '07-15', status: '可预约' },
        { weekday: '周三', date: '07-16', status: '已订满' },
        { weekday: '周四', date: '07-17', status: '已订满' }
    ]

    const goToReservation = (date) => {
        router.push({ path: '/reservation', query: { date } })
    }
</script>

<style scoped>
    .venue-detail-layout {
        display: flex;
        flex-direction: row;
        gap: 30px;
        align-items: flex-start;
        padding: 20px;
    }

    /* 左侧图片 */
    .left-image {
        flex: 1;
    }

    .venue-img {
        width: 100%;
        height: 360px;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    /* 右侧内容 */
    .right-info {
        flex: 1.2;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .venue-info {
        font-size: 14px;
        line-height: 1.8;
    }

        .venue-info h2 {
            margin-bottom: 10px;
            font-size: 18px;
        }

    /* 日期卡片区域 */
    .date-status-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .date-card {
        width: 80px;
        padding: 10px;
        border-radius: 10px;
        background-color: #f7f7f7;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
    }

        .date-card:hover {
            transform: scale(1.05);
            background-color: #f0f0f0;
        }

        .date-card .weekday {
            font-weight: bold;
        }

        .date-card .date {
            margin: 4px 0;
            color: #666;
        }

        .date-card .status {
            font-weight: bold;
        }

        .date-card.available .status {
            color: green;
        }

        .date-card.full .status {
            color: red;
        }
</style>

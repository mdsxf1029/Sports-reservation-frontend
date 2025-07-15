<template>
    <div class="reservation-layout">
        <!-- 左侧运动图标栏 -->
        <div class="sports-sidebar">
            <div class="sport-icon"
                 v-for="sport in sports"
                 :key="sport.name"
                 @click="currentSport = sport.name"
                 :class="{ active: currentSport === sport.name }">
                <img :src="sport.icon" />
                <p>{{ sport.name }}</p>
            </div>
        </div>

        <!-- 右侧场馆推荐 -->
        <div class="venue-section">
            <h3 class="section-title">{{ currentSport }} 推荐场馆</h3>

            <div class="venue-item"
                 v-for="venue in filteredVenues"
                 :key="venue.id">
                <img :src="venue.image" class="venue-image" />
                <div class="venue-info">
                    <h4>{{ venue.name }}</h4>
                    <p>📍 {{ venue.address }}</p>
                    <p>🕒 {{ venue.hours }}</p>
                    <el-button type="primary" size="small" @click="goToDetail(venue.id)">预约</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'

    // 当前选中的运动项目
    const currentSport = ref('羽毛球')

    // 左侧图标（注意：路径必须真实存在）
    const sports = ref([
        { name: '羽毛球', icon: new URL('../assets/icons/badminton.png', import.meta.url).href },
        { name: '乒乓球', icon: new URL('../assets/icons/pingpong.png', import.meta.url).href },
        { name: '网球', icon: new URL('../assets/icons/basketball.png', import.meta.url).href },
        { name: '健身', icon: new URL('../assets/icons/fitness.png', import.meta.url).href }
    ])

    // 场馆数据（你可以拓展更多）
    const venues = ref([
        {
            id: 1,
            sport: '羽毛球',
            name: '二九羽毛球馆',
            address: '四平路校区',
            hours: '08:00 - 21:00',
            image: new URL('@/assets/venues/badminton.jpg', import.meta.url).href
        },
        {
            id: 2,
            sport: '乒乓球',
            name: '彰武乒乓球馆',
            address: '彰武校区',
            hours: '09:00 - 20:00',
            image: new URL('@/assets/venues/pingpong.jpg', import.meta.url).href
        },
        {
            id: 3,
            sport: '健身',
            name: '健身房 A',
            address: '彰武路 100 号',
            hours: '09:00 - 22:00',
            image: new URL('@/assets/venues/fitness.jpg', import.meta.url).href
        }
    ])
    import { useRouter } from 'vue-router'
    const router = useRouter()

    function goToDetail(id) {
        router.push(`/venue/${id}`)
    }


    const filteredVenues = computed(() =>
        venues.value.filter(v => v.sport === currentSport.value)
    )
</script>

<style scoped>
    .reservation-layout {
        display: flex;
        height: 100%;
        min-height: 500px;
        background-color: #f9f9f9;
    }

    /* 左侧图标栏 */
    .sports-sidebar {
        width: 90px;
        background-color: #f5f5f5;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 10px;
    }

    .sport-icon {
        text-align: center;
        margin: 10px 0;
        cursor: pointer;
    }

        .sport-icon img {
            width: 40px;
            height: 40px;
        }

        .sport-icon p {
            font-size: 12px;
            margin-top: 5px;
            color: #555;
        }

        .sport-icon.active p {
            color: #409EFF;
            font-weight: bold;
        }

    /* 右侧推荐卡片 */
    .venue-section {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
    }

    .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
    }

    .venue-item {
        display: flex;
        background-color: #fff;
        margin-bottom: 15px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .venue-image {
        width: 130px;
        height: 100px;
        object-fit: cover;
    }

    .venue-info {
        padding: 10px 15px;
        flex: 1;
    }

        .venue-info h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
</style>

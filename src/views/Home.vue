<template>
    <div class="home-layout">
        <!-- ✅ 顶部导航栏组件 -->
        <HeaderNavbar />

        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-input v-model="searchQuery"
                      placeholder="请输入场馆名称或运动类型名称"
                      class="search-input"
                      clearable>
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <el-button type="primary" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </div>

        <!-- 图标分类导航 -->
        <div class="sports-icons">
            <div class="sport-icon"
                 v-for="sport in sports"
                 :key="sport.name"
                 @click="goToSport(sport.name)">
                <img :src="sport.icon" />
                <p>{{ sport.name }}</p>
            </div>
        </div>

        <!-- 推荐场馆 -->
        <div class="recommend-section">
            <h3 class="section-title">推荐场馆</h3>
            <div class="venue-list">
                <div class="venue-item"
                     v-for="venue in recommendedVenues"
                     :key="venue.id">
                    <img :src="venue.image" class="venue-image" />
                    <div class="venue-info">
                        <h4>{{ venue.name }}</h4>
                        <p>📍 {{ venue.address }}</p>
                        <p>🕒 {{ venue.hours }}</p>
                        <el-button type="primary" size="small" @click="goToDetail(venue.id)">
                            预约
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { Search } from '@element-plus/icons-vue'
    import HeaderNavbar from '../components/HeaderNavbar.vue' // ✅ 引入导航栏组件
    import { onMounted } from 'vue'

    const router = useRouter()
    const searchQuery = ref('')

    import axios from 'axios'
    const recommendedVenues = ref([])

    onMounted(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:4523/m1/6792249-6505029-default/api/venues') // 👈用你的真实Mock地址替换
            recommendedVenues.value = res.data
            console.log('收到推荐场馆数据：', res.data)
        } catch (err) {
            console.error('获取场馆列表失败：', err)
        }
    })


    // 图标分类
    const sports = ref([
        { name: '羽毛球', icon: new URL('../assets/icons/badminton.png', import.meta.url).href },
        { name: '乒乓球', icon: new URL('../assets/icons/pingpong.png', import.meta.url).href },
        { name: '网球', icon: new URL('../assets/icons/basketball.png', import.meta.url).href },
        { name: '健身', icon: new URL('../assets/icons/fitness.png', import.meta.url).href }
    ])

    async function doSearch() {
        try {
            const res = await axios.get('http://127.0.0.1:4523/m1/6792249-6505029-default/api/venues', {
                params: {
                    query: searchQuery.value // 👈 将关键词作为参数传递
                }
            })
            recommendedVenues.value = res.data
            console.log('搜索结果：', res.data)
        } catch (err) {
            console.error('搜索失败:', err)
        }
    }

    function goToSport(sport) {
        router.push({ name: 'VenueList', query: { sport } })
    }

    function goToDetail(id) {
        router.push(`/venue/${id}`)
    }
</script>

<style scoped>
    .home-layout {
        background-color: #f9f9f9;
        min-height: 100vh;
    }

    .search-bar {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        padding: 0 20px;
        gap: 10px;
    }

    .search-input {
        width: 500px;
        border-radius: 25px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .sports-icons {
        display: flex;
        justify-content: space-around;
        margin: 25px 0 10px;
    }

    .sport-icon {
        text-align: center;
        cursor: pointer;
    }

        .sport-icon img {
            width: 42px;
            height: 42px;
        }

        .sport-icon p {
            font-size: 13px;
            margin-top: 6px;
            color: #333;
        }

    .recommend-section {
        padding: 0 20px;
    }

    .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
    }

    .venue-list {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }

    .venue-item {
        width: 300px;
        background-color: #fff;
        border-radius: 8px;
        display: flex;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }

    .venue-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
    }

    .venue-info {
        padding: 10px;
        flex: 1;
    }

        .venue-info h4 {
            font-size: 16px;
            margin: 0 0 4px;
        }
</style>

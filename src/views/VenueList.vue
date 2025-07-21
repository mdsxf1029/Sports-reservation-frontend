<template>
    <div class="venue-list-page">
        <!-- ✅ 顶部导航栏组件 -->
        <TopNavbar title="运动场地预约" />

        <!-- 顶部横幅图 -->
        <div class="banner">
            <img :src="bannerImg" alt="banner" />
        </div>

        <!-- 顶部筛选 -->
        <div class="filter-bar">
            <h3>个人预约</h3>
            <div class="filter-options">
                <div class="filter-group">
                    <span class="label">校区：</span>
                    <el-button v-for="campus in campuses"
                               :key="campus"
                               :type="selectedCampus === campus ? 'primary' : 'default'"
                               size="small"
                               @click="selectedCampus = campus">
                        {{ campus }}
                    </el-button>
                </div>
                <div class="filter-group">
                    <span class="label">类型：</span>
                    <el-button v-for="type in types"
                               :key="type"
                               :type="selectedType === type ? 'primary' : 'default'"
                               size="small"
                               @click="selectedType = type">
                        {{ type }}
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
            <div class="search-input-group">
                <el-input v-model="searchQuery"
                          placeholder="请输入场馆名称或运动类型名称"
                          class="search-input"
                          clearable />
                <el-button type="primary" icon="el-icon-search" @click="doSearch">
                    搜索
                </el-button>
            </div>
        </div>

        <!-- 场馆卡片列表 -->
        <div class="venue-card-list">
            <div v-for="venue in venues"
                 :key="venue.id"
                 class="venue-card">

                <img :src="venue.image" class="venue-img" />
                <div class="venue-info">
                    <h4>{{ venue.name }}</h4>
                    <p>地址：{{ venue.address }}</p>
                    <p>时间：{{ venue.hours }}</p>
                </div>
                <el-button class="reserve-btn" type="primary" size="small" @click="goToDetail(venue.id)">预约</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'
    import TopNavbar from '../components/TopNavbar.vue'

    const route = useRoute()
    const router = useRouter()

    // ✅ banner 图
    const bannerImg = new URL('../assets/photos/tongji.png', import.meta.url).href

    // ✅ 筛选选项
    const campuses = ['全部', '四平校区', '彰武校区', '嘉定校区', '沪西校区', '南校区']
    const types = ['全部', '羽毛球', '乒乓球', '网球', '健身', '足球', '田径', '排球', '篮球', '拳操']

    // ✅ 筛选状态
    const selectedCampus = ref('全部')
    const selectedType = ref(route.query.sport || '全部')
    const searchQuery = ref('')

    // ✅ 场馆数据
    const venues = ref([])

    // ✅ 从后端加载场馆列表（支持筛选/搜索）
    async function loadVenues() {
        try {
            const res = await axios.get('https://m1.apifoxmock.com/m1/6792249-6505029-default/api/venues1', {
                params: {
                    campus: selectedCampus.value !== '全部' ? selectedCampus.value : undefined,
                    type: selectedType.value !== '全部' ? selectedType.value : undefined,
                    search: searchQuery.value || undefined
                }
            })
            if (res.data.code === 200) {
                venues.value = res.data.data
            }
        } catch (error) {
            console.error('加载场馆数据失败', error)
        }
    }

    // ✅ 搜索按钮点击
    function doSearch() {
        loadVenues()
    }

    // ✅ 页面初始化加载一次
    onMounted(() => {
        loadVenues()
    })

    // ✅ 当筛选项变化时自动重新加载
    watch([selectedCampus, selectedType], loadVenues)

    // ✅ 跳转详情
    function goToDetail(id) {
        router.push(`/venue/${id}`)
    }
</script>


<style scoped>
    .venue-list-page {
        padding: 20px;
    }

    .banner img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        margin-bottom: 20px;
    }

    .filter-bar {
        margin-bottom: 15px;
    }

    .filter-group {
        margin: 10px 0;
    }

    .label {
        margin-right: 8px;
        font-weight: bold;
    }

    .search-section {
        margin: 20px 0;
        max-width: 500px;
    }

    .search-input-group {
        display: flex;
        gap: 8px;
    }

    .venue-card-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    .venue-card {
        width: 280px;
        border-radius: 8px;
        background-color: #fff;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        position: relative;
        padding-bottom: 50px;
    }

    .venue-img {
        width: 100%;
        height: 160px;
        object-fit: cover;
    }

    .venue-info {
        padding: 10px;
    }

        .venue-info h4 {
            margin: 0 0 5px;
        }

    .reserve-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
</style>
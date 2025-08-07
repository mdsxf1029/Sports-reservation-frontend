<template>
    <!-- 顶部导航栏 -->
    <HeaderNavbar />
    <!-- 登录弹窗 -->
    <el-dialog v-model="showLoginDialog"
               title="登录"
               width="400px"
               class="login-dialog">
        <div class="login-content">
            <img src="@/assets/LogosAndIcons/Tongji.png" alt="login" class="login-img" />
            <p class="login-text">请先登录后再进行预约操作</p>
            <el-button type="primary" class="login-btn" @click="login">登录</el-button>
        </div>
    </el-dialog>



    <div class="venue-list-page">
        <!-- 筛选区域 -->
        <div class="filter-bar">
            <h3 class="section-title">个人预约</h3>

            <!-- 校区筛选 -->
            <div class="filter-group">
                <span class="label">校区：</span>
                <div class="button-group">
                    <el-button v-for="campus in campuses"
                               :key="campus"
                               :class="['filter-btn', selectedCampus === campus ? 'active' : '']"
                               size="small"
                               @click="selectedCampus = campus">
                        {{ campus }}
                    </el-button>
                </div>
            </div>

            <!-- 类型筛选 -->
            <div class="filter-group">
                <span class="label">类型：</span>
                <div class="button-group">
                    <el-button v-for="type in types"
                               :key="type"
                               :class="['filter-btn', selectedType === type ? 'active' : '']"
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
                <el-button class="search-btn" @click="doSearch">搜索</el-button>
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
                    <p class="ellipsis">地址：{{ venue.address }}</p>
                    <p>时间：{{ venue.hours }}</p>
                </div>
                <el-button class="reserve-btn" size="small" @click="goToDetail(venue.id)">预约</el-button>
            </div>
        </div>
    </div>

</template>

<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { ArrowLeft } from '@element-plus/icons-vue'
    import TopNavbar from '../components/TopNavbar.vue'
    import axios from 'axios'
    import { AuthService } from '@/utils/auth.js' // 路径根据你项目调整


    const router = useRouter()

    const campuses = ['全部', '四平校区', '彰武校区', '嘉定校区', '沪西校区', '南校区']
    const types = ['全部', '羽毛球', '乒乓球', '网球', '健身', '足球', '田径', '排球', '篮球', '拳操']
    const selectedCampus = ref('全部')
    const selectedType = ref('羽毛球')
    const searchQuery = ref('')
    const venues = ref([])
    const isLoggedIn = ref(false)
    const showLoginDialog = ref(false)

    function login() {
        showLoginDialog.value = false
        router.push('/login')
    }


    function goBack() {
        router.back()
    }

    function goToDetail(id) {
        const result = AuthService.checkLoginStatus()
        if (!result.isValid) {
            showLoginDialog.value = true // 用你自己的 el-dialog 弹窗
            return
        }
        router.push(`/venue/${id}`)
    }


    function doSearch() {
        loadVenues()
    }

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
        } catch (err) {
            console.error('加载场馆失败', err)
        }
    }

    onMounted(loadVenues)
    watch([selectedCampus, selectedType], loadVenues)
</script>

<style scoped>
    .venue-list-page {
        padding: 20px 40px 40px 80px; /* 顶部预留导航栏高度 + 左侧留白 */
    }

    .back-icon {
        margin-right: 12px;
        cursor: pointer;
        font-size: 20px;
        color: black;
    }

    .title {
        flex: 1;
    }

    .section-title {
        font-size: 20px;
        margin-bottom: 16px;
    }

    .filter-bar {
        margin-bottom: 24px;
    }

    .filter-group {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
    }

    .label {
        margin-right: 12px;
        font-weight: bold;
        min-width: 50px;
    }

    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }
    :global(.login-dialog) {
        border-radius: 24px !important;
        overflow: hidden; /* 防止标题栏溢出 */
    }
    .login-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    .login-img {
        width: 120px;
        margin-bottom: 50px; /* 图片和文字间隔 */
    }

    .login-text {
        font-size: 16px;
        margin-bottom: 50px; /* 文字和按钮间隔 */
    }

    .login-btn {
        border-radius: 20px;
        padding: 8px 24px;
    }

    /* 筛选按钮样式 */
    ::v-deep(.filter-btn) {
        border-radius: 20px;
        padding: 6px 18px;
        font-size: 14px;
        background-color: transparent;
        border: none;
        color: #666;
        transition: all 0.2s;
    }

    ::v-deep(.filter-btn.active) {
        background-color: #0070C0;
        color: white;
        border: none;
    }

    ::v-deep(.filter-btn:hover) {
        background-color: #e5efff;
        color: #0070C0;
    }

    /* 搜索区域 */
    .search-section {
        margin: 24px 0;
        max-width: 500px;
    }

    .search-input-group {
        display: flex;
        gap: 10px;
    }

    .search-btn {
        border-radius: 20px;
        padding: 6px 20px;
        font-size: 14px;
        background-color: #0070C0;
        color: white;
        border: none;
    }

    /* 场馆卡片 */
    .venue-card-list {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
    }

    .venue-card {
        width: 280px;
        border-radius: 10px;
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
            margin: 0 0 6px;
            font-size: 16px;
        }

    .reserve-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
        border-radius: 20px;
        padding: 6px 20px;
        font-size: 14px;
        background-color: #0070C0;
        color: white;
        border: none;
    }
</style>

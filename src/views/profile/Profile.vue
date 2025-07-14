<template>
    <AppLayout page-title="个人中心">
        <div class="profile-content">
            <!-- 用户信息卡片 -->
            <div class="user-card">
                <div class="avatar">👤</div>
                <h2>用户名</h2>
                <p>手机号：138****8888</p>
            </div>

            <!-- 菜单列表 -->
            <div class="menu-list">
                <div class="menu-item" @click="editProfile">
                    <span>个人资料</span>
                    <span>></span>
                </div>
                <div class="menu-item" @click="accountSecurity">
                    <span>账户安全</span>
                    <span>></span>
                </div>
                <div class="menu-item" @click="settings">
                    <span>设置</span>
                    <span>></span>
                </div>
            </div>

            <!-- 退出按钮 -->
            <button class="logout-btn" @click="logout">
                退出登录
            </button>
        </div>
    </AppLayout>
</template>

<script>
    import AppLayout from '@/components/AppLayout.vue'

    export default {
    name: 'Profile',
    components: {
    AppLayout
    },
    methods: {
    editProfile() {
    console.log('编辑个人资料')
    },
    accountSecurity() {
    console.log('账户安全')
    },
    settings() {
    console.log('设置')
    },
    logout() {
    localStorage.removeItem('userInfo')
    this.$router.push('/auth')
    }
    }
    }
</script>

<style scoped>
    .profile-content {
        max-width: 600px;
        margin: 0 auto;
    }

    .user-card {
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .avatar {
        width: 80px;
        height: 80px;
        background: #f0f0f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin: 0 auto 15px;
    }

    .menu-list {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s;
    }

        .menu-item:last-child {
            border-bottom: none;
        }

        .menu-item:hover {
            background: #f9f9f9;
        }

    /* 原生按钮样式 */
    .logout-btn {
        width: 100%;
        padding: 15px;
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

        .logout-btn:hover {
            background: #ff3742;
        }
</style>

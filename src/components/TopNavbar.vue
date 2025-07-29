<template>
    <div class="top-navbar">
        <!-- 自定义 SVG 加粗箭头 -->
        <div class="back-icon" @click="goBack">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6"
                      stroke="black"
                      stroke-width="3.5"
                      stroke-linecap="round"
                      stroke-linejoin="round" />
            </svg>
        </div>

        <!-- 标题 -->
        <span class="title">{{ title }}</span>
    </div>
</template>

<script setup>
    import { useRouter } from 'vue-router'
    defineProps({ title: String })

    const router = useRouter()
    function goBack() {
        router.back()
    }
</script>

<style scoped>
    .top-navbar {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        font-size: 18px;
        font-weight: bold;
        background-color: #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
    }

    .back-icon {
        margin-right: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
    }

    .title {
        flex: 1;
    }
</style>

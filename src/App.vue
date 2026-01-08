<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <header class="top-toolbar">
      <div class="logo">
        <i class="fas fa-water"></i>
        <span>水预算大模型平台</span>
      </div>
      <div class="user-info">
        <i class="fas fa-bell"></i>
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 左侧导航栏 -->
      <aside class="left-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#ffffff"
          text-color="#333333"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/conversation">
            <template #title>
              <i class="fas fa-comment"></i>
              <span>AI对话</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <template #title>
              <i class="fas fa-book"></i>
              <span>知识库管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/agent">
            <template #title>
              <i class="fas fa-robot"></i>
              <span>智能体管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/system">
            <template #title>
              <i class="fas fa-cog"></i>
              <span>系统管理</span>
            </template>
          </el-menu-item>
        </el-menu>
      </aside>
      
      <!-- 主内容区 -->
      <section class="content-area">
        <router-view :key="route.path"></router-view>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = ref('/conversation')

// 监听路由变化，更新当前激活的菜单
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  },
  { immediate: true }
)
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

/* 顶部工具栏 */
.top-toolbar {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}

.logo i {
  margin-right: 8px;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info i {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
  min-width: 0;
}

/* 左侧导航栏 */
.left-sidebar {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  border-right: none;
  flex: 0 0 auto;
}

/* 主内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  width: 100%;
}
</style>
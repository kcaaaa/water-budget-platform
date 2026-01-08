<template>
  <div class="system-management-container">
    <div class="system-management-header">
      <h2>系统管理</h2>
    </div>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" type="card" class="system-tabs">
      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="userManagement">
        <div class="tab-content">
          <div class="tab-header">
            <span>用户列表</span>
            <el-button type="primary" @click="handleCreateUser">
              <i class="fas fa-plus"></i> 创建用户
            </el-button>
          </div>

          <el-card class="user-list-card">
            <el-table :data="filteredUsers" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" min-width="150" />
              <el-table-column prop="realName" label="真实姓名" min-width="150" />
              <el-table-column prop="email" label="邮箱" min-width="200" />
              <el-table-column prop="phone" label="电话" min-width="150" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.role === 'admin' ? 'primary' : scope.row.role === 'user' ? 'success' : 'warning'">
                    {{ scope.row.role === 'admin' ? '管理员' : scope.row.role === 'user' ? '普通用户' : '访客' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleViewUser(scope.row)">
                    <i class="fas fa-eye"></i> 查看
                  </el-button>
                  <el-button size="small" @click="handleEditUser(scope.row)">
                    <i class="fas fa-edit"></i> 编辑
                  </el-button>
                  <el-button size="small" :type="scope.row.status === 'active' ? 'warning' : 'success'" @click="handleToggleUserStatus(scope.row)">
                    <i class="fas fa-toggle-on"></i> {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 角色权限 -->
      <el-tab-pane label="角色权限" name="roleManagement">
        <div class="tab-content">
          <div class="tab-header">
            <span>角色列表</span>
            <el-button type="primary" @click="handleCreateRole">
              <i class="fas fa-plus"></i> 创建角色
            </el-button>
          </div>

          <el-card class="role-list-card">
            <el-table :data="filteredRoles" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="角色名称" min-width="150" />
              <el-table-column prop="description" label="角色描述" min-width="200" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="handleEditRole(scope.row)">
                    <i class="fas fa-edit"></i> 编辑
                  </el-button>
                  <el-button size="small" @click="handlePermissionConfig(scope.row)">
                    <i class="fas fa-key"></i> 权限配置
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteRole(scope.row)">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="operationLog">
        <div class="tab-content">
          <div class="tab-header">
            <span>操作日志</span>
            <el-date-picker
              v-model="logDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 300px; margin-right: 10px"
            />
            <el-select v-model="logUser" placeholder="选择用户">
              <el-option label="全部用户" value="" />
              <el-option v-for="user in users" :key="user.id" :label="user.username" :value="user.id" />
            </el-select>
          </div>

          <el-card class="log-list-card">
            <el-table :data="filteredLogs" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="userId" label="用户ID" width="100" />
              <el-table-column prop="username" label="用户名" min-width="150" />
              <el-table-column prop="operation" label="操作内容" min-width="200" />
              <el-table-column prop="ip" label="IP地址" min-width="150" />
              <el-table-column prop="userAgent" label="用户代理" min-width="200" />
              <el-table-column prop="createTime" label="操作时间" width="180" />
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 系统配置 -->
      <el-tab-pane label="系统配置" name="systemConfig">
        <div class="tab-content">
          <div class="tab-header">
            <span>系统配置</span>
          </div>

          <el-card class="config-card">
            <el-form :model="systemConfig" label-width="120px">
              <el-form-item label="系统名称">
                <el-input v-model="systemConfig.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              <el-form-item label="系统版本">
                <el-input v-model="systemConfig.systemVersion" placeholder="请输入系统版本" />
              </el-form-item>
              <el-form-item label="系统描述">
                <el-input
                  v-model="systemConfig.systemDescription"
                  type="textarea"
                  rows="3"
                  placeholder="请输入系统描述"
                />
              </el-form-item>
              <el-form-item label="联系邮箱">
                <el-input v-model="systemConfig.contactEmail" placeholder="请输入联系邮箱" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="systemConfig.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item label="首页展示">
                <el-switch v-model="systemConfig.showHome" />
              </el-form-item>
              <el-form-item label="允许注册">
                <el-switch v-model="systemConfig.allowRegister" />
              </el-form-item>
              <el-form-item label="允许访客访问">
                <el-switch v-model="systemConfig.allowGuestAccess" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
                <el-button @click="handleResetConfig">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 系统监控 -->
      <el-tab-pane label="系统监控" name="systemMonitor">
        <div class="tab-content">
          <div class="tab-header">
            <span>系统监控</span>
          </div>

          <!-- 系统状态统计 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="monitor-card">
                <div class="monitor-item">
                  <div class="monitor-value">{{ systemStatus.cpuUsage }}%</div>
                  <div class="monitor-label">CPU使用率</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="monitor-card">
                <div class="monitor-item">
                  <div class="monitor-value">{{ systemStatus.memoryUsage }}%</div>
                  <div class="monitor-label">内存使用率</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="monitor-card">
                <div class="monitor-item">
                  <div class="monitor-value">{{ systemStatus.diskUsage }}%</div>
                  <div class="monitor-label">磁盘使用率</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="monitor-card">
                <div class="monitor-item">
                  <div class="monitor-value">{{ systemStatus.activeConnections }}</div>
                  <div class="monitor-label">活跃连接数</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 系统运行时间 -->
          <el-card class="uptime-card">
            <div class="uptime-item">
              <div class="uptime-label">系统运行时间</div>
              <div class="uptime-value">{{ systemStatus.uptime }}</div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="createUserDialogVisible"
      title="创建用户"
      width="600px"
    >
      <el-form :model="newUser" label-width="120px">
        <el-form-item label="用户名" required>
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input v-model="newUser.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="newUser.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" required>
          <el-input v-model="newUser.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="newUser.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 用户数据结构
interface User {
  id: string
  username: string
  realName: string
  email: string
  phone: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createTime: string
  lastLoginTime: string
}

// 角色数据结构
interface Role {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
}

// 操作日志数据结构
interface OperationLog {
  id: string
  userId: string
  username: string
  operation: string
  ip: string
  userAgent: string
  createTime: string
}

// 系统配置数据结构
interface SystemConfig {
  systemName: string
  systemVersion: string
  systemDescription: string
  contactEmail: string
  contactPhone: string
  showHome: boolean
  allowRegister: boolean
  allowGuestAccess: boolean
}

// 系统状态数据结构
interface SystemStatus {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeConnections: number
  uptime: string
}

// 模拟用户数据
const users = ref<User[]>([
  {
    id: '1',
    username: 'admin',
    realName: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    status: 'active',
    createTime: '2024-01-01 00:00:00',
    lastLoginTime: '2024-04-10 14:30:00'
  },
  {
    id: '2',
    username: 'user1',
    realName: '用户1',
    email: 'user1@example.com',
    phone: '13800138001',
    role: 'user',
    status: 'active',
    createTime: '2024-01-10 10:00:00',
    lastLoginTime: '2024-04-09 09:15:00'
  },
  {
    id: '3',
    username: 'user2',
    realName: '用户2',
    email: 'user2@example.com',
    phone: '13800138002',
    role: 'user',
    status: 'inactive',
    createTime: '2024-01-15 15:30:00',
    lastLoginTime: '2024-03-20 16:45:00'
  }
])

// 模拟角色数据
const roles = ref<Role[]>([
  {
    id: '1',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    status: 'active'
  },
  {
    id: '2',
    name: '普通用户',
    description: '普通用户，拥有基础权限',
    status: 'active'
  },
  {
    id: '3',
    name: '访客',
    description: '访客用户，拥有只读权限',
    status: 'active'
  }
])

// 模拟操作日志数据
const logs = ref<OperationLog[]>([
  {
    id: '1',
    userId: '1',
    username: 'admin',
    operation: '登录系统',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    createTime: '2024-04-10 14:30:00'
  },
  {
    id: '2',
    userId: '1',
    username: 'admin',
    operation: '创建用户 user3',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    createTime: '2024-04-10 14:35:00'
  },
  {
    id: '3',
    userId: '2',
    username: 'user1',
    operation: '查看知识库',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
    createTime: '2024-04-10 15:00:00'
  },
  {
    id: '4',
    userId: '3',
    username: 'user2',
    operation: '修改个人信息',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    createTime: '2024-04-10 15:20:00'
  }
])

// 系统配置
const systemConfig = ref<SystemConfig>({
  systemName: '水预算大模型平台',
  systemVersion: '1.0.0',
  systemDescription: '专注于水预算分析的智能平台',
  contactEmail: 'support@water-budget.com',
  contactPhone: '400-123-4567',
  showHome: true,
  allowRegister: true,
  allowGuestAccess: false
})

// 系统状态
const systemStatus = ref<SystemStatus>({
  cpuUsage: 35,
  memoryUsage: 65,
  diskUsage: 45,
  activeConnections: 12,
  uptime: '7天 12小时 30分钟'
})

// 活跃标签页
const activeTab = ref('userManagement')

// 用户管理相关
const searchUserKeyword = ref('')
const createUserDialogVisible = ref(false)
const newUser = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  password: '',
  role: 'user' as const
})

// 角色管理相关
const searchRoleKeyword = ref('')

// 日志管理相关
const logDateRange = ref<[Date, Date] | null>(null)
const logUser = ref('')

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchUserKeyword.value) return users.value
  return users.value.filter(user => 
    user.username.includes(searchUserKeyword.value) ||
    user.realName.includes(searchUserKeyword.value) ||
    user.email.includes(searchUserKeyword.value) ||
    user.phone.includes(searchUserKeyword.value)
  )
})

// 过滤后的角色列表
const filteredRoles = computed(() => {
  if (!searchRoleKeyword.value) return roles.value
  return roles.value.filter(role => 
    role.name.includes(searchRoleKeyword.value) ||
    role.description.includes(searchRoleKeyword.value)
  )
})

// 过滤后的操作日志
const filteredLogs = computed(() => {
  let result = logs.value
  
  // 根据用户过滤
  if (logUser.value) {
    result = result.filter(log => log.userId === logUser.value)
  }
  
  // 根据日期范围过滤
  if (logDateRange.value) {
    const [startDate, endDate] = logDateRange.value
    result = result.filter(log => {
      const logDate = new Date(log.createTime)
      return logDate >= startDate && logDate <= endDate
    })
  }
  
  return result
})

// 用户管理操作
const handleCreateUser = () => {
  createUserDialogVisible.value = true
  newUser.value = {
    username: '',
    realName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  }
}

const handleSaveUser = () => {
  // 验证表单
  if (!newUser.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!newUser.value.realName.trim()) {
    ElMessage.warning('请输入真实姓名')
    return
  }
  if (!newUser.value.email.trim()) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!newUser.value.phone.trim()) {
    ElMessage.warning('请输入电话')
    return
  }
  if (!newUser.value.password.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  // 创建新用户
  const newUserData: User = {
    id: (users.value.length + 1).toString(),
    username: newUser.value.username.trim(),
    realName: newUser.value.realName.trim(),
    email: newUser.value.email.trim(),
    phone: newUser.value.phone.trim(),
    role: newUser.value.role,
    status: 'active',
    createTime: new Date().toLocaleString(),
    lastLoginTime: '-' as string
  }

  // 添加到用户列表
  users.value.push(newUserData)

  // 关闭对话框
  createUserDialogVisible.value = false

  // 提示成功
  ElMessage.success('用户创建成功')
}

const handleViewUser = (user: User) => {
  console.log('查看用户:', user)
}

const handleEditUser = (user: User) => {
  console.log('编辑用户:', user)
}

const handleToggleUserStatus = (user: User) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  
  ElMessageBox.confirm(`确定要${action}用户"${user.username}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: action === '禁用' ? 'warning' : 'success'
  }).then(() => {
    const userIndex = users.value.findIndex(item => item.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex].status = user.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`用户已${action}成功`)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

const handleDeleteUser = (user: User) => {
  ElMessageBox.confirm(`确定要删除用户"${user.username}"吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const userIndex = users.value.findIndex(item => item.id === user.id)
    if (userIndex !== -1) {
      users.value.splice(userIndex, 1)
      ElMessage.success('用户删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

const handleCreateRole = () => {
  console.log('创建角色')
}

const handleEditRole = (role: Role) => {
  console.log('编辑角色:', role)
}

const handlePermissionConfig = (role: Role) => {
  console.log('权限配置:', role)
}

const handleDeleteRole = (role: Role) => {
  ElMessageBox.confirm(`确定要删除角色"${role.name}"吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const roleIndex = roles.value.findIndex(item => item.id === role.id)
    if (roleIndex !== -1) {
      roles.value.splice(roleIndex, 1)
      ElMessage.success('角色删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

const handleSaveConfig = () => {
  // 保存系统配置
  console.log('保存系统配置:', systemConfig.value)
  ElMessage.success('系统配置保存成功')
}

const handleResetConfig = () => {
  // 重置系统配置
  systemConfig.value = {
    systemName: '水预算大模型平台',
    systemVersion: '1.0.0',
    systemDescription: '专注于水预算分析的智能平台',
    contactEmail: 'support@water-budget.com',
    contactPhone: '400-123-4567',
    showHome: true,
    allowRegister: true,
    allowGuestAccess: false
  }
  ElMessage.info('配置已重置')
}
</script>

<style scoped>
.system-management-container {
  padding: 20px;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.system-management-header {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.system-management-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

/* 标签页容器 */
.system-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.system-tabs :deep(.el-tabs__header) {
  flex-shrink: 0;
  margin-bottom: 0;
}

.system-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  min-height: 0;
  width: 100%;
}

.system-tabs :deep(.el-tab-pane) {
  min-height: 100%;
  width: 100%;
}

.tab-content {
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.tab-header span {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.user-list-card,
.role-list-card,
.log-list-card,
.config-card {
  margin-bottom: 20px;
  width: 100%;
}

.user-list-card :deep(.el-table),
.role-list-card :deep(.el-table),
.log-list-card :deep(.el-table) {
  width: 100% !important;
}

/* 系统配置表单 */
.config-card :deep(.el-form) {
  max-width: 800px;
  width: 100%;
}

.config-card :deep(.el-form-item__content) {
  max-width: 600px;
}

/* 系统监控卡片 */
.monitor-card {
  margin-bottom: 20px;
  width: 100%;
}

.monitor-card :deep(.el-card__body) {
  width: 100%;
}

.monitor-item {
  text-align: center;
}

.monitor-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.monitor-label {
  font-size: 14px;
  color: #606266;
}

.uptime-card {
  margin-top: 20px;
  width: 100%;
}

.uptime-card :deep(.el-card__body) {
  width: 100%;
}

.uptime-item {
  text-align: center;
}

.uptime-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.uptime-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

/* 栅格布局宽度约束 */
.tab-content :deep(.el-row) {
  width: 100%;
}

.tab-content :deep(.el-col) {
  width: 100%;
}
</style>
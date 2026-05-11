# 个人记账本 — 设计文稿

> 创建日期: 2026-05-11

---

## 一、项目概述

个人使用的记账应用，跟踪每月支出、收入和订阅，通过 Dashboard 可视化资金流向和分类情况。

### 核心理念
- **纯前端应用**，零后端，数据全部存储在浏览器本地
- **个人使用**，无需登录、无需多用户、无需付费功能
- **玻璃拟态 (Glassmorphism)** UI 风格，追求视觉美感
- **移动端优先**，兼顾桌面使用

---

## 二、技术选型

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Next.js | 15+ | 框架 | App Router、与现有项目一致 |
| TypeScript | 5.x | 语言 | 类型安全 |
| Tailwind CSS | v4 | 样式 | 已有项目一致、灵活 |
| Dexie.js | ^4.0 | 数据持久化 | IndexedDB 封装，远超 localStorage 限制 |
| Recharts | ^3.x | 图表 | 饼图、柱状图、趋势图 |
| lucide-react | latest | 图标 | 分类图标、UI 图标 |
| framer-motion | latest | 动画 | 页面过渡、卡片入场、微交互 |
| date-fns | ^4.x | 日期处理 | 月份导航、订阅周期计算 |

### 为什么不选其他方案

- **localStorage**: 5MB 存储上限，无法支持多年记账数据
- **SQLite / 后端方案**: 需要服务器，个人使用过于复杂
- **shadcn/ui**: 引入额外依赖，玻璃拟态需要深度定制，不如自建组件灵活
- **Zustand / Redux**: 单用户应用 Context 足够，Dexie 本身是数据源

---

## 三、数据模型

### Category (分类)

```typescript
interface Category {
  id: string           // 唯一标识，如 'food', 'salary'
  name: string         // 显示名称，如 '餐饮', '工资'
  type: 'expense' | 'income'
  icon: string         // lucide 图标名，如 'utensils-crossed', 'briefcase'
  color: string        // 十六进制色值，如 '#10b981'
  isDefault: boolean   // 是否默认分类（不可删除）
  order: number        // 排序权重
}
```

### Transaction (交易记录)

```typescript
interface Transaction {
  id?: number          // 自增主键 (Dexie auto-increment)
  amount: number       // 金额，始终为正数
  type: 'expense' | 'income'
  categoryId: string
  date: string         // ISO 日期 'YYYY-MM-DD'
  description: string  // 描述 / 商家名
  note?: string        // 可选备注
  createdAt: number    // Date.now()
  updatedAt?: number
}
```

### Subscription (订阅)

```typescript
interface Subscription {
  id?: number          // 自增主键
  name: string         // 订阅名称，如 'Netflix'
  amount: number
  categoryId: string
  billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly'
  nextBillingDate: string  // 下次扣款日期
  startDate: string
  active: boolean
  note?: string
  createdAt: number
  updatedAt?: number
}
```

### MonthlySummary (月度汇总 — 计算视图)

```typescript
interface MonthlySummary {
  year: number
  month: number         // 1-12
  totalIncome: number
  totalExpense: number
  netBalance: number
  expenseByCategory: {
    categoryId: string
    name: string
    icon: string
    color: string
    amount: number
    percentage: number
  }[]
  incomeByCategory: {
    // 同上
  }[]
}
```

---

## 四、数据录入方式

### 手动输入（主要方式）
- 通过表单录入每笔交易
- 字段: 金额、类型(支出/收入)、分类、日期、描述
- 大金额输入框自动聚焦，移动端弹出数字键盘
- 分类选择器以图标网格展示，直观快速

### 银行流水导入（补充方式）
- 支持 CSV / Excel 格式
- 解析标准银行账单字段（交易日期、金额、摘要）
- 自动匹配分类（基于关键词 + 机器学习规则）
- 批量创建交易记录
- 导入预览 + 确认流程

---

## 五、页面结构

```
/                  Dashboard    — 月度总览仪表盘
/transactions      交易列表      — 查看/筛选/搜索所有交易
/subscriptions     订阅管理      — 周期性账单管理
/categories        分类管理      — 支出/收入分类维护
```

### 底部导航栏

| 图标 | 标签 | 路径 |
|------|------|------|
| LayoutDashboard | 首页 | / |
| ArrowUpDown | 交易 | /transactions |
| Repeat | 订阅 | /subscriptions |
| Tags | 分类 | /categories |

---

## 六、UI 设计 — 玻璃拟态 (Glassmorphism)

### 设计语言

玻璃拟态的核心是 **半透明 + 模糊 + 层次感**，模拟毛玻璃的视觉效果。

### 背景设计

```
渐变抽象背景，作为玻璃卡片的底层衬底:

background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #ecfdf5 60%, #fdf2f8 100%)
```

柔和的蓝绿粉渐变，为玻璃卡片提供丰富的透底色。

### 卡片风格

```css
/* 玻璃卡片基础样式 */
.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}
```

### 配色方案

| 角色 | 颜色 |
|------|------|
| 背景渐变 | slate-100 → emerald-50 → blue-50 → pink-50 |
| 主色 / 收入 | emerald-500 `#10b981` |
| 支出 | rose-500 `#f43f5e` |
| 玻璃卡片 | white/20 + backdrop-blur-xl + border-white/30 |
| 导航栏 | white/10 + backdrop-blur-2xl + border-white/20 |
| 文字主色 | gray-800 |
| 文字辅助 | gray-500 |
| 输入框 | white/30 + backdrop-blur-md + border-white/30 |

### 布局

- 移动端优先，桌面端居中
- Container: `max-w-lg mx-auto`
- 底部固定导航
- 顶部月份切换器 + 标题
- 内容区域可滚动，padding-bottom 避开导航栏

### 视觉亮点清单

1. **渐变抽象背景** — 作为底层衬底，玻璃卡片透出底色
2. **玻璃卡片** — 半透明 + 20px 模糊 + 白色细边框
3. **卡片入场动画** — framer-motion fade + slide up，stagger children
4. **数字展示** — 大号加粗字体，收入翡翠绿、支出玫瑰红
5. **渐变色金额** — 关键数字使用 `bg-gradient-to-r` 文字渐变
6. **分类图标** — 带彩色玻璃圆形背景（半透明 + 模糊）
7. **月份切换器** — 顶部固定，左右箭头切换，显示"2026年5月"格式
8. **底部导航** — 毛玻璃效果，当前 Tab 高亮
9. **空状态** — 带插图和文案的引导卡片
10. **加载状态** — 玻璃风格骨架屏 pulse 动画

### 仪表盘布局

```
┌──────────────────────────────────┐
│  ◀  2026年5月            💰 记账 │  ← Header (玻璃效果)
├──────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐     │
│  │ 💰 收入   │  │ 💳 支出   │     │  ← 统计卡片 (玻璃效果)
│  │ ¥12,500  │  │ ¥8,320   │     │
│  ├──────────┤  ├──────────┤     │
│  │ 📊 结余   │  │ 📝 笔数   │     │
│  │ ¥4,180   │  │   47     │     │
│  └──────────┘  └──────────┘     │
│                                  │
│  ┌── 支出分类 ──────────────────┐ │
│  │  ┌─────┐                     │ │  ← 饼图 (玻璃卡片)
│  │  │     │  餐饮     35%       │ │
│  │  │ 饼  │  交通     20%       │ │
│  │  │ 图  │  购物     15%       │ │
│  │  └─────┘  娱乐     10%       │ │
│  └──────────────────────────────┘ │
│                                  │
│  ┌── 月度趋势 ──────────────────┐ │
│  │  ┌───────────────────┐       │ │  ← 柱状图 (玻璃卡片)
│  │  │   ██ ██            │       │ │
│  │  │   ██ ██ ██         │       │ │
│  │  │   ██ ██ ██ ██      │       │ │
│  │  └───────────────────┘       │ │
│  │  12月 1月 2月 3月 4月 5月    │ │
│  └──────────────────────────────┘ │
│                                  │
│  ┌── 最近交易 ──────────────────┐ │
│  │  🍔 午餐          -¥35       │ │  ← 交易列表 (玻璃卡片)
│  │  🚇 地铁          -¥5        │ │
│  │  💼 工资        +¥12,500     │ │
│  │  📦 淘宝购物      -¥299       │ │
│  │  ☕ 星巴克        -¥38        │ │
│  └──────────────────────────────┘ │
│                                  │
├──────────────────────────────────┤
│  🏠        📋        🔄        🏷️ │  ← 底部导航 (毛玻璃)
└──────────────────────────────────┘
```

---

## 七、默认分类数据

### 支出分类 (12 个)

| 名称 | 图标 | 颜色 |
|------|------|------|
| 餐饮 | UtensilsCrossed | `#10b981` |
| 交通 | Car | `#3b82f6` |
| 购物 | ShoppingBag | `#f59e0b` |
| 娱乐 | Gamepad2 | `#8b5cf6` |
| 居住 | Home | `#06b6d4` |
| 水电 | Zap | `#f97316` |
| 医疗 | Heart | `#ef4444` |
| 教育 | BookOpen | `#6366f1` |
| 通讯 | Smartphone | `#14b8a6` |
| 衣着 | Shirt | `#ec4899` |
| 旅行 | Plane | `#a855f7` |
| 其他 | MoreHorizontal | `#64748b` |

### 收入分类 (4 个)

| 名称 | 图标 | 颜色 |
|------|------|------|
| 工资 | Briefcase | `#10b981` |
| 兼职 | Laptop | `#3b82f6` |
| 投资 | TrendingUp | `#8b5cf6` |
| 其他 | Gift | `#f59e0b` |

---

## 八、订阅类型与周期

| 周期 | 标签 |
|------|------|
| weekly | 每周 |
| monthly | 每月 |
| quarterly | 每季度 |
| yearly | 每年 |

---

## 九、实现阶段

### Phase 1: 项目初始化 & 基础设施
- create-next-app 脚手架
- 安装依赖
- 类型定义、常量、工具函数、默认分类

### Phase 2: 数据层 (Dexie)
- IndexedDB 表结构
- CRUD 操作
- React hooks 封装

### Phase 3: UI 基础组件 & App 外壳
- 玻璃拟态 UI 组件 (Card, Button, Input, Modal...)
- AppShell 布局 (Header, MonthSelector, BottomNav)
- 全局样式、渐变背景

### Phase 4: 分类管理页面
- 分类列表（支出 / 收入分组）
- 分类表单（名称、类型、图标、颜色）

### Phase 5: 交易管理页面
- 交易表单（大金额输入、类型切换、分类选择）
- 交易列表（按日期分组）
- 筛选器（类型、分类、搜索）

### Phase 6: Dashboard（核心）
- 月度统计卡片
- 支出 / 收入饼图
- 6 个月趋势柱状图
- 最近交易列表

### Phase 7: 订阅管理页面
- 订阅表单（名称、金额、周期、日期）
- 订阅卡片（状态、倒计时）
- 即将扣款提醒

### Phase 8: 打磨 & 高级功能
- Framer Motion 动画
- PWA (可安装到手机)
- 数据 JSON 导入/导出
- **银行流水 CSV/Excel 导入**
- 所有边缘状态覆盖

---

## 十、关键技术决策

### 为什么用 Dexie.js 而非 localStorage
- 记账数据会持续增长，localStorage 的 5MB 上限不够用
- Dexie 支持索引查询：按月份、类型、分类高效筛选
- Dexie 有 `useLiveQuery`，数据变更自动刷新 UI

### 为什么用 Modal 而非独立页面做表单
- 记账是高频操作，Modal 不脱离当前上下文
- 在交易列表页直接弹出表单，用户能感知"刚记在哪"
- 保持月份选择状态不丢失

### 为什么用 Context 管理月份而非 URL
- 月份是全局状态，所有页面共享
- URL 查询参数会导致页面重新渲染，体验不如 Context 平滑
- 四个 Tab 共享同一个月份上下文

### 订阅的自动扣款逻辑
- 用户打开 app 时检测 `nextBillingDate`
- 若已过期且未生成对应交易，提示用户一键确认
- 确认后自动创建扣款交易并更新 `nextBillingDate`

---

## 十一、边缘状态清单

| 场景 | 处理方式 |
|------|---------|
| 首次使用，无数据 | Dashboard 显示空状态引导卡片 + "添加第一笔交易"按钮 |
| 某月无收入 | 收入饼图显示"本月暂无收入" |
| 某月无支出 | 支出饼图显示"本月暂无支出" |
| 某月无任何交易 | Dashboard 显示完整空状态 |
| 数据库加载中 | 骨架屏 loading 动画 |
| 交易列表为空 | "还没有交易记录" + 添加按钮 |
| 订阅列表为空 | "还没有订阅" + 添加按钮 |
| 筛选结果为空 | "没有符合条件的交易" + 清除筛选按钮 |
| 删除确认 | 所有删除操作前弹出确认对话框 |
| 月份切换 | 平滑过渡动画，数据懒加载 |
| 超过 12 月 | 自动跳转到下一年 1 月 |
| 早于 1 月 | 自动跳转到上一年 12 月 |

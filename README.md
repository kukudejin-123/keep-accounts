# 记账本 📒

> 个人财务管理助手 — 优雅地追踪每月的支出、收入和订阅

![Preview](docs/app-design/preview.png)

一款**玻璃拟态设计**的个人记账应用，数据全部存储在本地，无需注册、无需联网、不用担心隐私泄露。

---

## ✨ 功能

### 📊 Dashboard 仪表盘
- 月度收支概览（收入、支出、结余、笔数）
- **支出分类饼图** — 一目了然钱花在哪里
- **收入分类饼图** — 清楚知道钱从哪里来
- **6 个月趋势柱状图** — 收支变化趋势
- 最近交易速览

### 💰 交易管理
- 快速记账（支持支出/收入切换）
- 按日期自动分组，每日小计
- 按类型（支出/收入）、分类、关键词筛选搜索
- 编辑/删除已有交易

### 🔄 订阅管理
- 追踪周期性支出（每周/每月/每季度/每年）
- 下次扣款倒计时提示
- 活跃/暂停切换
- 30天内即将扣款汇总

### 🏷️ 分类管理
- **16 个默认分类**覆盖日常场景（餐饮、交通、购物等）
- 自定义分类名称、图标、颜色
- 默认分类不可误删

### 💾 数据管理
- **JSON 导出/导入** — 备份与恢复
- **CSV 银行流水导入** — 支持支付宝、微信支付、银行账单格式
- 关键词自动分类（如"麦当劳"→餐饮，"工资"→工资）

---

## 🎨 设计

| 特性 | 说明 |
|------|------|
| 设计风格 | 玻璃拟态 (Glassmorphism) |
| 背景 | 柔和蓝绿粉渐变 |
| 卡片 | 半透明毛玻璃效果 (`backdrop-blur-xl`) |
| 配色 | 翡翠绿主色 / 玫瑰红支出色 |
| 布局 | 移动端优先，max-w-lg 居中 |
| 动画 | Framer Motion 页面过渡与列表入场 |

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 打开浏览器访问
open http://localhost:3000
```

---

## 📦 打包部署

### Windows 桌面版 (Electron)

```bash
# 打包为安装程序
npm run electron:build

# 输出: release/记账本 Setup 1.0.0.exe
```

### Android 移动版 (Capacitor)

```bash
# 构建 Web + 同步到 Android 项目
npm run mobile:build

# 用 Android Studio 打开并构建 APK
npm run mobile:open
```

需要安装 [Android Studio](https://developer.android.com/studio) 并配置 `ANDROID_HOME` 环境变量。

### PWA (浏览器安装)

打开 `http://localhost:3000` → Chrome 菜单 → **添加到主屏幕**

---

## 🧱 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 16](https://nextjs.org) (App Router) | 框架 |
| [TypeScript](https://www.typescriptlang.org) | 类型安全 |
| [Tailwind CSS v4](https://tailwindcss.com) | 样式 |
| [Dexie.js](https://dexie.org) | 客户端持久化 (IndexedDB) |
| [Recharts](https://recharts.org) | 图表（饼图、柱状图） |
| [lucide-react](https://lucide.dev) | 图标 |
| [framer-motion](https://framer.com/motion) | 动画 |
| [date-fns](https://date-fns.org) | 日期处理 |
| [Electron](https://www.electronjs.org) | 桌面打包 |
| [Capacitor](https://capacitorjs.com) | 移动端打包 |

---

## 📁 项目结构

```
src/
├── app/                    # 页面路由
│   ├── page.tsx            # Dashboard
│   ├── transactions/       # 交易管理
│   ├── subscriptions/      # 订阅管理
│   └── categories/         # 分类管理
├── components/
│   ├── ui/                 # 原子组件 (玻璃拟态风格)
│   ├── layout/             # 布局外壳
│   ├── dashboard/          # Dashboard 组件
│   ├── transactions/       # 交易组件
│   ├── subscriptions/      # 订阅组件
│   └── categories/         # 分类组件
├── hooks/                  # React Hooks
├── lib/                    # 工具库 (DB、CSV解析、常量)
└── types/                  # TypeScript 类型
```

---

## 📄 开源协议

MIT

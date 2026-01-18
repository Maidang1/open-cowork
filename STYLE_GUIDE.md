# Re.Poem Design System (Style Guide)

> **Version:** 1.0.0  
> **Last Updated:** 2026-01-18  
> **Keywords:** Minimalist, Skeuomorphic, Serene, Literary

## 1. Design Principles (设计理念)

Re.Poem 的设计语言旨在营造一种**“数字时代的纸质温情”**。它结合了极简主义的留白与拟物化的物理质感，通过细腻的光影变化，让用户在屏幕上也能感受到“拼贴”的手工乐趣。

*   **Airy (通透)**: 使用大面积的浅色渐变和磨砂玻璃效果，模拟天空与呼吸感。
*   **Tactile (触感)**: 每一个可交互元素都应具有物理属性（厚度、重量、阴影）。
*   **Literary (文艺)**: 坚持使用衬线字体，传递文字的温度与故事感。

---

## 2. Color System (色彩体系)

色彩策略极度克制，通过亮度的微弱变化来区分层级，避免高饱和度颜色的干扰。

### 2.1 Primary Palette (主色调)
用于营造整体氛围背景。

| Token Name | Value (Hex/CSS) | Usage |
| :--- | :--- | :--- |
| `Aurora Blue` | `#D4F1F4` | 页面顶部渐变起始色，模拟清晨天空 |
| `Mist Grey` | `#F1F3F5` | 页面中部过渡色 |
| `Paper White` | `#F5F7FA` | 页面底部及通用背景底色 |

**Implementation:**
```css
background: linear-gradient(180deg, #D4F1F4 0%, #F1F3F5 40%, #F5F7FA 100%);
```

### 2.2 Neutral Palette (中性色)
用于文本、边框和图标。

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `Ink Black` | `#2C2C2C` | 主要标题、正文 (避免纯黑 #000) |
| `Pencil Grey` | `#888888` | 辅助说明、副标题、非活性状态 |
| `Line Grey` | `#CBD5E0` | 虚线边框、分割线 |

### 2.3 Surface (表面色)
用于卡片、贴纸和容器背景。

| Token Name | Value | Opacity | Usage |
| :--- | :--- | :--- | :--- |
| `Sticker White` | `#FFFFFF` | 100% | 词条贴纸背景 |
| `Glass White` | `#FFFFFF` | 20% - 50% | 画布、工具栏背景 (配合 Backdrop Blur) |

---

## 3. Typography (排版)

排版是本设计系统的灵魂。放弃通用的无衬线体 (Sans-serif)，全面拥抱衬线体 (Serif) 以强化文学属性。

### 3.1 Font Family
优先使用系统自带的高质量宋体/衬线体，无需加载额外的 Web Font 以保持高性能。

```css
font-family: "Songti SC", "Noto Serif SC", "Times New Roman", serif;
```

### 3.2 Type Scale (字号阶梯)

| Style | Size | Weight | Line Height | Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | 24px | 700 (Bold) | 1.2 | 1px | 页面主标题 |
| **Body (Sticker)** | 16px | 400 (Regular)| 1.5 | Normal | 拼贴词条内容 |
| **Button** | 14px | 400 (Regular)| 1.0 | 0.5px | 按钮文字 |
| **Caption** | 14px | 400 (Regular)| 1.4 | Normal | 辅助说明、Footer |

---

## 4. Elevation & Material (层级与质感)

通过阴影系统定义元素的 Z 轴高度。不仅是视觉装饰，更是交互状态的直接反馈。

### 4.1 Shadow Levels (阴影层级)

*   **Level 1 (Resting)**: 贴纸静止在平面上。
    *   `box-shadow: 0 2px 4px rgba(0,0,0,0.05);`
*   **Level 2 (Hover)**: 鼠标悬停，暗示可交互。
    *   `box-shadow: 0 4px 6px rgba(0,0,0,0.08);`
    *   `transform: translateY(-1px);`
*   **Level 3 (Dragging)**: 元素被“拿起”，脱离平面。
    *   `box-shadow: 0 15px 30px rgba(0,0,0,0.15);`
    *   `transform: scale(1.05);`

### 4.2 Border Radius (圆角)

*   **Micro Radius (2px)**: 用于 **Sticker (词条)**。保持纸张剪裁的锐利感，但去除绝对尖角。
*   **Medium Radius (12px)**: 用于 **Containers (画布、工具箱)**。提供柔和的视觉边界。
*   **Full Radius (20px+)**: 用于 **Buttons (按钮)**。

---

## 5. Components (组件规范)

### 5.1 Sticker (拼贴词条)
核心原子组件。

*   **Padding**: `6px 12px` (紧凑但有呼吸感)
*   **Background**: `#FFFFFF`
*   **Interaction**: 必须包含 `cursor: grab` (静止) 和 `cursor: grabbing` (拖拽中)。

### 5.2 Canvas Area (拼贴画布)
承载创意的容器。

*   **Border**: `2px dashed #CBD5E0` (虚线暗示这是一个“填空”区域)。
*   **Background**: `rgba(255, 255, 255, 0.2)` (极低透明度，透出背景渐变)。

### 5.3 Glass Panel (毛玻璃面板)
用于侧边栏或工具箱。

*   **Background**: `rgba(255, 255, 255, 0.5)`
*   **Backdrop Filter**: `blur(10px)`
*   **Border**: 无边框或极细的白边。

---

## 6. Layout & Spacing (布局与间距)

*   **Grid**: 灵活的 Flexbox 布局，不强制对齐网格，鼓励错落有致的自然感。
*   **Whitespace**: 
    *   组件内间距 (Padding) 较小 (6-12px)。
    *   容器间距 (Gap) 较大 (40px+)，确保视觉中心聚焦于画布。

---

## 7. Animation (动效)

动效必须迅速且优雅，不能拖泥带水。

*   **Duration**: 大部分交互（Hover, Click）控制在 `0.2s` - `0.3s`。
*   **Easing**: 使用 `ease-out`，模拟物理惯性。
*   **Refresh**: 刷新词条时，使用 `opacity` 淡入淡出，避免生硬的 DOM 替换。

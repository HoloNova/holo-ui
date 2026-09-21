# Apple Motion & Fluid Springs (动效与物理阻尼)

> **设计心法**：在 iOS 中，物体移动不是凭空产生又凭空停止的。界面元素具有**质量（Mass）**、**刚度（Stiffness）**与**阻尼（Damping）**。这种符合真实物理直觉的微小反馈，是 Apple 流畅度（Smoothness）的本源。

---

## 1. 弹簧物理模型 (Spring Physics)

不同于传统的前端 `ease-in-out`（有机械的恒定加速度），Apple 采用 **CASpringAnimation** 物理模型：

- **无过冲弹簧（Critically Damped Spring）**：平滑到达终点，绝无回弹多余抖动。用于 Sheet 抽屉拉出、页面转场、对话框弹出。
- **轻微过冲弹簧（Under-damped Spring）**：在终点处有极微小的弹跳（Bounce < 5%）。用于点赞爱心放大、开关拨动、浮动提示出现。

---

## 2. 官方标准贝塞尔曲线对照 (Web Approximations)

当你在 CSS 或 Web 动画中使用时，直接采用以下调校完成的曲线：

### ① 标准平滑弹簧 (Standard Apple Spring)
用于大部分界面展开、抽屉、模态框拉出：
```css
/* 模拟 response: 0.35s, dampingRatio: 0.85 */
transition-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
transition-duration: 320ms;
```

### ② 迅捷反馈曲线 (Snappy Fluid Spring)
用于开关点击、按钮收缩、分段选择器切换：
```css
/* 模拟 response: 0.22s, dampingRatio: 0.9 */
transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
transition-duration: 200ms;
```

### ③ 自然减速曲线 (Decelerating Ease Out)
用于列表滑动停止、离开屏幕：
```css
transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
transition-duration: 400ms;
```

---

## 3. 按压物理反馈 (Touch Down Scaling)

在 Apple 界面中，几乎所有可点击的大块卡片或操作按钮，在手指按下（`:active`）时都会产生**轻微下沉收缩**：

```css
.apple-interactive-button {
  transition: transform 140ms cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.apple-interactive-button:active {
  /* 均匀缩小 3%~4%，产生被按下的触感 */
  transform: scale(0.96);
}
```

---

## 4. 减弱动态效果支持 (Reduce Motion)

HIG 极其重视无障碍体验（Accessibility）。若用户系统设置了减弱动态效果，所有弹簧动效应平滑降级为瞬时或纯透明度淡入：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

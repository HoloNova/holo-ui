# Apple Materials, Vibrancy & Liquid Glass (材质与光感)

> **设计心法**：在现实物理世界中，材料具有透明度、折射率、漫反射和厚度。Apple 界面的核心魅力在于：**界面层级不是用灰白线条切出来的，而是用不同厚度的“半透明材质”与“环境光高光”堆叠出来的。**

---

## 1. 材质的四大厚度层级 (Material Thickness)

HIG 将半透明模糊材质划分为不同厚度，层级越深、承载的信息越重，材质越厚：

| 材质等级 | 浅色模式背景 | 模糊度与饱和度 | 典型应用场景 |
|:---|:---|:---|:---|
| **Ultra Thin** | `rgba(255, 255, 255, 0.55)` | `blur(12px) saturate(160%)` | 快速划过的全局遮罩、次级浮窗 |
| **Thin** | `rgba(255, 255, 255, 0.68)` | `blur(18px) saturate(180%)` | 搜索栏背景、浮动胶囊条 |
| **Regular** | `rgba(255, 255, 255, 0.78)` | `blur(25px) saturate(190%)` | 标准顶部导航栏、底部分页栏（Tab Bar） |
| **Thick** | `rgba(255, 255, 255, 0.90)` | `blur(35px) saturate(200%)` | 常驻侧边栏、复杂表单浮层 |

### Web CSS 实现范本
```css
.apple-material-regular {
  background-color: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(25px) saturate(190%);
  -webkit-backdrop-filter: blur(25px) saturate(190%);
}

.dark .apple-material-regular {
  background-color: rgba(28, 28, 30, 0.82);
  backdrop-filter: blur(25px) saturate(190%);
  -webkit-backdrop-filter: blur(25px) saturate(190%);
}
```

---

## 2. WWDC 最新范式：Liquid Glass (流动玻璃)

在最新的 Apple 设计中（特别是 visionOS 与 iOS 新代），Apple 升级了“普通毛玻璃”，引入了 **Liquid Glass** 概念：
不仅有模糊，还模拟了**玻璃厚度造成的边缘微反射与顶部镜面高光**。

### Liquid Glass 的三层叠加密码
1. **半透基底**：高透光率底色；
2. **边缘微发光（Inner Highlight）**：顶部必须有 1 条 1px 的白色微光，模拟环境光在玻璃顶部的折射；
3. **极柔漫反射（Diffused Shadow）**：阴影散得极开、透明度极低（5%~10%）。

```css
.apple-liquid-glass {
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  /* 顶部 1px 镜面光 + 外部极柔投影 */
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 8px 32px rgba(0, 0, 0, 0.08);
}

.dark .apple-liquid-glass {
  background: rgba(30, 30, 32, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 10px 36px rgba(0, 0, 0, 0.45);
}
```

---

## 3. 什么是 Vibrancy（色彩共鸣）？

在原生 iOS 中，文字置于毛玻璃之上时，并不是简单的灰色，而是透过特殊的混合模式（Blend Mode），让背后的背景颜色轻微渗入文字中，使文字与背景在视觉上“融合为一体”：

- **CSS 模拟 Vibrancy**：
```css
.apple-vibrant-label {
  color: rgba(60, 60, 67, 0.75);
  /* 在支持的环境下混合背景高光 */
  mix-blend-mode: multiply;
}

.dark .apple-vibrant-label {
  color: rgba(235, 235, 245, 0.75);
  mix-blend-mode: screen;
}
```

# 🎬 WWDC 官方精选设计视频与核心要点 (WWDC Design Sessions)

> **本文件整合自**：`developer.apple.com/design/` Featured Design Videos  
> **核心用途**：将苹果官方资深设计师在 WWDC 上分享的重磅设计思想直接提炼为核心知识要点，省去逐个观看 40 分钟视频的时间。

---

## 1. 重磅专题：Meet Liquid Glass (遇见流动玻璃材质)

- **官方链接**：[WWDC Session 219: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- **设计要点总结**：
  1. **告别扁平单调的模糊**：以往的毛玻璃（Frosted Glass）只是对背后像素做高斯模糊（Gaussian Blur）；新一代 **Liquid Glass** 引入了“镜面边缘厚度”（Edge Thickness）与“折射微光”（Refraction Tint）。
  2. **三层光学物理结构**：
     - **底阻隔层（Backdrop Material）**：高饱和度、高透光基底。
     - **内折射高光（Inner Specular）**：在卡片或导航栏顶端永远保留一条 1px 细发光边（模拟真实玻璃棱边反射天光）。
     - **极柔漫射光（Soft Ambient Diffusion）**：不再使用浓黑色投影，而是结合背景色微调阴影扩散范围。
  3. **视觉层次分明**：当界面元素重叠时，下层元素产生透光色散，让空间纵深更加立体自然。

---

## 2. 系统进化：Get to know the new design system (探索新代设计系统)

- **官方链接**：[WWDC Session 356: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)
- **设计要点总结**：
  1. **视觉减负（Visual Decluttering）**：移除非必要的线框和分割条，改用**空间留白**与**材质阶梯**来划分内容区域。
  2. **内容退后，沉浸优先（Immersive Deference）**：UI 边缘大量采用平滑淡出，工具栏随滑动自动折叠隐退。
  3. **跨平台一致性**：iOS、iPadOS、macOS 和 visionOS 的圆角曲率、按钮形变触感实现了统一的参数化映射。

---

## 3. 图标新貌：Say hello to the new look of app icons (App 图标设计演进)

- **官方链接**：[WWDC Session 220: Say hello to the new look of app icons](https://developer.apple.com/videos/play/wwdc2025/220/)
- **设计要点总结**：
  1. **分层图标渲染（Layered Icons）**：图标不再是一张固态平面图，而是拆分为背景层、符号层、质感高光层。
  2. **深浅色自适应与染色（Tinted App Icons）**：用户在 iOS 上自定义桌面色调时，图标符号会动态自适应提取主色彩并与环境光相融。
  3. **动态深度响应**：支持倾斜视角下的轻微视差（Parallax）与光泽微移动。

---

## 4. 从创意到界面：Design foundations from idea to interface

- **官方链接**：[WWDC Session 359: Design foundations from idea to interface](https://developer.apple.com/videos/play/wwdc2025/359/)
- **设计要点总结**：
  1. **草图阶段抓关键动词**：苹果设计团队在立项时，首先提炼出该界面最关键的“单个核心动词”（例如：“阅读”、“审核”、“聆听”），所有按钮与辅助布局围绕该动词做减法。
  2. **信息层级黄金三问**：
     - 用户进到这个页面，第一眼能确认他在哪里吗？
     - 用户下一步最应该点哪里？（主视觉锚点只有一个）
     - 如何确保取消/返回动作最自然？

---

## 5. 优秀设计案例：Apple Design Awards (年度设计获奖心得)

- **官方链接**：[developer.apple.com/design/awards/](https://developer.apple.com/design/awards/)
- **从获奖 App 中提炼的设计哲学**：
  - **Inclusivity (包容性)**：动态字体缩放（Dynamic Type）不破位，全键盘与旁白（VoiceOver）完全无障碍。
  - **Delight & Fun (惊喜感)**：微交互（如滑动拉到头时的弹性波纹反馈）让原本枯燥的操作充满生命力。
  - **Spatial Interaction (空间感)**：视线所及处高亮、操作响应自然无压迫。

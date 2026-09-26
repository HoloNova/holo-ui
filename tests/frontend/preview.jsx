import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editorial3DOrbitCarousel } from '../../rewampui-components/components/cards/editorial-3-d-orbit-carousel.snippet.jsx';
import { PerspectiveFlipDeck } from '../../rewampui-components/components/cards/perspective-flip-deck.snippet.jsx';
import { DiagonalCardStack } from '../../rewampui-components/components/cards/diagonal-card-stack.snippet.jsx';

function App() {
  const [isStacked, setIsStacked] = useState(false);
  const [clickedInfo, setClickedInfo] = useState('');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 space-y-12 max-w-5xl mx-auto font-sans">
      <header className="border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Holo UI
          </span>
          <h1 className="text-2xl font-bold tracking-tight">3D 卡片组件本地交互验收预览</h1>
        </div>
        <p className="text-sm text-neutral-400 mt-2">
          用于在真实现代浏览器中手动体验三款卡片组件的 3D 透视视差、弹簧动力学及触控/点击交互手感。
        </p>
      </header>

      {/* 1. Editorial 3D Orbit Carousel */}
      <section className="bg-neutral-900/60 p-6 md:p-8 rounded-2xl border border-neutral-800/80 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-lg font-semibold tracking-tight">1. Editorial 3D Orbit Carousel (钟臂式倾斜轨道轮播)</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            特性：Snappy 机械节奏、宽步幅对角线倾角、支持鼠标/手指拖拽 Scrub、点击任意卡片立即步进吸附到中央。
          </p>
        </div>
        <div className="h-[440px] flex items-center justify-center overflow-visible bg-neutral-950/40 rounded-xl border border-neutral-800/40">
          <Editorial3DOrbitCarousel autoTick={true} autoRotate={true} />
        </div>
      </section>

      {/* 2. Perspective Flip Deck */}
      <section className="bg-neutral-900/60 p-6 md:p-8 rounded-2xl border border-neutral-800/80 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <h2 className="text-lg font-semibold tracking-tight">2. Perspective Flip Deck (3D 透视折扇卡组)</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            特性：暗黑黑曜石等轴透视扇形排布。点击舞台触发 650ms 右侧垂直轴掀开翻折动效，随后的卡片平滑弹簧前推。
          </p>
        </div>
        <div className="h-[380px] flex items-center justify-center bg-neutral-950/40 rounded-xl border border-neutral-800/40">
          <PerspectiveFlipDeck autoPlay={false} />
        </div>
      </section>

      {/* 3. Diagonal Card Stack */}
      <section className="bg-neutral-900/60 p-6 md:p-8 rounded-2xl border border-neutral-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h2 className="text-lg font-semibold tracking-tight">3. Diagonal Card Stack (对角线连续阶梯流 / 中心叠牌)</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              特性：沿对角线连续滑动；支持斜向沿轴拖拽；支持一键平滑坍缩为中心 3D 等轴叠牌卡堆。
            </p>
          </div>
          <button
            onClick={() => setIsStacked(!isStacked)}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            {isStacked ? '切换为：斜向流式 (Stream)' : '切换为：中心叠牌 (Stacked)'}
          </button>
        </div>
        {clickedInfo && (
          <div className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
            {clickedInfo}
          </div>
        )}
        <div className="h-[500px] flex items-center justify-center bg-neutral-950/40 rounded-xl border border-neutral-800/40">
          <DiagonalCardStack
            isStacked={isStacked}
            autoPlay={true}
            onCardClick={(card, idx) => setClickedInfo(`触发点击回调: 卡片 [${card.id}] "${card.title}" (索引: ${idx})`)}
          />
        </div>
      </section>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

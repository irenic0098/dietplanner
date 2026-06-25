import React, { useState, useEffect, useRef } from 'react';

const slides = [
  {
    id: 0,
    thought: 'Balance Your Plate',
    subtitle: 'Fill half with vegetables, a quarter with protein, and a quarter with wholegrains — every meal is a step toward vitality.',
    emoji: '🥗',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)',
    accentColor: '#34d399',
    icon: '⚖️',
    particles: ['🥦', '🍎', '🫐', '🥑'],
  },
  {
    id: 1,
    thought: 'Move with Intent',
    subtitle: 'Every step, stretch, and breath of fresh air is an investment in the strongest version of yourself.',
    emoji: '🏃',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #312e81 100%)',
    accentColor: '#818cf8',
    icon: '⚡',
    particles: ['🏋️', '🧘', '🚴', '💪'],
  },
  {
    id: 2,
    thought: 'Recharge Your Mind',
    subtitle: 'Rest is not a reward — it is a requirement. Give your mind the stillness it deserves to grow stronger.',
    emoji: '🧠',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
    accentColor: '#fbbf24',
    icon: '🌙',
    particles: ['😴', '🌿', '🎵', '✨'],
  },
];

export default function MindfulSlideshow() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState('right'); // 'right' | 'left'
  const [animating, setAnimating] = useState(false);
  const [floatParticle, setFloatParticle] = useState(null);
  const intervalRef = useRef(null);

  const goTo = (index, dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 500);
  };

  const next = () => {
    const nextIdx = (current + 1) % slides.length;
    goTo(nextIdx, 'right');
  };

  const prev = () => {
    const prevIdx = (current - 1 + slides.length) % slides.length;
    goTo(prevIdx, 'left');
  };

  // Auto-advance every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => clearInterval(intervalRef.current);
  }, [current, animating]);

  // Random floating particle effect
  useEffect(() => {
    const timer = setInterval(() => {
      const particles = slides[current].particles;
      const p = particles[Math.floor(Math.random() * particles.length)];
      setFloatParticle({ emoji: p, id: Date.now(), x: Math.random() * 80 + 10, delay: 0 });
      setTimeout(() => setFloatParticle(null), 2200);
    }, 1800);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  const slideClass = animating
    ? direction === 'right'
      ? 'slide-exit-left'
      : 'slide-exit-right'
    : 'slide-enter';

  return (
    <>
      <style>{`
        .mindful-slideshow {
          perspective: 1200px;
          position: relative;
          width: 100%;
          margin-bottom: 32px;
          overflow: hidden;
          border-radius: 28px;
        }

        .slide-3d-wrapper {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          min-height: 200px;
          transform-style: preserve-3d;
        }

        .slide-card {
          position: relative;
          width: 100%;
          min-height: 200px;
          border-radius: 28px;
          padding: 40px 48px;
          display: flex;
          align-items: center;
          gap: 40px;
          overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.5s ease;
        }

        /* Background gradient overlay */
        .slide-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--slide-gradient);
          opacity: 0.92;
          border-radius: 28px;
          z-index: 0;
        }

        /* Glassmorphism shine layer */
        .slide-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
          border-radius: 28px 28px 0 0;
          pointer-events: none;
          z-index: 1;
        }

        /* 3D tilt on hover */
        .slide-3d-wrapper:hover .slide-card {
          transform: rotateX(2deg) rotateY(-1deg) scale(1.01);
          box-shadow: 0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
        }

        /* Enter animation — comes from right */
        @keyframes slideFromRight {
          from { transform: translateX(60px) rotateY(-15deg); opacity: 0; }
          to   { transform: translateX(0) rotateY(0deg); opacity: 1; }
        }
        /* Enter animation — comes from left */
        @keyframes slideFromLeft {
          from { transform: translateX(-60px) rotateY(15deg); opacity: 0; }
          to   { transform: translateX(0) rotateY(0deg); opacity: 1; }
        }
        @keyframes slideExitLeft {
          from { transform: translateX(0) rotateY(0deg); opacity: 1; }
          to   { transform: translateX(-60px) rotateY(15deg); opacity: 0; }
        }
        @keyframes slideExitRight {
          from { transform: translateX(0) rotateY(0deg); opacity: 1; }
          to   { transform: translateX(60px) rotateY(-15deg); opacity: 0; }
        }

        .slide-enter {
          animation: slideFromRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .slide-enter-from-left {
          animation: slideFromLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .slide-exit-left {
          animation: slideExitLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .slide-exit-right {
          animation: slideExitRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Emoji orb */
        .slide-orb {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.2rem;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.3);
          animation: orbFloat 3s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          50%       { transform: translateY(-10px) rotateZ(3deg); }
        }

        .slide-icon-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: 2px solid rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        /* Text content */
        .slide-content {
          position: relative;
          z-index: 2;
          flex-grow: 1;
          color: #fff;
        }

        .slide-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.9);
          padding: 4px 12px;
          border-radius: 99px;
          margin-bottom: 12px;
        }

        .slide-title {
          font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 10px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .slide-subtitle {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          max-width: 520px;
          font-weight: 400;
        }

        /* Decorative grid */
        .slide-decor-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          border-radius: 28px;
        }

        /* Glowing blob */
        .slide-blob {
          position: absolute;
          right: -60px;
          top: -60px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          filter: blur(60px);
          z-index: 0;
          animation: blobPulse 4s ease-in-out infinite;
        }

        @keyframes blobPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 0.9; }
        }

        /* Controls */
        .slide-controls {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 48px 0;
        }

        .slide-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .slide-dot.active {
          width: 28px;
          border-radius: 4px;
          background: #ffffff;
        }

        .slide-nav-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .slide-nav-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        /* Floating particle */
        @keyframes particleRise {
          0%   { transform: translateY(0px) scale(0.5); opacity: 0; }
          20%  { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { transform: translateY(-120px) scale(0.6); opacity: 0; }
        }

        .float-particle {
          position: absolute;
          font-size: 1.6rem;
          z-index: 5;
          pointer-events: none;
          bottom: 24px;
          animation: particleRise 2.2s ease-out forwards;
        }

        /* Slide counter */
        .slide-counter {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.08em;
        }

        /* Bottom accent bar */
        .slide-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(255,255,255,0.6);
          border-radius: 0 3px 3px 0;
          z-index: 5;
          animation: slideProgress 4s linear infinite;
        }

        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (max-width: 640px) {
          .slide-card {
            flex-direction: column;
            padding: 28px 24px;
            text-align: center;
            min-height: 260px;
          }
          .slide-orb {
            width: 80px;
            height: 80px;
            font-size: 2.2rem;
          }
          .slide-controls {
            padding: 12px 24px 0;
          }
          .slide-subtitle {
            font-size: 0.88rem;
          }
        }
      `}</style>

      <div className="mindful-slideshow">
        <div className="slide-3d-wrapper">
          <div
            className={`slide-card ${slideClass}`}
            style={{ '--slide-gradient': slide.gradient }}
          >
            {/* Decorations */}
            <div className="slide-decor-grid" />
            <div className="slide-blob" />

            {/* Floating particle */}
            {floatParticle && (
              <span
                className="float-particle"
                key={floatParticle.id}
                style={{ left: `${floatParticle.x}%` }}
              >
                {floatParticle.emoji}
              </span>
            )}

            {/* Emoji orb */}
            <div className="slide-orb">
              {slide.emoji}
              <span className="slide-icon-badge">{slide.icon}</span>
            </div>

            {/* Text */}
            <div className="slide-content">
              <div className="slide-tag">Daily Wisdom · #{current + 1}</div>
              <h2 className="slide-title">{slide.thought}</h2>
              <p className="slide-subtitle">{slide.subtitle}</p>
            </div>

            {/* Progress bar */}
            <div
              className="slide-progress-bar"
              key={`${current}-progress`}
            />
          </div>

          {/* Controls row overlaid below card */}
        </div>

        {/* Navigation controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 4px',
          }}
        >
          <button className="slide-nav-btn" onClick={prev}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            ‹
          </button>

          <div className="slide-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`slide-dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i, i > current ? 'right' : 'left')}
                style={i === current ? { background: 'var(--primary)' } : { background: 'var(--border)' }}
              />
            ))}
          </div>

          <button className="slide-nav-btn" onClick={next}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}

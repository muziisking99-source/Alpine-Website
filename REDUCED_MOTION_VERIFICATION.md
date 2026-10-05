# Reduced Motion & Performance Verification

## ✓ Reduced Motion Support

### Component-Level Gates
- **All Motion scenes**: Check `useReducedMotion()` and provide static fallbacks
- **Hero**: Adjusts from 200dvh to 100dvh when reduced motion enabled
- **3D Animations**: All rotateY, transform values respect reduce flag
- **Stagger animations**: Disabled (staggerChildren: 0) with reduced motion
- **Magnetic effects**: Completely disabled with reduced motion
- **Spotlight tilt**: Completely disabled with reduced motion

### Feature Gates  
**SmoothScroll (Lenis) disabled when:**
- `prefers-reduced-motion: reduce`
- Save-Data header present
- deviceMemory ≤ 2GB
- Touch/coarse pointer (mobile)
- Viewport width < 768px

**3D Scene quality reduced when:**
- Same gates as above → mode: "backdrop" instead of "full"

### CSS Respects Reduced Motion
- Smooth scroll behavior disabled
- Button/card hover transforms disabled
- Aurora animations disabled
- Ink-accent sweep disabled
- Ruler progress disabled

## ✓ Performance Optimizations

### Asset Optimization
- Logo: 439KB → 17KB (webp) / 13KB (png) [96% reduction]
- Lazy-loaded scenes after page load + requestIdleCallback
- Hero scene only mounts at 30% intersection

### Content Visibility
- CV-auto utility defined in CSS
- Applied to below-fold sections via `deferPaint` prop

### Scroll Performance
- CSS scroll-driven animations for ruler (no JS)
- Lenis only active on capable devices
- Motion useScroll optimized with specific offsets

## ✓ Hydration & SSR
- LazyMotion with domAnimation features
- Suspense boundaries around all 3D scenes
- Static fallbacks prevent layout shift

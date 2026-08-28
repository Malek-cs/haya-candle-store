// تأثير الإمالة ثلاثية الأبعاد + لمعة الضوء المتحركة على كروت المنتجات
// (Client-only utility - يشتغل عبر CSS custom properties، بدون حاجة لـ React state/re-render)
const MAX_TILT_DEG = 12

export function handleTiltMove(e) {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height

  el.style.setProperty('--tilt-rx', `${((0.5 - py) * MAX_TILT_DEG).toFixed(2)}deg`)
  el.style.setProperty('--tilt-ry', `${((px - 0.5) * MAX_TILT_DEG).toFixed(2)}deg`)
  el.style.setProperty('--tilt-mx', `${(px * 100).toFixed(1)}%`)
  el.style.setProperty('--tilt-my', `${(py * 100).toFixed(1)}%`)
  el.style.setProperty('--tilt-sheen', '1')
}

export function handleTiltLeave(e) {
  const el = e.currentTarget
  el.style.setProperty('--tilt-rx', '0deg')
  el.style.setProperty('--tilt-ry', '0deg')
  el.style.setProperty('--tilt-sheen', '0')
}

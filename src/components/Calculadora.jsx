import { useState, useRef, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { FaCalculator, FaTimes, FaArrowsAlt } from 'react-icons/fa'

function Calculadora({ onClose }) {
  const [display, setDisplay] = useState('0')
  const [pos, setPos] = useState({ x: 20, y: 100 })
  const [size, setSize] = useState({ w: 320, h: 480 })
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const startSize = useRef({ w: 0, h: 0, x: 0, y: 0 })

  const input = (val) => {
    if (display === '0' && val!== '.') setDisplay(val)
    else if (val === 'C') setDisplay('0')
    else if (val === '=') {
      try {
        setDisplay(eval(display.replace(/×/g, '*').replace(/÷/g, '/')).toString())
      } catch {
        setDisplay('Erro')
      }
    }
    else setDisplay(display + val)
  }

  // Pega posição do mouse ou touch
  const getClientPos = (e) => {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  const startDrag = (e) => {
    e.preventDefault()
    setDragging(true)
    const pos = getClientPos(e)
    offset.current = {
      x: pos.x - pos.x,
      y: pos.y - pos.y
    }
    // Correção: salva a posição atual
    const rect = e.currentTarget.getBoundingClientRect()
    offset.current = {
      x: pos.x - rect.left,
      y: pos.y - rect.top
    }
  }

  const startResize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    const pos = getClientPos(e)
    startSize.current = {
      w: size.w,
      h: size.h,
      x: pos.x,
      y: pos.y
    }
  }

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging &&!resizing) return
      e.preventDefault()
      const pos = getClientPos(e)

      if (dragging) {
        setPos({
          x: pos.x - offset.current.x,
          y: pos.y - offset.current.y
        })
      }
      if (resizing) {
        const newW = Math.max(280, startSize.current.w + (pos.x - startSize.current.x))
        const newH = Math.max(400, startSize.current.h + (pos.y - startSize.current.y))
        setSize({ w: newW, h: newH })
      }
    }

    const handleUp = () => {
      setDragging(false)
      setResizing(false)
    }

    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      document.addEventListener('touchmove', handleMove, { passive: false })
      document.addEventListener('touchend', handleUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleUp)
    }
  }, [dragging, resizing])

  const btns = [
    'C', '(', ')', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ]

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        background: 'var(--escura-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        touchAction: 'none' // Importante pro mobile
      }}
    >
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{
          padding: '12px 16px',
          background: 'var(--intermediaria-color)',
          borderRadius: '12px 12px 0 0',
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaArrowsAlt style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Calculadora</span>
        </div>
        <FaTimes
          onClick={onClose}
          style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
        />
      </div>

      <div style={{
        padding: '20px',
        fontSize: '2rem',
        textAlign: 'right',
        background: 'var(--fundo-color)',
        color: 'var(--clara-color)',
        minHeight: '60px',
        overflow: 'hidden'
      }}>
        {display}
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px',
        background: 'var(--escura-color)'
      }}>
        {btns.map((b, i) => (
          <button
            key={i}
            onClick={() => input(b)}
            style={{
              background: ['C', '=', '÷', '×', '-', '+'].includes(b)
               ? 'var(--clara-color)'
                : 'var(--intermediaria-color)',
              color: ['C', '=', '÷', '×', '-', '+'].includes(b)
               ? 'var(--fundo-color)'
                : 'var(--clara-color)',
              border: 'none',
              borderRadius: '8px',
              fontSize: b === '='? '1.5rem' : '1.2rem',
              fontWeight: '600',
              cursor: 'pointer',
              gridColumn: b === '0'? 'span 2' : 'span 1',
              touchAction: 'manipulation' // Melhora resposta no touch
            }}
          >
            {b}
          </button>
        ))}
      </div>

      <div
        onMouseDown={startResize}
        onTouchStart={startResize}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '30px',
          height: '30px',
          cursor: 'nwse-resize',
          background: 'linear-gradient(135deg, transparent 50%, var(--border-color) 50%)',
          borderRadius: '0 0 12px 0'
        }}
      />
    </div>
  )
}

export default Calculadora
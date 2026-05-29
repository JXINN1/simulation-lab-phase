import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught:', error, info)
  }

  handleReload = () => { window.location.reload() }

  handleReset = () => {
    try { localStorage.removeItem('code-fantasia-ip-sim-lab') } catch {}
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#050505', color: '#00ff41',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', padding: 20,
        }}>
          <div style={{ maxWidth: 500, textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
            <h1 style={{ fontSize: 18, marginBottom: 8, color: '#ff0055' }}>SYSTEM ERROR</h1>
            <p style={{ fontSize: 13, color: '#00ff4180', marginBottom: 24 }}>
              렌더링 오류가 발생했습니다. 아래 버튼으로 복구하세요.
            </p>
            {this.state.error && (
              <pre style={{
                fontSize: 10, color: '#ff005580', background: '#0a0a0a',
                padding: 12, borderRadius: 4, border: '1px solid #ff005530',
                textAlign: 'left', overflowX: 'auto', marginBottom: 24, maxHeight: 120,
              }}>
                {String(this.state.error?.message || this.state.error).slice(0, 300)}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={this.handleReload} style={{
                padding: '10px 20px', background: '#00ff4120', border: '1px solid #00ff4160',
                color: '#00ff41', fontFamily: 'monospace', fontSize: 13, borderRadius: 4, cursor: 'pointer',
              }}>
                새로고침
              </button>
              <button onClick={this.handleReset} style={{
                padding: '10px 20px', background: '#ff005520', border: '1px solid #ff005560',
                color: '#ff0055', fontFamily: 'monospace', fontSize: 13, borderRadius: 4, cursor: 'pointer',
              }}>
                데이터 초기화
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

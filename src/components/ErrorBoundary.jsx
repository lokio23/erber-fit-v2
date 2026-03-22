import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
          <AlertTriangle size={48} className="text-accent-secondary mb-6" />
          <h2 className="font-display text-2xl text-text tracking-wider mb-3">SOMETHING BROKE</h2>
          <p className="text-sm text-muted leading-relaxed max-w-xs mb-6">
            An unexpected error occurred. Your workout data is safe in local storage.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-sm font-mono text-accent hover:bg-accent/20 active:opacity-70 transition-colors"
          >
            <RotateCcw size={14} />
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

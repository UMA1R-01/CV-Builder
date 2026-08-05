import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-paper p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Something broke</h1>
          <pre className="max-w-xl overflow-auto whitespace-pre-wrap rounded-lg border border-hairline bg-white p-4 text-left text-xs text-slate">
            {this.state.error.message}
            {'\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

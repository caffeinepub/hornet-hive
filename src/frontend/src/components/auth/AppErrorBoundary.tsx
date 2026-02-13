import React, { Component, ReactNode } from 'react';
import { safeLogError } from '@/utils/safeErrorLogging';
import AppErrorFallbackScreen from './AppErrorFallbackScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * App-level error boundary that catches render-time exceptions
 * and displays a user-friendly fallback screen instead of a blank page.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error safely to the console
    // Handle null componentStack by converting to undefined
    const componentStack = errorInfo.componentStack ?? undefined;
    safeLogError(error, componentStack);
    
    // Store error info in state for display
    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <AppErrorFallbackScreen
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

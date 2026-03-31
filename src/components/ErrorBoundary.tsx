import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // Log to error reporting service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            {/* Content */}
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-serif text-gray-900 mb-2">
                                    Oops! Something went wrong
                                </h1>
                                <p className="text-gray-600">
                                    We're sorry for the inconvenience. An unexpected error occurred.
                                </p>
                            </div>

                            {/* Error Details (Development Only) */}
                            {import.meta.env.DEV && this.state.error && (
                                <details className="mb-6 bg-gray-50 rounded-lg p-4">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                        Error Details
                                    </summary>
                                    <div className="text-xs text-gray-600 font-mono overflow-auto">
                                        <div className="mb-2">
                                            <strong>Error:</strong> {this.state.error.toString()}
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <strong>Stack:</strong>
                                                <pre className="mt-1 whitespace-pre-wrap">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-[#1a2744] hover:bg-[#0f1a2e]"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </div>

                            {/* Support Info */}
                            <p className="text-center text-sm text-gray-500 mt-6">
                                If this problem persists, please{' '}
                                <a href="/contact" className="text-primary hover:underline">
                                    contact support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

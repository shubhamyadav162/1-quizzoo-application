import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

/**
 * Error boundary component to catch hook rule violations and other errors in React
 */
class HookRulesErrorHandler extends React.Component<
  { children: React.ReactNode; reset?: () => void },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode; reset?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console
    console.error("Error caught by HookRulesErrorHandler:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    if (this.props.reset) {
      this.props.reset();
    }
  };

  render() {
    if (this.state.hasError) {
      const isHookViolation = this.state.error?.message?.includes('React Hook') ||
                              this.state.error?.message?.includes('hook inside') ||
                              this.state.error?.message?.includes('rules of Hook');
      
      return (
        <View style={styles.container}>
          <Text style={styles.errorTitle}>
            {isHookViolation ? 'React Hook Rules Violation' : 'Error Encountered'}
          </Text>
          
          <Text style={styles.errorMessage}>
            {this.state.error?.message || "An unknown error occurred."}
          </Text>
          
          {isHookViolation && (
            <Text style={styles.hookExplanation}>
              This error is caused by a React Hook used incorrectly, which might be in an external package.
              Try restarting the app, or reinstalling the app if the issue persists.
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={this.handleReset}
          >
            <Text style={styles.resetButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          {__DEV__ && (
            <Text style={styles.devStackTrace}>
              {this.state.errorInfo?.componentStack}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    paddingTop: Constants.statusBarHeight + 20
  },
  errorTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#E53935'
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#333'
  },
  hookExplanation: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
    color: '#555'
  },
  resetButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  devStackTrace: {
    fontSize: 10,
    color: '#999',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F0F0F0',
    width: '100%',
    maxHeight: 300
  }
});

export default HookRulesErrorHandler; 
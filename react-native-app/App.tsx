import React from 'react';
import { StyleSheet, ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://monibox.ai';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="light" backgroundColor="#1a2e23" />
        <WebView
          source={{ uri: APP_URL }}
          style={styles.web}
          originWhitelist={['https://*']}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          mediaCapturePermissionGrantType="grant"
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          pullToRefreshEnabled={Platform.OS === 'android'}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.load}>
              <ActivityIndicator size="large" color="#7fb08f" />
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a2e23' },
  web: { flex: 1, backgroundColor: '#1a2e23' },
  load: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2e23'
  }
});

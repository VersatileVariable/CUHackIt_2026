import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const DEFAULT_URL = 'ws://172.22.53.62:8080';

const COLORS = {
  idle: '#1a1a2e',
  speaking: '#ffffff',
  leftSound: '#ff4444',
  rightSound: '#44ff88',
  environmental: '#ff8c00',
  topicChanged: '#a855f7',
};

const HAPTIC_PATTERNS = {
  speaking: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await delay(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await delay(80);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  environmental: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await delay(200);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  topicChanged: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(300);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  leftSound: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  rightSound: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [status, setStatus] = useState('Not connected');
  const [bgColor, setBgColor] = useState(COLORS.idle);
  const [lastEvent, setLastEvent] = useState('');
  const [connected, setConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_URL);
  const [editing, setEditing] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setStatus('Connecting...');

      const ws = new WebSocket(serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        setConnected(true);
        setStatus('Connected ✓');
        ws.send(JSON.stringify({ type: 'register', clientType: 'phone', clientId: `iphone-${Date.now()}` }));
      };

      ws.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'haptic') {
          const eventType = data.event;
          setLastEvent(eventType);
          setBgColor(COLORS[eventType] || COLORS.idle);
          setTimeout(() => setBgColor(COLORS.idle), 800);
          if (HAPTIC_PATTERNS[eventType]) {
            await HAPTIC_PATTERNS[eventType]();
          }
        } else if (data.type === 'registered') {
          console.log('Registered with server:', data.clientId);
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        setStatus('Reconnecting...');
        reconnectTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => { ws.close(); };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [serverUrl]);

  const applyUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setEditing(false);
    // Closing the old socket triggers reconnect via useEffect cleanup
    setServerUrl(trimmed);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.indicator}>
        <View style={[styles.dot, { backgroundColor: connected ? '#44ff88' : '#ff4444' }]} />
        <Text style={styles.status}>{status}</Text>
      </View>

      <Text style={styles.logo}>ClearPath</Text>
      <Text style={styles.subtitle}>Haptic Belt Module</Text>

      {lastEvent ? (
        <Text style={styles.event}>Last: {lastEvent}</Text>
      ) : null}

      {/* Tappable URL row — tap to edit */}
      {editing ? (
        <View style={styles.urlEditRow}>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="wss://xxx.ngrok.io or ws://IP:8080"
            placeholderTextColor="#ffffff40"
            onSubmitEditing={applyUrl}
            returnKeyType="connect"
          />
          <TouchableOpacity style={styles.connectBtn} onPress={applyUrl}>
            <Text style={styles.connectBtnText}>Connect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => { setInputUrl(serverUrl); setEditing(true); }}>
          <Text style={styles.ip}>{serverUrl} (tap to change)</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  status: {
    color: '#ffffff80',
    fontSize: 14,
    fontFamily: 'System',
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff60',
    marginTop: 8,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  event: {
    position: 'absolute',
    bottom: 130,
    fontSize: 13,
    color: '#ffffff40',
    letterSpacing: 1,
  },
  ip: {
    position: 'absolute',
    bottom: 60,
    fontSize: 11,
    color: '#ffffff50',
    fontFamily: 'Courier',
    textDecorationLine: 'underline',
  },
  urlEditRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    width: '100%',
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#ffffff15',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'Courier',
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  connectBtn: {
    backgroundColor: '#a855f7',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

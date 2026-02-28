import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const LAPTOP_IP = '172.22.53.62'; // replace with your laptop's local IP
const PORT = 8080;

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
  const [status, setStatus] = useState('Connecting...');
  const [bgColor, setBgColor] = useState(COLORS.idle);
  const [lastEvent, setLastEvent] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(`ws://${LAPTOP_IP}:${PORT}`);

      ws.onopen = () => {
        setConnected(true);
        setStatus('Connected ✓');
        ws.send(JSON.stringify({ type: 'register', clientType: 'phone', clientId: `iphone-${Date.now()}` }));
      };

      ws.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        
        // Handle different message types
        if (data.type === 'haptic') {
          const eventType = data.event;
          setLastEvent(eventType);

          // trigger color flash
          setBgColor(COLORS[eventType] || COLORS.idle);
          setTimeout(() => setBgColor(COLORS.idle), 800);

          // trigger haptic
          if (HAPTIC_PATTERNS[eventType]) {
            await HAPTIC_PATTERNS[eventType]();
          }
        } else if (data.type === 'registered') {
          console.log('Registered with server:', data.clientId);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setStatus('Reconnecting...');
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.indicator}>
        <View style={[styles.dot, { backgroundColor: connected ? '#44ff88' : '#ff4444' }]} />
        <Text style={styles.status}>{status}</Text>
      </View>
      <Text style={styles.logo}>ClearPath</Text>
      <Text style={styles.subtitle}>Haptic Belt Module</Text>
      {lastEvent ? (
        <Text style={styles.event}>Last: {lastEvent}</Text>
      ) : null}
      <Text style={styles.ip}>Bridge: {LAPTOP_IP}:{PORT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s',
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
    bottom: 100,
    fontSize: 13,
    color: '#ffffff40',
    letterSpacing: 1,
  },
  ip: {
    position: 'absolute',
    bottom: 60,
    fontSize: 11,
    color: '#ffffff30',
    fontFamily: 'Courier',
  },
});

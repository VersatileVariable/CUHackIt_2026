# ClearPath System Testing Guide

Quick testing guide to verify the iPhone haptic system is working correctly.

## Pre-Test Checklist

- [ ] Laptop bridge server running (`npm start`)
- [ ] iPhone Expo app loaded and connected
- [ ] Quest 3 browser app loaded
- [ ] All devices on same Wi-Fi network
- [ ] Laptop IP address configured in both apps

## Test Cases

### Test 1: Bridge Connection

**Objective:** Verify WebSocket bridge is functioning

**Steps:**
1. Start bridge server: `npm start`
2. Check server shows: `Ready for connections...`
3. Open health check: `http://YOUR_LAPTOP_IP:8080/health`
4. Verify response shows `"status": "ok"`

**Expected Result:** Server running with no errors

---

### Test 2: iPhone App Connection

**Objective:** Verify iPhone app connects to bridge

**Steps:**
1. Bridge server running from Test 1
2. Launch Expo app on iPhone by scanning QR code
3. Watch bridge server terminal
4. Look for: `Registered phone client: iphone-XXXXX`

**Expected Result:** 
- Server logs show phone client registered
- iPhone app shows "Connected" status
- Health check shows `"phones": 1`

---

### Test 3: Quest 3 App Connection

**Objective:** Verify Quest browser connects to bridge

**Steps:**
1. Open Quest 3 browser
2. Navigate to your ClearPath app URL
3. Open browser console (F12 or Quest developer tools)
4. Check for: `WebSocket connected to bridge server`
5. Watch bridge terminal for: `Registered headset client: quest3-XXXXX`

**Expected Result:**
- Server logs show headset client registered  
- Quest console shows connection success
- Health check shows `"headsets": 1, "phones": 1`

---

### Test 4: Speaking Event → iPhone Haptic

**Objective:** Verify speech recognition triggers iPhone haptic

**Steps:**
1. All clients connected from previous tests
2. In Quest 3, click "Start Speech Recognition"
3. Speak clearly: "Hello, this is a test"
4. Watch bridge server logs
5. Feel iPhone for haptic feedback

**Expected Result:**
- Bridge logs: `[headset] speaking`
- Bridge logs: `→ Phone haptic: speaking (triple medium, white)`
- iPhone displays: **White screen flash**
- iPhone vibrates: **Triple medium impact** pattern
- Quest shows live captions of your speech

---

### Test 5: Directional Sound → iPhone Haptic

**Objective:** Verify audio direction triggers correct haptic

**Steps:**
1. Enable audio direction monitoring in Quest app
2. Play sound from left side of Quest headset
3. Watch bridge server logs
4. Check iPhone haptic feedback

**Expected Result (Left Sound):**
- Bridge logs: `[headset] leftSound`
- Bridge logs: `→ Phone haptic: leftSound (triple light, red)`
- iPhone displays: **Red screen flash**
- iPhone vibrates: **Triple light impact** pattern

**Expected Result (Right Sound):**
- Bridge logs: `[headset] rightSound`
- Bridge logs: `→ Phone haptic: rightSound (single heavy, green)`
- iPhone displays: **Green screen flash**
- iPhone vibrates: **Single heavy impact** pattern

---

### Test 6: Environmental Sound → iPhone Haptic

**Objective:** Verify sudden loud sounds trigger environmental haptic

**Steps:**
1. Audio monitoring active
2. Make sudden loud noise (clap hands near Quest)
3. Watch bridge server logs
4. Check iPhone haptic

**Expected Result:**
- Bridge logs: `[headset] environmental`
- Bridge logs: `→ Phone haptic: environmental (double warning, orange)`
- iPhone displays: **Orange screen flash**
- iPhone vibrates: **Double warning notification** pattern

---

### Test 7: Topic Change → iPhone Haptic

**Objective:** Verify AI topic detection triggers haptic

**Steps:**
1. Enable AI summarization in Quest app
2. Have conversation that clearly changes topic
3. Wait for AI to process (30 second buffer)
4. Watch bridge server logs
5. Check iPhone haptic

**Expected Result:**
- Bridge logs: `[headset] topicChanged`
- Bridge logs: `→ Phone haptic: topicChanged (heavy+light, purple)`
- iPhone displays: **Purple screen flash**
- iPhone vibrates: **Heavy then light impact** sequence
- Quest shows updated topic summary

---

### Test 8: Multiple Rapid Events

**Objective:** Verify bridge handles event bursts without lag

**Steps:**
1. Speak continuously (triggers multiple `speaking` events)
2. Move sound source left and right rapidly
3. Watch bridge logs
4. Check iPhone responds to each event

**Expected Result:**
- All events logged in bridge terminal
- iPhone responds to each haptic in sequence
- No events dropped or delayed
- Bridge shows smooth event routing

---

### Test 9: Network Interruption Recovery

**Objective:** Verify auto-reconnect on network issues

**Steps:**
1. All clients connected
2. **On iPhone:** Turn Wi-Fi off for 5 seconds, then back on
3. Watch Expo app reconnect automatically
4. Send test event from Quest
5. Verify iPhone receives haptic

**Expected Result:**
- iPhone app shows "Reconnecting..."
- Bridge logs show disconnection
- iPhone auto-reconnects within 3 seconds
- Bridge shows: `Registered phone client` again
- Haptics resume working immediately

---

### Test 10: Multi-Client Support

**Objective:** Verify multiple phones can receive haptics

**Steps:**
1. Connect second iPhone with Expo app
2. Both iPhones should show "Connected"
3. Trigger event from Quest
4. Check both iPhones receive haptic

**Expected Result:**
- Health check shows `"phones": 2`
- Bridge logs: `→ Phone haptic: speaking (...)` (sent to both)
- Both iPhones vibrate simultaneously
- Both show same color flash

---

## Troubleshooting

### Issue: Bridge server won't start

```bash
Error: Cannot find module 'ws'
```

**Fix:** Install dependencies
```bash
npm install
```

---

### Issue: iPhone app can't connect

**Check:**
1. Laptop IP address correct in Expo app config?
2. Bridge server actually running?
3. Both on same Wi-Fi network?
4. Firewall blocking port 8080?

**Debug:**
```bash
# Check server is listening
curl http://localhost:8080/health

# Check from iPhone's perspective
# (in iPhone Safari): http://YOUR_LAPTOP_IP:8080/health
```

---

### Issue: Quest app can't connect

**Check:**
1. WebSocket URL correct? (should be `ws://` not `wss://`)
2. Bridge server running?
3. Quest browser console shows errors?

**Debug in Quest browser console:**
```javascript
// Check bridge module loaded
console.log(window.bridgeModule);

// Try manual connection
bridgeModule.setServerAddress('ws://192.168.1.XXX:8080');
bridgeModule.connect();

// Check connection status
bridgeModule.getStatus();
```

---

### Issue: No haptics on iPhone

**Check:**
1. iPhone not on silent mode?
2. Haptics enabled in iPhone Settings > Sounds & Haptics?
3. Expo app has permission to access haptics?
4. Check Expo app logs for errors

**Debug:**
```javascript
// In Expo app, add debug logging
console.log('Received haptic event:', event);
console.log('Triggering haptic:', pattern);
```

---

### Issue: Delayed haptics (high latency)

**Possible causes:**
1. Weak Wi-Fi signal
2. Too many devices on network
3. Laptop resource constraints

**Fixes:**
1. Move closer to Wi-Fi router
2. Use 5GHz Wi-Fi instead of 2.4GHz
3. Close unnecessary laptop applications

---

## Performance Benchmarks

**Typical latency (Quest event → iPhone haptic):**
- Local network: 20-50ms
- Good Wi-Fi: 50-100ms
- Acceptable: <150ms
- Poor: >200ms (investigate network)

**How to measure:**
1. Add timestamps in Quest app when sending event
2. Add timestamps in iPhone app when receiving
3. Log difference in bridge server
4. Should see <100ms in most cases

---

## Success Criteria

Your system is working correctly if:

- [x] Bridge server starts without errors
- [x] iPhone app connects and shows "Connected"
- [x] Quest app connects to bridge
- [x] Speaking triggers white flash + triple medium haptic
- [x] Left sound triggers red flash + triple light haptic
- [x] Right sound triggers green flash + single heavy haptic
- [x] Environmental sound triggers orange flash + double warning
- [x] Topic change triggers purple flash + heavy-light sequence
- [x] All events appear in bridge server logs
- [x] Latency is <100ms on good network
- [x] Auto-reconnect works after brief disconnection

---

## Demo Script for Judges

**Duration:** 2-3 minutes

1. **Show bridge server** terminal with live logging (10 sec)
2. **Show iPhone app** connected status (5 sec)
3. **Put on Quest 3** and show AR passthrough (10 sec)
4. **Speak sentence** → Show live captions + iPhone white flash + haptic (20 sec)
5. **Make sound left side** → Show red glow + iPhone red flash + haptic (15 sec)
6. **Make sound right side** → Show green glow + iPhone green flash + haptic (15 sec)
7. **Clap loudly** → Show orange flash + environmental haptic (10 sec)
8. **Change conversation topic** → Show purple flash + topic change haptic (20 sec)
9. **Point to bridge logs** showing all events routed (10 sec)

**Total:** ~2 minutes of active demo + buffer for questions

---

**Built for CUHackIt 2026**

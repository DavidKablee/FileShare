import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import WifiManager from "react-native-wifi-reborn";

export default function SendFormatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = route.params as { mode: 'wifi' | 'qr' };

  const [wifiNetworks, setWifiNetworks] = useState<{ SSID: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendData = {
    device: 'Android',
    ip: '192.168.43.1',
    port: 8080,
  };

  // Only load Wi-Fi networks when in "wifi" mode
  useEffect(() => {
    if (mode === 'wifi') {
      scanWifiNetworks();
    }
  }, [mode]);

  const scanWifiNetworks = async () => {
    try {
      setLoading(true);
      const results = await WifiManager.loadWifiList();
      setWifiNetworks(results);
    } catch (error) {
      console.error('Error scanning Wi-Fi networks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Entypo name={'chevron-thin-left'} size={20} color="white" />
      </TouchableOpacity>

      {mode === 'qr' ? (
        <>
          <Text style={styles.title}>Scan to Send</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify(sendData)}
              size={200}
              color="white"
              backgroundColor="#0b0b12"
            />
            <Text style={styles.qrText}>Scan this QR code to connect</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Available Wi-Fi Networks</Text>
          {loading ? (
            <Text style={{ color: 'white' }}>Scanning...</Text>
          ) : (
            <FlatList
              data={wifiNetworks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.networkItem}>
                  <Entypo name="signal" size={18} color="white" />
                  <Text style={styles.networkText}>{item.SSID}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: '#bbb', marginTop: 20 }}>
                  No Wi-Fi networks found
                </Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b12',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 100, 202, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(125, 100, 202, 0.15)',
    padding: 20,
    borderRadius: 20,
  },
  qrText: {
    color: 'white',
    marginTop: 12,
    fontSize: 14,
    opacity: 0.8,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(125, 100, 202, 0.2)',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    width: '100%',
  },
  networkText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});

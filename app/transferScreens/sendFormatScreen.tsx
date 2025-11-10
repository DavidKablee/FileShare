import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function SendFormatScreen() {
  const navigation = useNavigation();

  // Example data you want to encode in the QR
  const sendData = {
    device: 'Android',
    ip: '192.168.43.1',
    port: 8080,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b12',
    justifyContent: 'center',
    alignItems: 'center',
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
});

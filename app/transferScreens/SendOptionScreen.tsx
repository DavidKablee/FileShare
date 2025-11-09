import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';

export default function SendOptionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { images } = route.params as { images: { path: string; name: string }[] };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Entypo name="chevron-thin-left" size={20} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Choose Sending Method</Text>
      <Text style={styles.subtitle}>{images.length} file(s) ready to send</Text>

      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: '#7d64ca' }]}
        onPress={() => navigation.navigate('WifiSendScreen' as never)}
      >
        <Entypo name="signal" size={24} color="white" />
        <Text style={styles.optionText}>Send via Wi-Fi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, { backgroundColor: '#00b894' }]}
        onPress={() => navigation.navigate('QrSendScreen' as never)}
      >
        <AntDesign name="qrcode" color="#ffffffff" size={24} />
        <Text style={styles.optionText}>Send via QR Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b12', justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 100, 202, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  subtitle: { color: '#bbb', fontSize: 14, marginBottom: 40 },
  optionButton: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  optionText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },
});

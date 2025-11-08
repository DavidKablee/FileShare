import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const ReceiveScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          navigation.goBack();
        }}
        activeOpacity={0.7}
      >
        <Entypo name={"chevron-thin-left"} size={20} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>Receive Files</Text>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Receive via Wi-Fi Direct')}>
        <Text style={styles.buttonText}>Receive via Wi-Fi Direct</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Receive via QR Code')}>
        <Text style={styles.buttonText}>Receive via QR Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 0, 24, 1)',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    bottom: 300,
    // marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  button: {
    backgroundColor: 'rgba(125, 100, 202, 0.85)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    // marginTop: 30,
    bottom: 300,
    marginLeft: 16,
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 100, 202, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(125, 100, 202, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7d64ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default ReceiveScreen;
import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';

export default function SendScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { images } = route.params as { images: { path: string; name: string }[] };

  const renderItem = ({ item }: any) => (
    <Image source={{ uri: 'file://' + item.path }} style={styles.image} resizeMode="cover" />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Entypo name="chevron-thin-left" size={20} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Ready to Send</Text>
      <Text style={styles.subtitle}>{images.length} image(s) selected</Text>

      <FlatList
        data={images}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => (navigation as any).navigate('SendOptionScreen', { images })}
        activeOpacity={0.9}
      >
        <Text style={styles.sendText}>Send Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b12', paddingTop: 60 },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 100, 202, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  subtitle: { color: '#bbb', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  grid: { paddingHorizontal: 6 },
  image: {
    width: (width - 36) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    margin: 4,
  },
  sendButton: {
    marginTop: 'auto',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#7d64ca',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

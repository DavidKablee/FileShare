/**
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import React, { useEffect } from 'react';
import { requestStoragePermissions, openManageAllFilesSettings } from './utils/permissions';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/index';
import CategoriesScreen from './app/categories/index';
import CategoryDetailScreen from './app/categories/[category]';
import AudioGallery from './app/categoryScreens/audioGallery';
import DocumentsGallery from './app/categoryScreens/documentsGallery';
import ImageGallery from './app/categoryScreens/imageGallery';
import VideoGallery from './app/categoryScreens/videogallery';
import FileGallery from './app/categoryScreens/FileGallery';
import ReceiveScreen from './app/transferScreens/recieveScreen';
import SendScreen from './app/transferScreens/sendScreen';
import SendOptionScreen from './app/transferScreens/SendOptionScreen';
import sendFormatScreen from './app/transferScreens/sendFormatScreen';




const Stack = createStackNavigator();


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let AsyncStorage: any;
        try {
          AsyncStorage = require('@react-native-async-storage/async-storage');
          if (AsyncStorage && AsyncStorage.default) AsyncStorage = AsyncStorage.default;
        } catch (_err) {
          AsyncStorage = null;
        }
        const canUseAsync = AsyncStorage && typeof AsyncStorage.getItem === 'function';
        if (canUseAsync) {
          const asked = await AsyncStorage.getItem('askedAllFilesV1');
          if (asked) return;
        }
        const { Platform } = require('react-native');
        const ver = Number(Platform.Version) || 0;
        if (Platform.OS === 'android' && ver >= 30) {
          try { await openManageAllFilesSettings(); } catch (e) { }
        } else {
          const granted = await requestStoragePermissions();
          if (!granted) {
            try { await openManageAllFilesSettings(); } catch (e) { }
          }
        }

        if (canUseAsync) {
          try { await AsyncStorage.setItem('askedAllFilesV1', '1'); } catch (e) { }
        }
      } catch (e) {
        console.warn('First-launch storage prompt failed', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
        <Stack.Screen name="ImageGallery" component={ImageGallery} />
        <Stack.Screen name="VideoGallery" component={VideoGallery} />
        <Stack.Screen name="AudioGallery" component={AudioGallery} />
        <Stack.Screen name="DocumentsGallery" component={DocumentsGallery} />
        <Stack.Screen name='FileGallery' component={FileGallery} />
        <Stack.Screen name="ReceiveScreen" component={ReceiveScreen} />
        <Stack.Screen name="SendScreen" component={SendScreen} />
        <Stack.Screen name="SendOptionScreen" component={SendOptionScreen} />
        <Stack.Screen name='SendFormatScreen' component={sendFormatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: 'red'
  },
});

export default App;

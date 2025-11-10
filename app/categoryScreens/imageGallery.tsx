import { openDeviceSettings, requestStoragePermissions } from '../../utils/permissions';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import * as safeRfs from '../utils/safeRfs';
import Entypo from 'react-native-vector-icons/Entypo';

type GalleryItem = { path: string; name: string };

let imagesCache: GalleryItem[] = [];

const ANDROID_IMAGE_DIRS = [
  '/storage/emulated/0/DCIM',
  '/storage/emulated/0/Pictures',
  '/storage/emulated/0/Download',
  '/storage/emulated/0/WhatsApp/Media/WhatsApp Images',
  '/storage/emulated/0/Telegram/Telegram Images',
];

const IOS_IMAGE_DIRS_PLACEHOLDER: string[] = [];
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];

export default function ImageGallery() {
  const [images, setImages] = useState<GalleryItem[]>(() => imagesCache);
  const [loading, setLoading] = useState(() => imagesCache.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<{ [path: string]: boolean }>({});
  const [fullScreenImageUri, setFullScreenImageUri] = useState<string | null>(null);

  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList<GalleryItem>>(null);

  const roots = useMemo(
    () => (Platform.OS === 'android' ? ANDROID_IMAGE_DIRS : IOS_IMAGE_DIRS_PLACEHOLDER),
    []
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (imagesCache.length === 0) setLoading(true);
        setError(null);
        const hasPermission = await requestStoragePermissions();
        if (!hasPermission) {
          if (isMounted) setError('Storage permission denied. Please grant access to view images.');
          openDeviceSettings();
          return;
        }
        const platformPaths = safeRfs.getPlatformPaths();
        const platformRoots =
          Platform.OS === 'android'
            ? ANDROID_IMAGE_DIRS
            : [platformPaths.pictures || platformPaths.docs].filter(Boolean) as string[];

        const collected: GalleryItem[] = [];
        for (const root of platformRoots) {
          try {
            const exists = await safeRfs.exists(root);
            if (!exists) continue;
          } catch {
            continue;
          }
          await collectImagesRecursively(root, collected, 3, 800);
          if (collected.length >= 800) break;
        }
        if (!isMounted) return;
        imagesCache = collected;
        setImages(collected);
      } catch {
        if (isMounted) setError('Failed to load images');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [roots]);

  const renderItem = ({ item }: { item: GalleryItem }) => {
    const isSelected = !!selected[item.path];
    return (
      <TouchableOpacity
        style={styles.thumbWrap}
        activeOpacity={0.8}
        onLongPress={() => {
          setSelectionMode(true);
          setSelected((prev) => ({ ...prev, [item.path]: true }));
        }}
        onPress={() => {
          if (selectionMode) {
            setSelected((prev) => ({ ...prev, [item.path]: !prev[item.path] }));
          } else {
            setFullScreenImageUri('file://' + item.path);
          }
        }}
      >
        <Image
          source={{ uri: 'file://' + item.path }}
          style={[styles.thumb, isSelected && { borderWidth: 3, borderColor: '#7d64ca' }]}
          resizeMode="cover"
        />
        {selectionMode && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 2,
            }}
          >
            <Entypo name={isSelected ? 'check' : 'circle'} size={18} color={isSelected ? '#7d64ca' : '#bbb'} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7d64ca" />
        <Text style={styles.loadingText}>Loading images…</Text>
      </View>
    );
  }

  if (fullScreenImageUri) {
    return (
      <View style={styles.fullScreenContainer}>
        <Image source={{ uri: fullScreenImageUri }} style={styles.fullScreenImage} resizeMode="contain" />
        <TouchableOpacity style={styles.closeButton} onPress={() => setFullScreenImageUri(null)}>
          <Entypo name="cross" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (selectionMode) {
            setSelectionMode(false);
            setSelected({});
          } else {
            navigation.goBack();
          }
        }}
        activeOpacity={0.7}
      >
        <Entypo name={selectionMode ? 'cross' : 'chevron-thin-left'} size={20} color="white" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Select Photos</Text>
        <Text style={styles.subtitle}>Tap to preview • Long-press to select multiple</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const selectedCount = Object.values(selected).filter(Boolean).length;
              if (selectedCount === images.length && images.length > 0) {
                setSelected({});
              } else {
                const all: { [path: string]: boolean } = {};
                images.forEach((i) => {
                  all[i.path] = true;
                });
                setSelected(all);
                setSelectionMode(true);
              }
            }}
            style={styles.selectAllButton}
          >
            <Text style={styles.buttonText}>
              {Object.values(selected).filter(Boolean).length === images.length && images.length > 0
                ? 'Deselect all'
                : 'Select all'}
            </Text>
          </TouchableOpacity>

          {/* 🚀 Updated SHARE button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const selectedImages = images.filter((img) => selected[img.path]);
              if (selectedImages.length === 0) return;
              (navigation as any).navigate('SendScreen', { images: selectedImages });
            }}
            disabled={Object.values(selected).filter(Boolean).length === 0}
            style={[
              styles.shareButton,
              {
                backgroundColor:
                  Object.values(selected).filter(Boolean).length > 0
                    ? '#7d64ca'
                    : 'rgba(125,100,202,0.25)',
              },
            ]}
          >
            <Text style={styles.shareText}>
              Share ({Object.values(selected).filter(Boolean).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(it) => it.path}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          initialNumToRender={24}
          windowSize={10}
          removeClippedSubviews
        />
      )}
    </View>
  );

  async function collectImagesRecursively(dir: string, out: GalleryItem[], depth: number, cap: number) {
    if (depth < 0 || out.length >= cap) return;
    try {
      const entries = await safeRfs.readDir(dir);
      for (const entry of entries) {
        if (out.length >= cap) break;
        if (entry.isDirectory()) {
          const name = entry.name || '';
          if (name.startsWith('.')) continue;
          await collectImagesRecursively(entry.path, out, depth - 1, cap);
        } else {
          const lower = (entry.name || '').toLowerCase();
          const ext = lower.split('.').pop();
          if (ext && IMAGE_EXTS.includes(ext)) {
            out.push({ path: entry.path, name: entry.name || entry.path });
          }
        }
      }
    } catch { }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b12', 
    paddingTop: 60,
   },
  header: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    backgroundColor: '#0b0b12',
  },
  title: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: '#bbb', fontSize: 12, textAlign: 'center', marginTop: 6 },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'rgba(125,100,202,0.15)',
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  shareText: { color: 'white', fontWeight: '700' },
  buttonText: { color: '#fff', fontWeight: '600' },
  grid: { paddingTop: 80, paddingHorizontal: 6 },
  thumbWrap: { width: '33.3333%', aspectRatio: 1, padding: 6 },
  thumb: { flex: 1, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  backButton: {
    position: 'absolute',
    marginTop: 30,
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
  loadingText: { color: 'white', marginTop: '90%', marginLeft: "40%", alignItems: 'center' },
  errorText: { color: '#ff6b6b' },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

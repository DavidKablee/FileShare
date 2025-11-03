import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image, // Import Image component
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as RNFS from 'react-native-fs';
import { format } from 'date-fns';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  mtime: Date;
  size?: number;
  itemCount?: number;
}

const FileGallery = () => {
  const navigation = useNavigation();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(RNFS.ExternalStorageDirectoryPath);
  const [parentPath, setParentPath] = useState<string | null>(null);

  // Load files from the current directory
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get files from the current directory
        const items = await RNFS.readDir(currentPath);
        
        // Process files and folders
        const processedItems = await Promise.all(
          items.map(async (item) => {
            const fileItem: FileItem = {
              name: item.name,
              path: item.path,
              isDirectory: item.isDirectory(),
              mtime: item.mtime ? new Date(item.mtime) : new Date(),
              size: item.size,
              itemCount: 0,
            };
            
            // Count items in directories
            if (fileItem.isDirectory) {
              try {
                const dirItems = await RNFS.readDir(item.path);
                fileItem.itemCount = dirItems.length;
              } catch (e) {
                fileItem.itemCount = 0;
              }
            }
            
            return fileItem;
          })
        );
        
        // Sort: directories first, then files, both alphabetically
        const sortedItems = processedItems.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setFiles(sortedItems);
        
        // Set parent path for back navigation
        const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setParentPath(parent !== currentPath ? parent : null);
      } catch (err) {
        console.error('Error loading files:', err);
        setError('Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [currentPath]);
  
  // Navigate to a directory or open a file
  const handleItemPress = (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      // Detect file type by extension
      const ext = item.name.split('.').pop()?.toLowerCase();
      if (!ext) return;
      // Image types
      const imageExts = ['jpg','jpeg','png','gif','webp','heic','heif'];
      // Video types
      const videoExts = ['mp4','mkv','mov','avi','webm','3gp','flv','wmv'];
      // Audio types
      const audioExts = ['mp3','wav','aac','flac','ogg','m4a','amr'];
      // Document types
      const docExts = ['pdf','doc','docx','txt','ppt','pptx','xls','xlsx'];

      const uri = item.path.startsWith('file://') ? item.path : 'file://' + item.path;

      if (imageExts.includes(ext)) {
        (navigation as any).navigate('ImageGallery', { startAt: uri });
      } else if (videoExts.includes(ext)) {
        (navigation as any).navigate('VideoGallery', { startAt: uri });
      } else if (audioExts.includes(ext)) {
        (navigation as any).navigate('AudioGallery', { startAt: uri });
      } else if (docExts.includes(ext)) {
        (navigation as any).navigate('DocumentsGallery', { startAt: uri });
      } else {
        // silently skip unsupported file types
      }
    }
  };
  
  // Navigate back to parent directory
  const handleBackPress = () => {
    if (parentPath) {
      setCurrentPath(parentPath);
    } else {
      navigation.goBack();
    }
  };
  
  // Format date to display
  const formatDate = (date: Date) => {
    const now = new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
    
    if (isThisYear) {
      return format(date, 'd MMM HH:mm');
    }
    return format(date, 'd MMM yyyy HH:mm');
  };
  
  // Render each file/folder item
  const renderItem = ({ item }: { item: FileItem }) => {
    const ext = item.name.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg','jpeg','png','gif','webp','heic','heif'];
    const isImage = !item.isDirectory && ext && imageExts.includes(ext);

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.iconContainer}>
          {item.isDirectory ? (
            <Icon name="folder" size={24} color="#FFC107" />
          ) : isImage ? (
            <Image source={{ uri: 'file://' + item.path }} style={styles.thumbnail} />
          ) : (
            <Icon name="insert-drive-file" size={24} color="#2196F3" />
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemInfo}>
            {formatDate(item.mtime)}
            {item.isDirectory 
              ? ` • ${item.itemCount} ${item.itemCount === 1 ? 'item' : 'items'}`
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render separator between items
  const renderSeparator = () => <View style={styles.separator} />;
  
  // Get current directory name from path
  const getCurrentDirectoryName = () => {
    const parts = currentPath.split('/');
    return parts[parts.length - 1] || 'Internal storage';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Path indicator */}
      <View style={styles.pathContainer}>
        <Icon name="folder" size={20} color="#FFFFFF" />
        <Text style={styles.pathText}>
          {getCurrentDirectoryName()}
        </Text>
      </View>
      
      {/* Sort header */}
      <View style={styles.sortHeader}>
        <View style={styles.sortLeft}>
          <Text style={styles.allText}>All</Text>
          <Icon name="arrow-drop-down" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.sortRight}>
          <Text style={styles.sortText}>Name</Text>
          <Icon name="arrow-upward" size={16} color="#FFFFFF" />
        </View>
      </View>
      
      {/* File list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : files.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No files found</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => item.path}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pathText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sortRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  itemInfo: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#333333',
    marginLeft: 72,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
});

export default FileGallery;
import React, { useState } from 'react';
import { Pressable, Image, StyleSheet, View, Modal } from 'react-native';
import ImageViewer from 'react-native-reanimated-image-viewer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import useImageDimensions from '../hooks/useImageDimensions';

export default function FullScreenImageViewer({
  uri,
  variant = 'image', // 'image' или 'icon'
  thumbnailStyle,
  iconSize = 40,
  iconColor = '#555',
}) {
  const [visible, setVisible] = useState(false);
  const { width, height } = useImageDimensions(uri);

  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => setVisible(true)}>
        {variant === 'image' ? (
          <Image source={{ uri }} style={[styles.thumbnail, thumbnailStyle]} />
        ) : (
          <Ionicons name="image-outline" size={iconSize} color={iconColor} />
        )}
      </Pressable>

      <Modal visible={visible} onRequestClose={() => setVisible(false)} transparent={false}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ImageViewer
            imageUrl={uri}
            width={width}
            height={height}
            onRequestClose={() => setVisible(false)}
          />
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});

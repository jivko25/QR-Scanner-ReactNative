import React, { useState } from 'react';
import { Pressable, Image, StyleSheet, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { Ionicons } from '@expo/vector-icons'; // използваме икона от Expo

export default function FullScreenImageViewer({
  uri,
  variant = 'image', // 'image' или 'icon'
  thumbnailStyle,
  iconSize = 40,
  iconColor = '#555',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setVisible(true)}>
        {variant === 'image' ? (
          <Image source={{ uri }} style={[styles.thumbnail, thumbnailStyle]} />
        ) : (
          <Ionicons name="image-outline" size={iconSize} color={iconColor} />
        )}
      </Pressable>

      <ImageViewing
        images={[{ uri }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
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

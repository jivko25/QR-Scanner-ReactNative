import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';

export default function useImageDimensions(uri) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!uri) return;

    Image.getSize(
      uri,
      (width, height) => {
        setDimensions({ width, height });
      },
      (error) => {
        console.error('Грешка при получаване на размерите на снимката', error);
      }
    );
  }, [uri]);

  return dimensions;
}

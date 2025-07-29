import React, { useState } from 'react';
import { View, Text, Button, Image, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import Toast from 'react-native-toast-message';

export default function AddItemsFromImagesScreen({ route, navigation }) {
    const { shoppingListId } = route.params;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const pickImages = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selected = result.assets.map(asset => ({
                uri: asset.uri,
                name: asset.fileName || 'image.jpg',
                type: asset.type || 'image/jpeg',
            }));
            setImages(selected);
        }
    };

    const uploadImages = async () => {
        if (images.length === 0) {
            Alert.alert('Избери поне една снимка');
            return;
        }

        // const formData = new FormData();
        // images.forEach((img, index) => {
        //     formData.append('images', {
        //       uri: img.uri,
        //       name: img.name || `image${index}.jpg`,
        //       type: 'image/jpeg',
        //     });
        //   });

        const formData = new FormData();

        images.forEach((img, index) => {
            formData.append('images', {
                uri: img.uri.startsWith('file://') ? img.uri : 'file://' + img.uri,
                name: img.name || `image${index}.jpg`,
                type: 'image/jpeg',
            });
        });

        setLoading(true);
        try {
            console.log(formData.get('images'));

            const response = await api.post(
                `/shopping-list/${shoppingListId}/items/from-images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            Toast.show({
                text1: 'Успешно добавени артикули!',
                type: 'success',
            });
            navigation.goBack();
            console.log('Резултат:', response.data);
        } catch (error) {
            console.log(error.message);

            console.error('Грешка при качване:', error);
            Alert.alert('Грешка при качване');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <Text style={styles.title}>Добави продукти от снимки</Text>
    
                <TouchableOpacity style={styles.pickButton} onPress={pickImages}>
                    <Text style={styles.pickButtonText}>📷 Избери снимки</Text>
                </TouchableOpacity>
    
                {images.length > 0 && (
                    <FlatList
                        data={images}
                        keyExtractor={(item, index) => item.uri + index}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageList}
                        renderItem={({ item }) => (
                            <View style={styles.imageCard}>
                                <Image source={{ uri: item.uri }} style={styles.image} />
                            </View>
                        )}
                    />
                )}
    
                <TouchableOpacity
                    style={[styles.uploadButton, loading && { opacity: 0.7 }]}
                    onPress={uploadImages}
                    disabled={loading}
                >
                    <Text style={styles.uploadButtonText}>
                        {loading ? '⏳ Качване...' : '⬆️ Качи и добави продукти'}
                    </Text>
                </TouchableOpacity>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    pickButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    pickButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    imageList: {
        paddingVertical: 10,
    },
    imageCard: {
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        width: 120,
        height: 120,
    },
    image: {
        width: 120,
        height: 120,
        aspectRatio: 1,
    },
    uploadButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

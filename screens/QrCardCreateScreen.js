import React, { useState } from 'react';
import {
    View,
    TextInput,
    Image,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { Ionicons } from '@expo/vector-icons';

export default function QrCardCreateScreen({ navigation }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!name || !image)
            return Alert.alert('Моля въведи име и избери снимка');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', {
            uri: image.uri.startsWith('file://') ? image.uri : 'file://' + image.uri,
            name: 'qr.jpg',
            type: 'image/jpeg',
        });

        try {
            await api.post('/qr-card', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigation.goBack();
        } catch (err) {
            Alert.alert('Грешка', err.response?.data?.error || 'Грешка при създаване');
        }
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <TextInput
                    placeholder="Име на карта"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholderTextColor="#888"
                />

                <TouchableOpacity onPress={pickImage} style={styles.button}>
                    <View style={styles.iconTextContainer}>
                        <Ionicons name="image-outline" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>
                        Избери снимка</Text>
                    </View>
                </TouchableOpacity>

                {image && (
                    <Image
                        source={{ uri: image.uri }}
                        style={styles.preview}
                        resizeMode="contain"
                    />
                )}

                <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.submitButton]}>
                    <View style={styles.iconTextContainer}>
                        <Ionicons name="save-outline" size={24} color="#fff" style={styles.icon} />
                        <Text style={styles.buttonText}>Създай карта</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#2e86de',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#27ae60',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    preview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
});

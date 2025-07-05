import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../storage/authContext';
import { useBudgets } from '../storage/budgetsContext';
import LottieView from 'lottie-react-native';
import loadingAnimation from '../assets/loading-animation.json';
import AuthorizedUserHome from './AuthorizedUserHome';
import GuestView from './GuestView';

export default function HomeScreen({ navigation }) {
    const { session, loadSessionFromStorage, loading } = useAuth();
    const { loading: loadingBudgets } = useBudgets();

    useEffect(() => {
        const initialize = async () => {
            await loadSessionFromStorage();
            setCheckedSession(true);
        };
        initialize();
    }, []);

    if (loadingBudgets || loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                <LottieView source={loadingAnimation} autoPlay loop style={{ width: 200, height: 200 }} />
                <Text style={{ marginTop: 20, fontSize: 16, color: '#333' }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            {session?.user ? (
                <AuthorizedUserHome
                    navigation={navigation}
                />
            ) :
                (<GuestView navigation={navigation} />)
            }
        </View>
    );
}

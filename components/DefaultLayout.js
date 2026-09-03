import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import BottomNav from './BottomNavigation';
import OfflineBanner from './OfflineBanner';

export default function DefaultLayout({ children, showNavigation = true }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <OfflineBanner />
                {children}
                {showNavigation && <BottomNav />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingTop: 35,
        paddingBottom: 50,
    },
});

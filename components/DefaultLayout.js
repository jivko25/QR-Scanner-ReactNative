import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import BottomNav from './BottomNavigation';

export default function DefaultLayout({ children, showNavigation = true }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {children}
                {
                    showNavigation &&
                    <BottomNav />
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', // по избор
    },
    container: {
        flex: 1,
        paddingTop: 35,    // падинг отгоре
        paddingBottom: 50, // падинг отдолу
    },
});

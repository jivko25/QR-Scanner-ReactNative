import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function BudgetActionsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Button
                title="Създай нов бюджет"
                onPress={() => navigation.navigate('BudgetCreateScreen')}
            />
            <View style={{ height: 20 }} />
            <Button
                title="Присъедини се с код"
                onPress={() => navigation.navigate('BudgetJoinScreen')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
});

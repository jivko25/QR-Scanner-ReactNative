import { View } from 'react-native';
import BudgetCategoryChart from "../components/BudgetCategoryChart";
import DefaultLayout from "../components/DefaultLayout";

export default function BudgetChartScreen({ route }) {
    const { budget } = route.params;

    return (
        <DefaultLayout>
            <View style={styles.container}>
            <BudgetCategoryChart budgetId={budget.id} />
            </View>
        </DefaultLayout>
    );
}

const styles = {
    container: {
        flex: 1
    }
}
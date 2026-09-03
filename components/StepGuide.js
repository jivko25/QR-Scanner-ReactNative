import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';

const { width } = Dimensions.get('window');

const steps = [
    {
        title: 'Добре дошъл!',
        description: 'С нашето приложение можеш лесно да следиш разходите си.',
        image: require('../assets/homeGuide1.png'), // Добави своето изображение тук
    },
    {
        title: 'Сканирай касови бележки',
        description: 'Използвай камерата, за да сканираш бележки и автоматично разпознаем сумите.',
        image: require('../assets/homeGuide2.png'),
    },
    {
        title: 'Следи бюджета си',
        description: 'Всички разходи се записват автоматично и можеш да ги прегледаш по категории.',
        image: require('../assets/homeGuide3.png'),
    },
    {
        title: 'Следи бюджета си',
        description: 'Всички разходи се записват автоматично и можеш да ги прегледаш по категории.',
        image: require('../assets/homeGuide4.png'),
    },
];

const StepGuide = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const [direction, setDirection] = useState(1);

    const animateSlide = (toValue, callback) => {
        slideAnim.setValue(toValue * width); // стартирай извън екрана
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            callback();
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            animateSlide(1, () => setCurrentStep(currentStep + 1));
        } else {
            onFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection(-1);
            animateSlide(-1, () => setCurrentStep(currentStep - 1));
        }
    };

    const step = steps[currentStep];

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.animatedStep,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>{step.title}</Text>
                <Text style={styles.description}>{step.description}</Text>

                <Image source={step.image} style={styles.image} resizeMode="contain" />
            </Animated.View>

            <View style={styles.buttonContainer}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.button} onPress={handlePrev}>
                        <Text style={styles.buttonText}>Назад</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentStep === steps.length - 1 ? 'Готово' : 'Напред'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.stepIndicators}>
                {steps.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentStep ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default StepGuide;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#d9fce4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 16,
        color: '#666',
    },
    image: {
        width: width * 0.8,
        height: width * 1.1,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    stepIndicators: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    activeDot: {
        backgroundColor: '#007bff',
    },
    inactiveDot: {
        backgroundColor: '#ccc',
    },
    animatedStep: {
        alignItems: 'center',
        width: '100%',
    },
    imageWithBorder: {
        width: width * 0.8,
        height: width * 1.1,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 24,
        marginVertical: 16,
    },
});

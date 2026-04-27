import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme as C, Spacing, Radius } from '../theme/colors';

const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '🏦',
    title: 'Your Financial Vault',
    subtitle: 'Store bank accounts, investments, pensions, insurance, and more — all in one secure place.',
    color: '#2d5a3d',
  },
  {
    id: '2',
    icon: '🎩',
    title: 'Meet Alfred',
    subtitle: 'Your AI finance concierge. Ask anything about your money — Alfred knows your full picture.',
    color: '#1a4f8a',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Track Net Worth',
    subtitle: 'See your assets vs liabilities in real time. Watch your wealth grow over time.',
    color: '#5a3d8a',
  },
  {
    id: '4',
    icon: '🔒',
    title: 'Private & Secure',
    subtitle: 'Your data is encrypted and never shared. Only you can access your vault.',
    color: '#8a5a2d',
  },
];

const ONBOARDING_KEY = '@monibox_onboarded';

type Props = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Dots + Button */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: C.accent }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnFinal]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Export for checking onboarding status
export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  skipBtn: { position: 'absolute', top: 60, right: Spacing.lg, zIndex: 10 },
  skipText: { fontSize: 16, color: C.text2 },

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  slideIcon: { fontSize: 56 },
  slideTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: C.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideSubtitle: {
    fontSize: 16,
    color: C.text2,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  dot: { height: 8, borderRadius: 4 },

  nextBtn: {
    width: '100%',
    backgroundColor: C.accent,
    paddingVertical: 16,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  nextBtnFinal: { backgroundColor: '#1a2e23' },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

import { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationPrompt } from '@/components/NotificationPrompt';
import { requestNotificationPermissions } from '@/lib/notifications';

const slides = [
  {
    title: 'Une question par jour',
    body: 'Reviens chaque jour pour une dose courte de culture generale.',
    marker: '1',
  },
  {
    title: 'Construis ton streak',
    body: 'Chaque jour joue prolonge ta serie et nourrit tes statistiques.',
    marker: '7',
  },
  {
    title: 'Choisis ton heure',
    body: 'Programme un rappel discret pour ne pas casser ta serie.',
    marker: '30',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(nextIndex);
    },
    [width],
  );

  const finishOnboarding = useCallback(async (): Promise<void> => {
    await requestNotificationPermissions();
    router.replace('/login');
  }, [router]);

  const goNext = useCallback((): void => {
    if (index === slides.length - 1) {
      void finishOnboarding();
      return;
    }

    scrollViewRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  }, [finishOnboarding, index, width]);

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView
        horizontal
        onMomentumScrollEnd={handleScroll}
        pagingEnabled
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {slides.map((slide, slideIndex) => (
          <View className="flex-1 justify-center gap-8 px-6" key={slide.title} style={{ width }}>
            <View className="items-center gap-5">
              <View className="h-28 w-28 items-center justify-center rounded-full bg-emerald-100">
                <Text className="text-5xl font-black text-emerald-700">
                  {slide.marker}
                </Text>
              </View>
              <View className="gap-3">
                <Text className="text-center text-4xl font-black text-slate-950">
                  {slide.title}
                </Text>
                <Text className="text-center text-lg leading-7 text-slate-600">
                  {slide.body}
                </Text>
              </View>
            </View>

            {slideIndex === 2 ? (
              <NotificationPrompt
                compact
                currentStreak={0}
                hasPlayedToday={false}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View className="gap-5 px-6 pb-6">
        <View className="flex-row justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <View
              className={`h-2 rounded-full ${
                slideIndex === index ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
              key={slide.title}
            />
          ))}
        </View>

        <Pressable
          accessibilityLabel={index === slides.length - 1 ? 'Terminer onboarding' : 'Slide suivante'}
          accessibilityRole="button"
          className="rounded-lg bg-emerald-600 px-5 py-4"
          onPress={goNext}
        >
          <Text className="text-center text-base font-black text-white">
            {index === slides.length - 1 ? 'Continuer' : 'Suivant'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

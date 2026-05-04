import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStreak } from '@/hooks/useStreak';
import { useSubscription } from '@/hooks/useSubscription';

const readParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';

const buildExplanation = (category: string): string =>
  `Cette question vient de la categorie ${category}. Garde la bonne reponse en tete : les petites revisions regulieres transforment vite la culture generale en reflexe.`;

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { streak } = useStreak();
  const { isPro } = useSubscription();
  const isCorrect = readParam(params.isCorrect) === 'true';
  const correctAnswer = readParam(params.correctAnswer);
  const category = readParam(params.category) || 'Culture generale';

  return (
    <SafeAreaView className="flex-1 bg-paper px-5 py-6">
      <View className="flex-1 justify-center gap-6">
        <View className="items-center gap-4">
          <View
            className={`h-24 w-24 items-center justify-center rounded-full ${
              isCorrect ? 'bg-emerald-100' : 'bg-rose-100'
            }`}
          >
            <Text
              className={`text-5xl font-black ${
                isCorrect ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isCorrect ? '✓' : '×'}
            </Text>
          </View>
          <Text className="text-center text-4xl font-black text-slate-950">
            {isCorrect ? 'Bonne reponse !' : 'Pas tout a fait...'}
          </Text>
        </View>

        <View className="gap-4 rounded-lg bg-white p-5 shadow-sm shadow-slate-200">
          <Text className="text-sm font-bold uppercase text-slate-500">
            Bonne reponse
          </Text>
          <Text className="rounded-lg bg-emerald-50 p-4 text-lg font-black text-emerald-800">
            {correctAnswer}
          </Text>
          <Text className="text-base leading-7 text-slate-600">
            {buildExplanation(category)}
          </Text>
          <Text className="text-xl font-black text-slate-950">
            Streak : {streak.currentStreak} jours
          </Text>
        </View>

        {!isPro && streak.currentStreak > 3 ? (
          <Pressable
            accessibilityLabel="Debloquer le classement avec Pro"
            accessibilityRole="button"
            className="rounded-lg bg-slate-950 px-5 py-4"
            onPress={() => router.push('/paywall')}
          >
            <Text className="text-center text-base font-black text-white">
              Debloquez le classement avec Pro
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityLabel="Retour a l'accueil"
          accessibilityRole="button"
          className="rounded-lg bg-emerald-600 px-5 py-4"
          onPress={() => router.replace('/')}
        >
          <Text className="text-center text-base font-black text-white">
            Retour a l'accueil
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

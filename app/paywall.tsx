import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSubscription } from '@/hooks/useSubscription';

const benefits = [
  'Questions illimitees chaque jour',
  'Acces a toutes les categories',
  'Classement mondial en temps reel',
  'Defis entre amis',
  'Historique complet illimite',
  'Sans publicite',
];

export default function PaywallScreen() {
  const router = useRouter();
  const {
    errorMessage,
    isLoading,
    monthlyPackage,
    purchaseMonthly,
    purchaseYearly,
    restorePurchases,
    yearlyPackage,
  } = useSubscription();

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-black text-slate-950">
            Passez a Quiz Pro
          </Text>
          <Pressable
            accessibilityLabel="Fermer le paywall"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={() => router.back()}
          >
            <Text className="text-xl font-black text-slate-500">×</Text>
          </Pressable>
        </View>

        <View className="gap-3 rounded-lg bg-white p-5 shadow-sm shadow-slate-200">
          {benefits.map((benefit) => (
            <View className="flex-row items-center gap-3" key={benefit}>
              <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <Text className="text-sm font-black text-emerald-700">✓</Text>
              </View>
              <Text className="flex-1 text-base font-semibold text-slate-700">
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityLabel="Acheter l'abonnement mensuel"
            accessibilityRole="button"
            className="rounded-lg border border-slate-200 bg-white p-5"
            disabled={isLoading}
            onPress={() => void purchaseMonthly()}
          >
            <Text className="text-xl font-black text-slate-950">Mensuel</Text>
            <Text className="mt-1 text-base font-semibold text-slate-600">
              {monthlyPackage?.product.priceString ?? '3,99 EUR/mois'}
            </Text>
            <Text className="mt-3 text-sm font-bold text-emerald-700">
              Essayer 7 jours gratuits
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Acheter l'abonnement annuel"
            accessibilityRole="button"
            className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-5"
            disabled={isLoading}
            onPress={() => void purchaseYearly()}
          >
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xl font-black text-slate-950">Annuel</Text>
              <Text className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                Economisez 37%
              </Text>
            </View>
            <Text className="mt-1 text-base font-semibold text-slate-600">
              {yearlyPackage?.product.priceString ?? '29,99 EUR/an'} soit 2,50 EUR/mois
            </Text>
            <Text className="mt-3 text-sm font-bold text-emerald-700">
              Essayer 7 jours gratuits
            </Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <Text className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityLabel="Restaurer mes achats"
          accessibilityRole="button"
          className="py-2"
          disabled={isLoading}
          onPress={() => void restorePurchases()}
        >
          <Text className="text-center text-sm font-bold text-slate-500">
            Restaurer mes achats
          </Text>
        </Pressable>

        <View className="flex-row justify-center gap-4">
          <Text className="text-xs font-semibold text-slate-400">
            Mentions legales
          </Text>
          <Text className="text-xs font-semibold text-slate-400">
            Politique de confidentialite
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

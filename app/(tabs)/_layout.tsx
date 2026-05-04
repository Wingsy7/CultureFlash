import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) => (
    <Ionicons color={color} name={name} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          borderTopColor: '#e2e8f0',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: tabIcon('flame-outline'),
        }}
      />
      <Tabs.Screen
        name="classement"
        options={{
          title: 'Classement',
          tabBarIcon: tabIcon('podium-outline'),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: tabIcon('person-circle-outline'),
        }}
      />
    </Tabs>
  );
}

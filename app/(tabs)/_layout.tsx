import { Tabs } from 'expo-router';
import { Home, QrCode, User } from 'lucide-react-native';
import { View } from 'react-native';
import { appTheme, glassCard } from '../../constants/appTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 18,
          height: 76,
          paddingBottom: 12,
          paddingTop: 10,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: appTheme.colors.surfaceGlass,
          ...glassCard,
        },
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'QR',
          tabBarIcon: () => (
            <View
              className="p-3 rounded-full -mt-6"
              style={{
                backgroundColor: appTheme.colors.primary,
                shadowColor: '#5148D8',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.22,
                shadowRadius: 18,
                elevation: 10,
              }}
            >
              <QrCode size={28} color="#ffffff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

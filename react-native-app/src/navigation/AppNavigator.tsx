import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import VaultScreen from '../screens/VaultScreen';
import VaultCategoryScreen from '../screens/VaultCategoryScreen';
import VaultItemForm from '../screens/VaultItemForm';
import AlfredScreen from '../screens/AlfredScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useThemeProvider, ThemeContext } from '../hooks/useTheme';
import { LoadingSpinner } from '../components';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const VaultStack = createStackNavigator();

const ONBOARDING_KEY = '@monibox_onboarded';

function VaultStackScreen() {
  return (
    <VaultStack.Navigator screenOptions={{ headerShown: false }}>
      <VaultStack.Screen name="VaultHome" component={VaultScreen} />
      <VaultStack.Screen name="VaultCategory" component={VaultCategoryScreen} />
      <VaultStack.Screen
        name="VaultItemForm"
        component={VaultItemForm}
        options={{ presentation: 'modal' }}
      />
    </VaultStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: 'rgba(0,0,0,0.08)',
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2d5a3d',
        tabBarInactiveTintColor: '#9a9a9a',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          // tabBarIcon: use react-native-vector-icons or SF Symbols
        }}
      />
      <Tab.Screen
        name="Vault"
        component={VaultStackScreen}
        options={{
          tabBarLabel: 'Vault',
        }}
      />
      <Tab.Screen
        name="Alfred"
        component={AlfredScreen}
        options={{
          tabBarLabel: 'Alfred',
        }}
      />
      <Tab.Screen
        name="Investments"
        component={InvestmentsScreen}
        options={{
          tabBarLabel: 'Invest',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const theme = useThemeProvider();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboarded(val === 'true');
    });
  }, []);

  if (authLoading || onboarded === null) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!onboarded && !user ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen onComplete={() => setOnboarded(true)} />}
            </Stack.Screen>
          ) : user ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

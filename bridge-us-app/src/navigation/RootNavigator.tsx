import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import TasksListScreen from '../screens/TasksListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WalkthroughScreen from '../screens/WalkthroughScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { useUnreadChats } from '../hooks/useUnreadChats';

enableScreens();

export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string } | undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatRoomId: string; title: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyApplications: undefined;
  Favorites: undefined;
  TaskDetail: { taskId: string } | undefined;
};

export type RootStackParamList = {
  Walkthrough: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

function TasksStackNavigator() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: 'おねがいタスク' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'タスク詳細' }} />
    </TasksStack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="ChatList" component={ChatScreen} options={{ title: 'チャット' }} />
      <ChatStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </ChatStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'プロフィール' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'プロフィール編集' }} />
      <ProfileStack.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: '応募中のタスク' }} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'お気に入り' }} />
      <ProfileStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'タスク詳細' }} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { unreadCount: notificationUnreadCount } = useUnreadNotifications();
  const { unreadCount: chatUnreadCount } = useUnreadChats();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksStackNavigator}
        options={{
          title: 'タスク',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          title: 'チャット',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: '通知',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: notificationUnreadCount > 0 ? notificationUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'マイページ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenWalkthrough');
        setHasSeenWalkthrough(value === 'true');
      } catch {
        setHasSeenWalkthrough(true);
      }
    })();
  }, []);

  if (hasSeenWalkthrough === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={hasSeenWalkthrough ? 'MainTabs' : 'Walkthrough'}>
        <Stack.Screen name="Walkthrough" component={WalkthroughScreen} options={{ title: 'ようこそ' }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

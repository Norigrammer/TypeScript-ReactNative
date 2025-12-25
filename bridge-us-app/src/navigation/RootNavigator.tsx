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
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import CompanyRegisterScreen from '../screens/CompanyRegisterScreen';
import CompanyProfileScreen from '../screens/company/CompanyProfileScreen';
import CompanyEditProfileScreen from '../screens/company/CompanyEditProfileScreen';
import CompanyProfileViewScreen from '../screens/CompanyProfileViewScreen';
import MyTasksListScreen from '../screens/company/MyTasksListScreen';
import CreateTaskScreen from '../screens/company/CreateTaskScreen';
import EditTaskScreen from '../screens/company/EditTaskScreen';
import TaskApplicationsScreen from '../screens/company/TaskApplicationsScreen';
import { useAuth } from '../contexts/AuthContext';
import { isCompanyUser } from '../types/user';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { useUnreadChats } from '../hooks/useUnreadChats';

enableScreens();

// ==================== 型定義 ====================

export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string } | undefined;
  CompanyProfile: { companyId: string };
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
  CompanyProfile: { companyId: string };
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Walkthrough: undefined;
  StudentMainTabs: undefined;
  CompanyMainTabs: undefined;
  Auth: undefined;
};

// ==================== Stack/Tab定義 ====================

const Stack = createNativeStackNavigator<RootStackParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

const AuthStack = createNativeStackNavigator();

// 企業用のStack
const CompanyProfileStack = createNativeStackNavigator();
const CompanyTasksStack = createNativeStackNavigator();

// ==================== Auth Navigator ====================

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="UserTypeSelection"
        component={UserTypeSelectionScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'ログイン' }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: '新規登録（学生）' }}
      />
      <AuthStack.Screen
        name="CompanyRegister"
        component={CompanyRegisterScreen}
        options={{ title: '新規登録（企業）' }}
      />
    </AuthStack.Navigator>
  );
}

// ==================== 学生用 Navigators ====================

function TasksStackNavigator() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: 'おねがいタスク' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'タスク詳細' }} />
      <TasksStack.Screen name="CompanyProfile" component={CompanyProfileViewScreen} options={{ title: '企業情報' }} />
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
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'マイページ' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'プロフィール編集' }} />
      <ProfileStack.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: '応募中のタスク' }} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'お気に入り' }} />
      <ProfileStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'タスク詳細' }} />
      <ProfileStack.Screen name="CompanyProfile" component={CompanyProfileViewScreen} options={{ title: '企業情報' }} />
      <ProfileStack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
      <ProfileStack.Screen name="Register" component={RegisterScreen} options={{ title: '新規登録' }} />
    </ProfileStack.Navigator>
  );
}

function StudentMainTabs() {
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
          tabBarBadge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
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

// ==================== 企業用 Navigators ====================

// 企業用タスク管理スタック
function CompanyTasksStackNavigator() {
  return (
    <CompanyTasksStack.Navigator>
      <CompanyTasksStack.Screen
        name="MyTasksList"
        component={MyTasksListScreen}
        options={{ title: 'タスク管理' }}
      />
      <CompanyTasksStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: '新規タスク作成' }}
      />
      <CompanyTasksStack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ title: 'タスク編集' }}
      />
      <CompanyTasksStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'タスク詳細' }}
      />
      <CompanyTasksStack.Screen
        name="TaskApplications"
        component={TaskApplicationsScreen}
        options={{ title: '応募者一覧' }}
      />
    </CompanyTasksStack.Navigator>
  );
}

// 企業用プロフィールスタック
function CompanyProfileStackNavigator() {
  return (
    <CompanyProfileStack.Navigator>
      <CompanyProfileStack.Screen
        name="CompanyProfileMain"
        component={CompanyProfileScreen}
        options={{ title: '企業マイページ' }}
      />
      <CompanyProfileStack.Screen
        name="CompanyEditProfile"
        component={CompanyEditProfileScreen}
        options={{ title: 'プロフィール編集' }}
      />
    </CompanyProfileStack.Navigator>
  );
}

function CompanyMainTabs() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { unreadCount: notificationUnreadCount } = useUnreadNotifications();
  const { unreadCount: chatUnreadCount } = useUnreadChats();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b5cf6', // 企業用のアクセントカラー
        tabBarInactiveTintColor: colors.subText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="MyTasks"
        component={CompanyTasksStackNavigator}
        options={{
          title: 'タスク管理',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
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
          tabBarBadge: chatUnreadCount > 0 ? chatUnreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            fontSize: 10,
            minWidth: 18,
            height: 18,
          },
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
        name="CompanyProfile"
        component={CompanyProfileStackNavigator}
        options={{
          title: 'マイページ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ==================== Root Navigator ====================

export default function RootNavigator() {
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState<boolean | null>(null);
  const { isLoading, isLoggedIn, user } = useAuth();

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

  if (hasSeenWalkthrough === null || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 初期画面の決定ロジック:
  // 1. ウォークスルー未完了 -> Walkthrough
  // 2. ログイン済み（企業）-> CompanyMainTabs
  // 3. ログイン済み（学生）-> StudentMainTabs
  // 4. 未ログイン -> Auth (スキップ可能)
  const getInitialRoute = () => {
    if (!hasSeenWalkthrough) return 'Walkthrough';
    if (isLoggedIn && user) {
      return isCompanyUser(user) ? 'CompanyMainTabs' : 'StudentMainTabs';
    }
    return 'Auth';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{ gestureEnabled: false }}
      >
        <Stack.Screen name="Walkthrough" component={WalkthroughScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthStackNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="StudentMainTabs" component={StudentMainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="CompanyMainTabs" component={CompanyMainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import TasksListScreen from '../screens/TasksListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WalkthroughScreen from '../screens/WalkthroughScreen';
import { Text } from 'react-native';

enableScreens();

export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string } | undefined;
};

export type RootStackParamList = {
  Walkthrough: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const Tab = createBottomTabNavigator();

function TasksStackNavigator() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: 'おねがいタスク' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'タスク詳細' }} />
    </TasksStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Tasks" component={TasksStackNavigator} options={{ title: 'タスク' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'チャット' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: '通知' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'プロフィール' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* 初回起動時のみ表示予定。現段階ではスキップ可 */}
        {/* <Stack.Screen name="Walkthrough" component={WalkthroughScreen} options={{ title: 'ようこそ' }} /> */}
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

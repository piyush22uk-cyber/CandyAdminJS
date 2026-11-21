
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SuperAdminLoginScreen from '../screens/SuperAdminLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import ViewUsersScreen from '../screens/ViewUsersScreen';


import AdminTabs from './AdminTabs';
import ManageAdminsScreen from '../screens/ManageAdminsScreen';
import AdminOrderNotificationsScreen from '../screens/AdminOrderNotificationsScreen';
import AdminPermissionsScreen from '../screens/AdminPermissionsScreen';
import AboutScreen from '../screens/AboutScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SuperAdminLoginScreen"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#101C2D',
          },
        }}
      >
        <Stack.Screen
          name="SuperAdminLoginScreen"
          component={SuperAdminLoginScreen}
        />

        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
        />

        

        <Stack.Screen
          name="AdminTabs"
          component={AdminTabs}
        />

        <Stack.Screen
          name="ManageAdmins"
          component={ManageAdminsScreen}
        />

        <Stack.Screen
  name="AdminOrderNotifications"
  component={AdminOrderNotificationsScreen}
/>

<Stack.Screen
  name="ViewUsers"
  component={ViewUsersScreen}
  options={{ title: 'Customer Accounts' }}
/>


<Stack.Screen
  name="AdminPermissions"
  component={AdminPermissionsScreen}
  options={{ title: 'Admin Permissions' }}
/>

<Stack.Screen
  name="About"
  component={AboutScreen}
  options={{
    headerShown: false,
  }}
/>

<Stack.Screen
  name="Account"
  component={AccountScreen}
  options={{ headerShown: false }}
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

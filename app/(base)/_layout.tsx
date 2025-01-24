import { Tabs } from "expo-router";
import { Package, LogOutIcon, UserIcon } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import auth from "@react-native-firebase/auth";

export default function BaseLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Mes suivis",
          headerTransparent: true,
          headerTitleStyle: {
            fontFamily: "Syne_700Bold",
            fontSize: 23,
            color: "#20325c",
          },
          tabBarIcon: ({ focused }) => (
            <Package size={30} color={focused ? "#0083FF" : "#20325c"} />
          ),
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            paddingTop: 10,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          headerTitle: "Mon profil",
          headerTransparent: true,
          headerTitleStyle: {
            fontFamily: "Syne_700Bold",
            fontSize: 23,
            color: "#20325c",
          },
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 20 }}
              onPress={() => auth().signOut()}
            >
              <LogOutIcon size={24} color="#20325c" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused }) => (
            <UserIcon size={30} color={focused ? "#0083FF" : "#20325c"} />
          ),
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            paddingTop: 10,
          },
        }}
      />
    </Tabs>
  );
}

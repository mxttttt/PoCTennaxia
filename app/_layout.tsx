import { router, Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
} from "@expo-google-fonts/syne";
import { Image, TouchableOpacity, View, Text } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { DefaultStyles } from "@/constants/DefaultStyles";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthContext } from "@/context/AuthContext";

// Maintenir le SplashScreen visible pendant le chargement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const [fontsLoaded] = useFonts({
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
    Syne_700Bold,
  });

  // Gérer les changements d'état de l'authentification
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (!initializing && fontsLoaded) {
      // Si l'utilisateur est connecté, rediriger vers l'app principale
      if (user) {
        router.replace("/(base)");
      } else {
        router.replace("/(authentication)");
      }
      // Cacher le SplashScreen une fois la redirection effectuée
      SplashScreen.hideAsync();
    }
  }, [initializing, fontsLoaded, user]);

  if (initializing || !fontsLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      <Stack>
        <Stack.Screen
          name="(authentication)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(base)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new-tracking"
          options={{
            presentation: "card",
            animation: "slide_from_right",
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTransparent: true,
            headerTitle: "",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color="#20325c" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="delivery/[id]"
          options={{
            presentation: "card",
            animation: "slide_from_right",
            headerTransparent: true,
            headerTitle: "",
            headerStyle: {
              backgroundColor: "#fff",
            },

            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color="#20325c" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </AuthContext.Provider>
  );
}

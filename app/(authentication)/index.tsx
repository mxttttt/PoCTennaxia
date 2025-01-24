import { Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import { DefaultStyles } from "@/constants/DefaultStyles";
import * as Animatable from "react-native-animatable";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import React from "react";

import { InfoIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Index() {
  // Animation values
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

  // Animations styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
    glowOpacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
    glowOpacity.value = withSpring(0.2);
  };

  const router = useRouter();

  return (
    <SafeAreaView style={[DefaultStyles.container, { position: "relative" }]}>
      <Animatable.View
        style={DefaultStyles.container}
        animation="fadeIn"
        duration={1000}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Animatable.Text
            style={[DefaultStyles.titleStyle, { marginBottom: 40 }]}
            animation="fadeInDown"
            duration={1000}
            delay={500}
          >
            Bienvenue
          </Animatable.Text>

          <Animatable.View animation="slideInUp" duration={800} delay={300}>
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                style={[
                  DefaultStyles.buttonStyle,
                  {
                    shadowColor: "#ffffff",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                  },
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push("/(modal)/LoginModal")}
              >
                <Text
                  style={[
                    DefaultStyles.textStyle,
                    {
                      color: "#20325c",
                      fontSize: 18,
                      fontFamily: "Syne_700Bold",
                    },
                  ]}
                >
                  Me connecter
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingTop: 20,
              }}
            >
              <InfoIcon size={24} color="#fff" />
              <Text style={{ color: "#fff" }}>Plus d'informations</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
}

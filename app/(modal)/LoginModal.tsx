import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { DefaultStyles } from "@/constants/DefaultStyles";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import { router } from "expo-router";

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      //close modal
      router.dismiss();
      //navigate to base app
      router.navigate("/(base)");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("La connexion a échoué: " + err.message);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        flex: 1,
        paddingTop: 100,
        paddingHorizontal: 26,
      }}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={{ width: "100%", gap: 10 }}>
          <Text style={[DefaultStyles.textStyle, { color: "#000" }]}>
            Email
          </Text>
          <TextInput
            style={DefaultStyles.inputStyle}
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />
          <Text style={[DefaultStyles.textStyle, { color: "#000" }]}>
            Mot de passe
          </Text>
          <TextInput
            style={[DefaultStyles.inputStyle, { color: "#000" }]}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[
              DefaultStyles.buttonStyle,
              { backgroundColor: "#20325c", marginTop: 26 },
            ]}
            onPress={signIn}
          >
            <Text style={DefaultStyles.textStyle}>Connexion</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

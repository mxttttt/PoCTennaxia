import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Mail, Phone, Globe, ChevronRight, Moon } from "lucide-react-native";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// Type pour les données utilisateur
type UserData = {
  firstName: string;
  lastName: string;
  phone: string;
  language: string;
  email: string;
  photoURL?: string;
};

export default function ProfilePage() {
  const user = auth().currentUser;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const toggleDarkMode = () => setIsDarkMode((previousState) => !previousState);

  const MenuItem = ({
    icon: Icon,
    label,
    value,
    onPress,
    rightElement,
  }: {
    icon: any;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Icon size={20} color="#666" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {rightElement || <ChevronRight size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              userData?.photoURL ||
              user?.photoURL ||
              "https://via.placeholder.com/100",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {userData
            ? `${userData.firstName} ${userData.lastName}`
            : "Utilisateur"}
        </Text>
      </View>

      <View style={styles.section}>
        <MenuItem
          icon={Moon}
          label="Dark Mode"
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#e0e0e0", true: "#81b0ff" }}
              thumbColor={isDarkMode ? "#2196F3" : "#f4f3f4"}
            />
          }
        />
        <MenuItem
          icon={Mail}
          label="Mail"
          value={userData?.email || user?.email || ""}
        />
        <MenuItem
          icon={Phone}
          label="Phone"
          value={userData?.phone || "Non renseigné"}
        />
        <MenuItem
          icon={Globe}
          label="Language"
          value={userData?.language || "Français"}
          onPress={() => {
            /* Gérer le changement de langue */
          }}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          auth().signOut();
          router.navigate("/(authentication)");
        }}
      >
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
  },
  section: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: "Syne_400Regular",
    color: "#333",
  },
  menuValue: {
    fontSize: 14,
    fontFamily: "Syne_400Regular",
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#f44336",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Syne_600SemiBold",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { Image } from "react-native";

// Type pour les données du suivi
type ShipmentDetails = {
  id: string;
  email: string;
  wasteType: string;
  destination: string;
  producerSignature: string;
  transporterSignature: string;
  status: "en_cours" | "terminée";
  createdAt: any;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
};

export default function DeliveryDetailsPage() {
  const { id } = useLocalSearchParams();
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        const docRef = await firestore()
          .collection("shipments")
          .doc(id as string)
          .get();

        if (docRef.exists) {
          const data = docRef.data();
          setShipment({
            id: docRef.id,
            ...data,
          } as ShipmentDetails);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        Alert.alert("Erreur", "Impossible de charger les détails du suivi");
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20325c" />
      </View>
    );
  }

  if (!shipment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Suivi non trouvé</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Détails du suivi</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Statut</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    shipment.status === "terminée" ? "#4CAF50" : "#2196F3",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {shipment.status === "terminée" ? "Terminée" : "En cours"}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{shipment.email}</Text>

          <Text style={styles.label}>Type de déchet</Text>
          <Text style={styles.value}>{shipment.wasteType}</Text>

          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{shipment.destination}</Text>

          <Text style={styles.label}>Date de création</Text>
          <Text style={styles.value}>
            {shipment.createdAt?.toDate().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signatures</Text>

          <View style={styles.signatureSection}>
            <Text style={styles.label}>Signature du producteur</Text>
            <Image
              source={{ uri: shipment.producerSignature }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.label}>Signature du transporteur</Text>
            <Image
              source={{ uri: shipment.transporterSignature }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {shipment.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <Text style={styles.value}>
              Latitude: {shipment.location.latitude}
            </Text>
            <Text style={styles.value}>
              Longitude: {shipment.location.longitude}
            </Text>
            <Text style={styles.value}>
              Horodatage:{" "}
              {new Date(shipment.location.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Syne_400Regular",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
    marginBottom: 16,
  },
  signatureSection: {
    marginBottom: 16,
  },
  signatureImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "Syne_600SemiBold",
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    fontFamily: "Syne_400Regular",
  },
  title: {
    fontSize: 20,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Syne_600SemiBold",
  },
});

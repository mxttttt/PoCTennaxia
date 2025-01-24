import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Factory,
  Truck,
  Recycle,
  Plus,
  Check,
  User,
  FileCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// Type pour une livraison
type Delivery = {
  id: string;
  destination: string;
  status: "en_cours" | "terminée";
  date: string;
  waste: string;
  email: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

const ProgressBar = ({ status }: { status: string }) => {
  const steps = [
    { icon: Factory, label: "Producteur" },
    { icon: Truck, label: "Transporteur" },
    { icon: Recycle, label: "Centre de tri" },
  ];

  const getCurrentStep = () => {
    switch (status) {
      case "terminée":
        return 3;
      case "en_cours":
        return 1;
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStep();

  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  isCompleted ? styles.completedLine : styles.pendingLine,
                ]}
              />
            )}
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.completedCircle,
                  isCurrent && styles.currentCircle,
                ]}
              >
                {isCompleted ? (
                  <Check size={16} color="#fff" />
                ) : (
                  <StepIcon
                    size={16}
                    color={isCurrent ? "#20325c" : "#9e9e9e"}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isCompleted || isCurrent) && styles.activeStepLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchShipments = async () => {
      try {
        const shipmentsRef = firestore()
          .collection("shipments")
          .where("userId", "==", user.uid)
          .orderBy("createdAt", "desc");

        const snapshot = await shipmentsRef.get();
        const shipmentsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            destination:
              typeof data.destination === "string"
                ? data.destination
                : data.destination?.name || "Destination inconnue",
            status: data.status || "en_cours",
            date:
              data.createdAt?.toDate().toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
            waste: data.wasteType || "",
            email: data.email || "",
            location: data.location || undefined,
          } as Delivery;
        });

        setShipments(shipmentsData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des suivis:", error);
        Alert.alert("Erreur", "Impossible de récupérer la liste des suivis");
        setLoading(false);
      }
    };

    fetchShipments();

    // Écouteur en temps réel
    const unsubscribe = firestore()
      .collection("shipments")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const shipmentsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              destination:
                typeof data.destination === "string"
                  ? data.destination
                  : data.destination?.name || "Destination inconnue",
              status: data.status || "en_cours",
              date:
                data.createdAt?.toDate().toISOString().split("T")[0] ||
                new Date().toISOString().split("T")[0],
              waste: data.wasteType || "",
              email: data.email || "",
              location: data.location || undefined,
            } as Delivery;
          });
          setShipments(shipmentsData);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur de l'écouteur:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user]);

  const renderDeliveryItem = ({ item }: { item: Delivery }) => {
    // Fonction pour obtenir le style du statut
    const getStatusStyle = (status: string) => {
      return {
        ...styles.statusBadge,
        backgroundColor: status === "terminée" ? "#4CAF50" : "#2196F3",
      };
    };

    // Fonction pour obtenir le texte du statut
    const getStatusText = (status: string) => {
      return status === "terminée" ? "Terminée" : "En cours";
    };

    return (
      <TouchableOpacity
        style={styles.deliveryItem}
        onPress={() => router.push(`/delivery/${item.id}`)}
      >
        <View style={styles.deliveryHeader}>
          <Text style={styles.destinationText}>{item.destination}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <Text style={styles.wasteText}>{item.waste}</Text>
        <Text style={styles.emailText}>{item.email}</Text>

        <View style={styles.statusContainer}>
          <View style={getStatusStyle(item.status)}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <ProgressBar status={item.status} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20325c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.listContainer}
        data={shipments}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun suivi disponible</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/new-tracking")}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
    paddingTop: 30,
  },
  deliveryItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 18,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Syne_400Regular",
  },
  wasteText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontFamily: "Syne_400Regular",
  },
  emailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontFamily: "Syne_400Regular",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#20325c",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Syne_400Regular",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stepContainer: {
    alignItems: "center",
    flex: 0,
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 8,
  },
  completedLine: {
    backgroundColor: "#4CAF50",
  },
  pendingLine: {
    backgroundColor: "#e0e0e0",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  completedCircle: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  currentCircle: {
    borderColor: "#20325c",
  },
  stepLabel: {
    fontSize: 12,
    color: "#9e9e9e",
    fontFamily: "Syne_400Regular",
    textAlign: "center",
  },
  activeStepLabel: {
    color: "#20325c",
    fontFamily: "Syne_600SemiBold",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontFamily: "Syne_400Regular",
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: "Syne_700Bold",
    color: "#20325c",
    padding: 16,
    paddingBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Syne_600SemiBold",
  },
});

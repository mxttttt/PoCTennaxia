import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  FlatList,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import SignatureCanvas, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import firestore from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { Cog, Recycle, Leaf, Laptop, LucideIcon } from "lucide-react-native";

// Ajout du type pour un déchet
type WasteType = {
  id: string;
  label: string;
  icon: LucideIcon; // Utiliser le type LucideIcon au lieu de ComponentType
};

// Types de déchets disponibles
const WASTE_TYPES: WasteType[] = [
  {
    id: "dechets_metalliques",
    label: "Déchets métalliques",
    icon: Cog,
  },
  {
    id: "dechets_plastiques",
    label: "Déchets plastiques",
    icon: Recycle,
  },
  {
    id: "dechets_organiques",
    label: "Déchets organiques",
    icon: Leaf,
  },
  {
    id: "dechets_electroniques",
    label: "Déchets électroniques",
    icon: Laptop,
  },
];

// Lieux disponibles
const LOCATIONS = ["Charleroi", "Bruxelles", "Liège", "Namur", "Mons"];

// Ajout des nouveaux types
type ValidationStep =
  | "producer_signature"
  | "producer_validation"
  | "transporter_signature"
  | "transporter_validation"
  | "completed";

export default function NewTrackingPage() {
  const { user } = useAuth();
  const signatureRef = useRef<SignatureViewRef>(null);
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState<string>("");
  const [selectedWaste, setSelectedWaste] = useState<WasteType>(WASTE_TYPES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentStep, setCurrentStep] =
    useState<ValidationStep>("producer_signature");
  const [producerSignature, setProducerSignature] = useState<string>("");
  const [transporterSignature, setTransporterSignature] = useState<string>("");
  const [validationCode, setValidationCode] = useState<string>("");
  const [isSigningEnabled, setIsSigningEnabled] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]); // Pour un code à 6 chiffres
  const codeInputRefs = useRef<Array<TextInput | null>>([]);

  // Code de validation en dur pour le moment
  const VALIDATION_CODE = "123456";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "La géolocalisation est nécessaire pour enregistrer le suivi."
        );
        return;
      }
    })();
  }, []);

  // Fonction pour vérifier le code de validation
  const verifyValidationCode = (code: string) => {
    if (code === VALIDATION_CODE) {
      setCurrentStep("transporter_signature");
    } else {
      Alert.alert("Erreur", "Code de validation incorrect");
    }
  };

  // Gestion des signatures selon l'étape
  const handleSignature = (data: string) => {
    if (currentStep === "producer_signature") {
      setProducerSignature(data);
      setCurrentStep("producer_validation");
    } else if (currentStep === "transporter_signature") {
      setTransporterSignature(data);
      setCurrentStep("transporter_validation");
    }
  };

  const handleEmpty = () => {
    console.log("handleEmpty appelé");
    setSignature("");
  };

  const handleClear = () => {
    console.log("handleClear appelé");
    setSignature("");
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Erreur de géolocalisation:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!email) {
        Alert.alert("Erreur", "Veuillez renseigner votre email");
        return;
      }

      if (currentStep === "producer_validation") {
        if (validationCode !== VALIDATION_CODE) {
          Alert.alert("Erreur", "Code de validation producteur incorrect");
          return;
        }
        setCurrentStep("transporter_signature");
        setCode(["", "", "", "", "", ""]); // Réinitialiser le code
        setValidationCode("");
        return;
      }

      if (currentStep === "transporter_validation") {
        if (validationCode !== VALIDATION_CODE) {
          Alert.alert("Erreur", "Code de validation transporteur incorrect");
          return;
        }

        const currentLocation = await getCurrentLocation();
        if (!currentLocation) {
          Alert.alert("Erreur", "Impossible d'obtenir votre position");
          return;
        }

        // Hash des signatures
        const producerSignatureHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          producerSignature
        );

        const transporterSignatureHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          transporterSignature
        );

        const shipmentData = {
          email,
          wasteType: selectedWaste.label,
          destination: location,
          producerSignature,
          producerSignatureHash,
          transporterSignature,
          transporterSignatureHash,
          validationCode,
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: "en_cours",
          userId: user?.uid,
          location: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date().toISOString(),
          },
        };

        await firestore().collection("shipments").add(shipmentData);
        setCurrentStep("completed");
        Alert.alert("Succès", "Le suivi a été enregistré avec succès", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement");
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "La géolocalisation est nécessaire pour cette fonctionnalité"
      );
      return false;
    }
    return true;
  };

  const renderWasteItem = ({ item }: { item: WasteType }) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        style={[
          styles.wasteItem,
          selectedWaste.id === item.id && styles.wasteItemSelected,
        ]}
        onPress={() => setSelectedWaste(item)}
      >
        <IconComponent
          size={32}
          color={selectedWaste.id === item.id ? "#fff" : "#20325c"}
        />
        <Text
          style={[
            styles.wasteItemText,
            selectedWaste.id === item.id && styles.wasteItemTextSelected,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const validateSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setValidationCode(newCode.join(""));

    // Passer au champ suivant si un chiffre est entré
    if (text.length === 1 && index < code.length - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const renderCodeValidation = () => (
    <>
      <Text style={styles.stepTitle}>
        {currentStep === "producer_validation"
          ? "Code de validation producteur"
          : "Code de validation transporteur"}
      </Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (codeInputRefs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                codeInputRefs.current[index - 1]?.focus();
              }
            }}
          />
        ))}
      </View>
    </>
  );

  // Rendu conditionnel selon l'étape
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "producer_signature":
      case "transporter_signature":
        return (
          <View style={styles.signatureContainer}>
            <Text style={styles.stepTitle}>
              {currentStep === "producer_signature"
                ? "Signature du producteur"
                : "Signature du transporteur"}
            </Text>
            <View style={styles.signatureBox}>
              <SignatureCanvas
                ref={signatureRef}
                onOK={handleSignature}
                onEmpty={handleEmpty}
                onClear={handleClear}
                onBegin={() => setIsSigningEnabled(true)}
                onEnd={() => setIsSigningEnabled(false)}
                descriptionText=""
                clearText="Effacer"
                confirmText="Enregistrer"
                webStyle={`
                  .m-signature-pad {
                    box-shadow: none;
                    border: none;
                  }
                  .m-signature-pad--body {
                    border: none;
                  }
                  .m-signature-pad--footer {
                    display: none;
                  }
                `}
              />
            </View>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => signatureRef.current?.clearSignature()}
            >
              <Text style={styles.clearButtonText}>Effacer la signature</Text>
            </TouchableOpacity>
          </View>
        );
      case "producer_validation":
      case "transporter_validation":
        return renderCodeValidation();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} scrollEnabled={!isSigningEnabled}>
        <Text style={styles.title}>Nouveau suivi</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Votre adresse email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type de déchet</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={WASTE_TYPES}
            renderItem={renderWasteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.wasteList}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Lieu de destination</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Text style={styles.pickerButtonText}>{location}</Text>
          </TouchableOpacity>
        </View>

        {/* Rendu de l'étape courante */}
        {renderCurrentStep()}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            if (
              currentStep === "producer_signature" ||
              currentStep === "transporter_signature"
            ) {
              if (signatureRef.current) {
                signatureRef.current.readSignature();
              }
            } else if (
              currentStep === "producer_validation" ||
              currentStep === "transporter_validation"
            ) {
              // Gérer les deux étapes de validation
              handleSubmit();
            } else if (currentStep === "completed") {
              router.back();
            }
          }}
        >
          <Text style={styles.submitButtonText}>
            {currentStep === "completed" ? "Terminé" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontFamily: "Syne_700Bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontFamily: "Syne_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Syne_400Regular",
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Syne_400Regular",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20, // Pour éviter que le picker touche le bas de l'écran
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "Syne_400Regular",
  },
  modalDoneText: {
    color: "#2196F3",
    fontSize: 16,
    fontFamily: "Syne_600SemiBold",
  },
  picker: {
    height: 216, // Hauteur standard du picker iOS
    backgroundColor: "#fff",
  },
  signatureContainer: {
    marginBottom: 20,
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 200,
    overflow: "hidden",
  },
  signature: {
    flex: 1,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Syne_600SemiBold",
  },
  signatureStatus: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Syne_400Regular",
    color: "#666",
  },
  clearButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Syne_600SemiBold",
  },
  validateSignatureButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  validateSignatureButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Syne_600SemiBold",
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
    marginBottom: 16,
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  wasteList: {
    paddingVertical: 8,
  },
  wasteItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    width: 120,
    height: 120,
  },
  wasteItemSelected: {
    backgroundColor: "#20325c",
  },
  wasteItemText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#20325c",
    fontFamily: "Syne_400Regular",
  },
  wasteItemTextSelected: {
    color: "#fff",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: "#20325c",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Syne_600SemiBold",
    color: "#20325c",
    backgroundColor: "#fff",
  },
});

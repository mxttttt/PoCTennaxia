import { Buffer } from "buffer";
import * as Crypto from "expo-crypto";

// Simuler une paire de clés (dans un vrai système, elles seraient stockées de manière sécurisée)
const KEY_PAIR = {
  publicKey: process.env.EXPO_PUBLIC_SIGNATURE_PUBLIC_KEY,
  privateKey: process.env.EXPO_PUBLIC_SIGNATURE_PRIVATE_KEY,
};

export class CryptoService {
  static async encryptSignature(signature: string) {
    try {
      // Utiliser expo-crypto pour générer des valeurs aléatoires
      const salt = await Crypto.getRandomBytesAsync(16);
      const iv = await Crypto.getRandomBytesAsync(12);

      // Création d'une clé de chiffrement à partir de la clé publique
      const keyMaterial = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        KEY_PAIR.publicKey || ""
      );

      // Chiffrement de la signature
      const signatureWithSalt =
        signature + Buffer.from(salt).toString("base64");
      const encryptedSignature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        signatureWithSalt + keyMaterial
      );

      return {
        encryptedData: encryptedSignature,
        salt: Buffer.from(salt).toString("base64"),
        iv: Buffer.from(iv).toString("base64"),
        timestamp: new Date().toISOString(),
        publicKeyId: "v1", // Identifiant de la version de la clé publique
      };
    } catch (error) {
      console.error("Erreur de chiffrement:", error);
      throw error;
    }
  }

  static async verifySignature(
    originalSignature: string,
    encryptedData: {
      encryptedData: string;
      salt: string;
      iv: string;
      publicKeyId: string;
    }
  ) {
    try {
      // Recréation du hash avec les mêmes paramètres
      const salt = Buffer.from(encryptedData.salt, "base64");
      const keyMaterial = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        KEY_PAIR.publicKey || ""
      );

      const signatureWithSalt =
        originalSignature + Buffer.from(salt).toString("base64");
      const verificationHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        signatureWithSalt + keyMaterial
      );

      return verificationHash === encryptedData.encryptedData;
    } catch (error) {
      console.error("Erreur de vérification:", error);
      return false;
    }
  }
}

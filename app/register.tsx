import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = () => {
    if (!email || !password || !confirm) {
      Alert.alert("Uyarı", "Tüm alanları doldurun.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Hata", "Şifreler uyuşmuyor!");
      return;
    }
    Alert.alert("Kayıt Başarılı", "Artık giriş yapabilirsiniz.");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Hesap Oluştur</Text>
      <Text style={styles.subtitle}>BekoSIRS'e kayıt olun</Text>

      <TextInput placeholder="E-posta" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Şifre" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <TextInput placeholder="Şifreyi Tekrar Girin" secureTextEntry style={styles.input} value={confirm} onChangeText={setConfirm} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")} style={{ marginTop: 16 }}>
        <Text style={{ color: colors.accent }}>Zaten hesabın var mı? Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: colors.primary, marginBottom: 8 },
  subtitle: { color: colors.muted, marginBottom: 20 },
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

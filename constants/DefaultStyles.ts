import { StyleSheet } from "react-native";

export const DefaultStyles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#20325c",
  },
  container: {
    flex: 1,
    backgroundColor: "#20325c",
  },
  titleStyle: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#fff",
  },
  textStyle: {
    fontSize: 16,
    fontFamily: "Syne_400Regular",
    color: "#fff",
  },
  inputStyle: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 60,
    paddingHorizontal: 10,
  },
  buttonStyle: {
    width: 250,
    height: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 60,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  small?: boolean;
  error?: string;
};

const Input = ({ label, small, error, style, editable = true, ...props }: InputProps) => (
  <View style={{ flex: small ? 1 : undefined }}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput 
      style={[styles.input, !editable && styles.inputDisabled, style]} 
      editable={editable}
      {...props} 
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

export default Input;

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
});

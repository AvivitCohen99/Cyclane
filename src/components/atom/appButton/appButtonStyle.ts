import { StyleSheet } from "react-native";
import { Colors } from "../../../../assets/colors";

export const appButtonStyle = StyleSheet.create({
    button: {
        width: '80%',
        height: 50,
        borderColor: Colors.buttonBorder,
        borderWidth: 2,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.buttonBackground
    },
    text: {
        fontSize: 20,
        color: Colors.buttonBorder,
    }
})
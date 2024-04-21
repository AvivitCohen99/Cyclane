import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../assets/colors";

export const welcomeScreenStyle = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: Colors.background

    },
    titleWrapper: {
        position: 'absolute',
        top: 100
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 300,
    },
    contentWrapper: {
        justifyContent: 'space-between',
        alignItems:'center',
        width: '100%',
        flex: 0.72
    },
    buttonsWrapper: {
        gap: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 30
    }
})
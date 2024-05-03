import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../assets/colors";

export const signInScreenStyle = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
    },
    innerWrapper: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        rowGap: 30
    },
})
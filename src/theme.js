import { grey } from "@mui/material/colors";

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                // Light mode colors
                primary: {
                    main: "#16a34a", // FlowSync primary green
                },
                divider: "#10b981",
                background: {
                    default: "#ffffff",
                    paper: "#f0fdf4", // Soft green background
                },
                text: {
                    primary: grey[ 900 ],
                    secondary: grey[ 800 ],
                },
            }
            : {
                // Dark mode colors
                primary: {
                    main: "#064e3b", // Deep green for contrast
                },
                divider: "#10b981",
                background: {
                    default: "#004d40", // Dark teal
                    paper: "#00332d",
                },
                text: {
                    primary: "#ffffff",
                    secondary: grey[ 400 ],
                },
            }),
    },
});

export default getDesignTokens;

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
                    main: "#10b981", // Keep primary color green
                    light: "#34d399",
                    dark: "#059669",
                },
                divider: "#10b981",
                background: {
                    default: "#004d40",
                    paper: "#00332d",
                },
                text: {
                    primary: "#ffffff", // Pure white for primary text
                    secondary: "black", // Pure white for secondary text
                    disabled: "#94a3b8", // Lighter shade for disabled text
                },
                action: {
                    active: "#ffffff",
                    hover: "rgba(255, 255, 255, 0.08)",
                    selected: "rgba(255, 255, 255, 0.16)",
                    disabled: "#475569",
                    disabledBackground: "rgba(255, 255, 255, 0.12)",
                },
                // Add specific field values for column fields
                tableCell: {
                    color: "#ffffff" // Ensure table cell text is white
                }
            }),
    },
    components: {
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                    '& .MuiTypography-root': {
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                    },
                    '& .MuiSelect-select': {
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                    },
                    '& .MuiInputBase-input': {
                        color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'
                    }
                })
            }
        },
        MuiTableBody: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiTableRow-root': {
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)'
                                : 'rgba(0, 0, 0, 0.04)'
                        }
                    }
                })
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                })
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                })
            }
        }
    }
});

export default getDesignTokens;

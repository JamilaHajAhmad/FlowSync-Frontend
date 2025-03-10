import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material";

const PageHeading = ({ title, subtitle }) => {
    const theme = useTheme();

    return (
        <Box sx={{ textAlign: "center", my: 3 }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                    background: "linear-gradient(90deg, #064e3b, #16a34a, #10b981)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block",
                    filter: theme.palette.mode === "dark" ? "brightness(150%)" : null
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.mode === "dark" ? "white" : "#555", fontStyle: "italic", mt: 1 }}
            >
                {subtitle}
            </Typography>
        </Box>
    );
};


export default PageHeading;
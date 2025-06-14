import { Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material";

const PageHeading = ({ title, subtitle }) => {
    const theme = useTheme();

    return (
        <Box sx={{ 
            textAlign: "center", 
            my: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 }
        }}>
            <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                    color: "#064e3b",
                    display: "inline-block",
                    filter: theme.palette.mode === "dark" ? "brightness(150%)" : null,
                    fontSize: {
                        xs: '1.75rem',
                        sm: '2.25rem',
                        md: '3rem'
                    },
                    lineHeight: {
                        xs: 1.3,
                        sm: 1.4,
                        md: 1.5
                    }
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="subtitle1"
                sx={{ 
                    color: theme.palette.mode === "dark" ? "white" : "#555", 
                    fontStyle: "italic", 
                    mt: { xs: 0.5, sm: 1 },
                    fontSize: {
                        xs: '0.875rem',
                        sm: '1rem',
                        md: '1.1rem'
                    },
                    lineHeight: 1.5,
                    maxWidth: '800px',
                    mx: 'auto'
                }}
            >
                {subtitle}
            </Typography>
        </Box>
    );
};

export default PageHeading;
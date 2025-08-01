import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Typography, 
    Box, 
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Close as CloseIcon,
    HelpOutline as HelpIcon,
    PlayCircleOutline as PlayIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Timeline as LineChartIcon,
    GridOn as HeatMapIcon,
    StackedBarChart as StackedChartIcon,
    FilterAlt as FunnelIcon,
    Lightbulb as TipIcon,
    ArticleOutlined
} from '@mui/icons-material';
import { useState } from 'react';

const HelpDialog = ({ open, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const steps = [
        {
            label: 'Overview',
            icon: <PlayIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        Welcome to FlowSync Analytics! This powerful dashboard provides comprehensive insights into your team's performance and task management.
                    </Typography>
                    <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', mb: 2 }}>
                        <video
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                borderRadius: '8px'
                            }}
                            controls
                        >
                            <source src="/videos/analytics-demo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Watch this quick demo to understand how to make the most of your analytics dashboard.
                    </Typography>
                </Box>
            )
        },
        {
            label: 'Task Distribution Chart',
            icon: <BarChartIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The bar chart displays task distribution across team members, helping you:Box
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Monitor individual workload and performance
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Identify potential resource allocation issues
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Track task completion rates by team member
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 2, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                    }}>
                        <TipIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                            Hover on any bar to see detailed statistics for that team member.
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Task Status Summary',
            icon: <PieChartIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The pie chart provides a clear overview of task statuses:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Completed vs. Open tasks ratio
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Delayed and frozen task percentages
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Overall task completion efficiency
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Progress Timeline',
            icon: <LineChartIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The line chart tracks task progress over time, showing:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Monthly task creation and completion trends
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Task completion rate patterns
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Performance trajectory over time
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 2, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                    }}>
                        <TipIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                            Hover over data points to see detailed monthly statistics.
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Department Heat Map',
            icon: <HeatMapIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The heat map visualizes task distribution across departments:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Task concentration by department
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Status distribution patterns
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Workload intensity indicators
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Color intensity indicates:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Darker = Higher task concentration
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Lighter = Lower task concentration
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Daily Activity Pattern',
            icon: <StackedChartIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The stacked chart shows daily activity patterns:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Daily task volume trends
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Activity distribution patterns
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Peak activity periods
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 2, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                    }}>
                        <TipIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                            Use this to identify optimal task scheduling periods.
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Activity Flow Analysis',
            icon: <FunnelIcon color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        The funnel chart analyzes activity flow and conversions:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Task progression stages
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Conversion rates between stages
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Bottleneck identification
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Various request types and their conversion rates
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 2, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                    }}>
                        <TipIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                            Identify where tasks may be getting stuck in the workflow.
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            label: 'Reports Access',
            icon: <ArticleOutlined color="primary" />,
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        To access downloaded reports and analytics:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" paragraph>
                            • Navigate to the Reports page from the sidebar
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • All downloaded analytics reports are stored there
                        </Typography>
                        <Typography variant="body2" paragraph>
                            • Reports are organized by date and title
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 2, 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                    }}>
                        <TipIcon color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                            You can access, view, and manage all your downloaded reports from the Reports page.
                        </Typography>
                    </Box>
                </Box>
            )
        },
    ];

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile} // Make full screen on mobile
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 2 }, // Remove border radius on mobile
                    bgcolor: 'background.default',
                    height: { xs: '100%', sm: 'auto' }
                }
            }}
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: { xs: 1.5, sm: 2 }, // Adjust padding for mobile
                background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', 
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 0.5, sm: 1 }
                }}>
                    <HelpIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Analytics Dashboard Help Guide
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        color: 'inherit',
                        padding: { xs: 0.5, sm: 1 }
                    }}
                >
                    <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ 
                mt: { xs: 1, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                overflow: 'auto'
            }}>
                <Stepper 
                    activeStep={activeStep} 
                    orientation="vertical"
                    sx={{
                        '& .MuiStepLabel-root': {
                            p: { xs: 0.5, sm: 1 }
                        },
                        '& .MuiStepContent-root': {
                            ml: { xs: 1, sm: 2 },
                            py: { xs: 1, sm: 2 }
                        }
                    }}
                >
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel 
                                StepIconComponent={() => (
                                    <Box sx={{ 
                                        mr: { xs: 1, sm: 2 },
                                        '& svg': {
                                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                        }
                                    }}>
                                        {step.icon}
                                    </Box>
                                )}
                            >
                                <Typography 
                                    variant={isMobile ? "body1" : "subtitle1"}
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ 
                                    mb: { xs: 1, sm: 2 },
                                    '& .MuiTypography-body1': {
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                    },
                                    '& .MuiTypography-body2': {
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                    }
                                }}>
                                    {step.content}
                                </Box>
                                <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <div>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            size={isMobile ? "small" : "medium"}
                                            sx={{ 
                                                mt: 1, 
                                                mr: 1, 
                                                background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)'
                                            }}
                                        >
                                            {index === steps.length - 1 ? 'Finish' : 'Continue'}
                                        </Button>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            size={isMobile ? "small" : "medium"}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper 
                        square 
                        elevation={0} 
                        sx={{ 
                            p: { xs: 2, sm: 3 },
                            '& .MuiTypography-body1': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }
                        }}
                    >
                        <Typography paragraph>
                            All steps completed! You're now ready to use the Analytics dashboard effectively.
                        </Typography>
                        <Button 
                            onClick={handleReset}
                            size={isMobile ? "small" : "medium"}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Review Again
                        </Button>
                    </Paper>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default HelpDialog;
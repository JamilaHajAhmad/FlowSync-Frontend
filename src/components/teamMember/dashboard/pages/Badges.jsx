import { useState, useEffect } from 'react';
import {
    Box, Typography, Container, CircularProgress, Alert,
    Paper, Grid, Stack, Divider
} from '@mui/material';
import { motion as Motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import StarIcon from '@mui/icons-material/Star';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { green, orange, grey, blue } from '@mui/material/colors';
import { getMyKpiRank } from '../../../../services/kpiService';

const badgeLevels = {
    GOLD: {
        color: '#FFD700',
        title: 'Gold Excellence',
        maxRank: 3,
        description: 'Top 3 Performer'
    },
    SILVER: {
        color: '#C0C0C0',
        title: 'Silver Performance',
        maxRank: 10,
        description: 'Top 10 Performer'
    },
    BRONZE: {
        color: '#CD7F32',
        title: 'Bronze Achievement',
        maxRank: 20,
        description: 'Top 20 Performer'
    },
    STANDARD: {
        color: '#4CAF50',
        title: 'Growing Star',
        maxRank: Infinity,
        description: 'Keep Growing!'
    }
};

// XP calculation function
const getXp = (kpi, rank) => {
    let baseXp = Math.round(kpi * 10);
    if (rank <= badgeLevels.GOLD.maxRank) {
        baseXp += 1000;
    } else if (rank <= badgeLevels.SILVER.maxRank) {
        baseXp += 500;
    } else if (rank <= badgeLevels.BRONZE.maxRank) {
        baseXp += 200;
    }
    baseXp -= (rank - 1) * 10;
    return Math.max(baseXp, 0);
};

const getXpDesc = (xp) => {
    if (xp >= 10000) return "Legendary XP! You're a top performer and a role model for others.";
    if (xp >= 8000) return "Excellent XP! Keep up this outstanding pace.";
    if (xp >= 5000) return "Great XP! You're advancing very well.";
    if (xp >= 2000) return "Good XP! Stay consistent to reach higher levels.";
    return "Every bit counts! Keep pushing your limits to gain more XP.";
};

export default function Badges() {
    const [ badgeData, setBadgeData ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const currentYear = new Date().getFullYear();

    const getBadgeLevel = (rank) => {
        if (rank <= badgeLevels.GOLD.maxRank) return badgeLevels.GOLD;
        if (rank <= badgeLevels.SILVER.maxRank) return badgeLevels.SILVER;
        if (rank <= badgeLevels.BRONZE.maxRank) return badgeLevels.BRONZE;
        return badgeLevels.STANDARD;
    };

    const getPerformanceNote = (kpi) => {
        if (kpi >= 90) {
            return {
                color: green[ 600 ],
                icon: <StarIcon sx={{ fontSize: 36, color: green[ 600 ] }} />,
                title: "Outstanding Performance",
                desc: "You are among the top achievers in your track! Keep up the excellent work and continue to inspire your team."
            };
        } else if (kpi >= 75) {
            return {
                color: orange[ 700 ],
                icon: <TrendingUpIcon sx={{ fontSize: 36, color: orange[ 700 ] }} />,
                title: "Great Progress",
                desc: "Your performance is strong and above average for your track. Aim for the top by maintaining your momentum!"
            };
        } else {
            return {
                color: grey[ 700 ],
                icon: <EmojiObjectsIcon sx={{ fontSize: 36, color: grey[ 700 ] }} />,
                title: "Keep Growing",
                desc: "You're on your way! Focus on your goals and use the resources available to boost your performance in your track."
            };
        }
    };

    useEffect(() => {
        const fetchBadgeData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getMyKpiRank(token, currentYear);
                setBadgeData(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBadgeData();
    }, [currentYear]);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box m={2}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );

    const badgeLevel = getBadgeLevel(badgeData?.rank || Infinity);
    const note = getPerformanceNote(badgeData?.kpi || 0);
    const xp = getXp(badgeData?.kpi || 0, badgeData?.rank || Infinity);

    // Next Goal Card content
    const currentRank = badgeData?.rank;
    const nextLevel = Object.values(badgeLevels).find(level => currentRank > level.maxRank);
    let nextGoalText = "You're currently at the base level. Keep growing and your next badge will come soon!";
    if (nextLevel && nextLevel.maxRank !== Infinity) {
        const neededRank = nextLevel.maxRank;
        const rankDiff = currentRank - neededRank;
        const targetText = rankDiff > 0 ? `Move up ${rankDiff} more ${rankDiff === 1 ? 'rank' : 'ranks'}` : 'Almost there!';
        nextGoalText = `${targetText} to reach ${nextLevel.title} (Top ${neededRank}). Stay focused!`;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Grid container spacing={4} justifyContent="center">
                {/* Main Badge Section */}
                <Grid item xs={12} md={8}>
                    <Motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Paper elevation={4} sx={{
                            p: 4,
                            borderRadius: 4,
                            textAlign: 'center',
                            background: `linear-gradient(135deg, ${badgeLevel.color}22 0%, #fff 100%)`
                        }}>
                            <EmojiEventsIcon sx={{
                                fontSize: 100,
                                color: badgeLevel.color,
                                mb: 2
                            }} />
                            <Typography variant="h4" fontWeight={600} color={badgeLevel.color}>
                                {badgeLevel.title}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {badgeLevel.description}
                            </Typography>
                            <Typography variant="h2" fontWeight={700} sx={{ mt: 3 }}>
                                #{badgeData?.rank}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your Current Rank
                            </Typography>

                            <Stack direction="row" spacing={3} justifyContent="center" mt={4}>
                                <Box>
                                    <Typography variant="h6" color="text.secondary">KPI</Typography>
                                    <Typography variant="h4" fontWeight={600} color="primary">
                                        {Math.round(badgeData?.kpi)}%
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" color="text.secondary">Year</Typography>
                                    <Typography variant="h4" fontWeight={600} color="primary">
                                        {currentYear}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 4 }} />

                            {/* Progress Line */}
                            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                                {Object.entries(badgeLevels).map(([ key, level ]) => (
                                    <Paper key={key} sx={{
                                        px: 2, py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        opacity: badgeData?.rank <= level.maxRank ? 1 : 0.4
                                    }}>
                                        <WorkspacePremiumIcon sx={{ color: level.color }} />
                                        <Typography variant="body2">
                                            Top {level.maxRank === Infinity ? 'All' : level.maxRank}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    </Motion.div>
                </Grid>

                {/* Side Cards: Motivation, Next Goal, XP */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Motivation Card */}
                        <Motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Paper elevation={6} sx={{
                                p: 3,
                                borderLeft: `6px solid ${note.color}`,
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                minHeight: 120,
                            }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    {note.icon}
                                    <Typography variant="h6" ml={2} color={note.color} fontWeight={700}>
                                        {note.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    {note.desc}
                                </Typography>
                            </Paper>
                        </Motion.div>

                        {/* Next Goal Card */}
                        <Motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <Paper elevation={4} sx={{
                                p: 3,
                                borderLeft: `6px solid ${badgeLevel.color}`,
                                borderRadius: 3,
                                bgcolor: '#fafafa',
                                minHeight: 80,
                            }}>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Typography variant="h6" fontWeight={600}>
                                        🎯 Your Next Goal
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {nextGoalText}
                                </Typography>
                            </Paper>
                        </Motion.div>

                        {/* XP Card */}
                        <Motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Paper elevation={4} sx={{
                                p: 3,
                                borderLeft: `6px solid ${blue[ 600 ]}`,
                                borderRadius: 3,
                                bgcolor: '#f5faff',
                                minHeight: 80,
                            }}>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <MilitaryTechIcon sx={{ fontSize: 32, color: blue[ 600 ], mr: 1 }} />
                                    <Typography variant="h6" fontWeight={600} color={blue[ 700 ]}>
                                        XP Points
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} color={blue[ 700 ]}>
                                    {xp}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    {getXpDesc(xp)}
                                </Typography>
                            </Paper>
                        </Motion.div>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Container,
    CircularProgress,
    Alert,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { decodeToken } from '../../../../utils';

// Trophy colors
const trophyColors = {
    0: '#FFD700', // Gold
    1: '#C0C0C0', // Silver
    2: '#CD7F32', // Bronze
    3: '#4CAF50', // Green (others)
};

const podiumHeights = { 0: 320, 1: 260, 2: 220 };
const trophySizes = { 0: 60, 1: 50, 2: 40 };

export default function LeaderBoard() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const role = decodeToken(token)?.role;
                const url = role.includes('Admin')
                    ? `https://localhost:49798/api/kpi/admin/team-kpis?year=${currentYear}`
                    : `https://localhost:49798/api/kpi/leader/team-kpis?year=${currentYear}`;

                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const sorted = response.data.sort((a, b) => b.kpi - a.kpi);
                setMembers(sorted);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [currentYear]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ position: 'relative', minHeight: '100vh', pt: 6 }}>
            {/* Radiating Lines Background */}
            <Box
                sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1,
                    display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pointerEvents: 'none',
                }}
            >
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                        {[...Array(6)].map((_, i) => (
                            <linearGradient id={`rayGreen${i + 1}`} key={i} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={i}
                            x1="50%" y1="10%"
                            x2={`${50 + Math.cos((i * 360 / 12) * Math.PI / 180) * 100}%`}
                            y2={`${10 + Math.sin((i * 360 / 12) * Math.PI / 180) * 100}%`}
                            stroke={`url(#rayGreen${(i % 6) + 1})`}
                            strokeWidth="40"
                            opacity="0.6"
                        />
                    ))}
                </svg>

                {/* Year Section - Top Right */}
                <Motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        top: '30px',
                        right: '30px',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '4px solid #064e3b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 1,
                    }}
                >
                    <Typography variant="h2" sx={{ color: '#064e3b', fontWeight: 900, fontSize: '2rem', letterSpacing: 2 }}>
                        {currentYear}
                    </Typography>
                </Motion.div>
            </Box>

            {/* Podium Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '400px', gap: 2, mb: 6 }}>
                {members[1] && <Motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}><PodiumPlace member={members[1]} place={1} /></Motion.div>}
                {members[0] && <Motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }}><PodiumPlace member={members[0]} place={0} /></Motion.div>}
                {members[2] && <Motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}><PodiumPlace member={members[2]} place={2} /></Motion.div>}
            </Box>

            {/* Remaining Members */}
            <Box sx={{ px: 2 }}>
                {members.slice(3).map((member, i) => (
                    <Motion.div key={member.id} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 2, '&:hover': { transform: 'translateX(10px)', transition: '0.3s', bgcolor: 'action.hover' } }}>
                            <Typography variant="h5" sx={{ minWidth: 40, fontWeight: 800, color: 'text.secondary' }}>#{i + 4}</Typography>
                            <Avatar src={member.pictureURL} sx={{ width: 50, height: 50 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>{member.fullName}</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ color: trophyColors[3], fontWeight: 'bold' }}>{Math.round(member.kpi)}%</Typography>
                        </Paper>
                    </Motion.div>
                ))}
            </Box>
        </Container>
    );
}

const PodiumPlace = ({ member, place }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: 100, sm: 140, md: 180 } }}>
        <Motion.div animate={{ y: [0, -10, 0], rotate: [-5, 5, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
            <EmojiEventsIcon sx={{ fontSize: trophySizes[place], color: trophyColors[place], filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', mb: 1 }} />
        </Motion.div>
        <Avatar src={member.pictureURL} sx={{ width: { xs: 60, sm: 80, md: 100 }, height: { xs: 60, sm: 80, md: 100 }, border: `4px solid ${trophyColors[place]}`, mb: 2, boxShadow: 3 }} />
        <Paper sx={{ width: '100%', height: podiumHeights[place], bgcolor: 'background.paper', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, color: 'text.primary', boxShadow: 3, border: `2px solid ${trophyColors[place]}`, borderBottom: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, px: 1, textAlign: 'center', wordBreak: 'break-word' }}>{member.fullName}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, color: trophyColors[place] }}>{Math.round(member.kpi)}%</Typography>
            <Typography variant="h2" sx={{ position: 'absolute', top: 450, opacity: 0.1, fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, fontWeight: 900, color: trophyColors[place] }}>#{place + 1}</Typography>
        </Paper>
    </Box>
);

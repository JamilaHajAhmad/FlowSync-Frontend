// Common items accessible to all roles
const commonItems = [
    {
        objectID: "profile",
        title: "Profile",
        path: "/profile",
        icon: "PersonOutline",
        description: "View and edit your personal information and settings"
    },
    {
        objectID: "calendar",
        title: "Calendar",
        path: "/calendar",
        icon: "CalendarTodayOutlined",
        description: "View and manage your calendar events"
    },
    {
        objectID: "settings",
        title: "Settings",
        path: "/settings",
        icon: "SettingsOutlined",
        description: "Configure system preferences and settings"
    }
];

const teamMemberItems = [ 
    {
        objectID: "dashboard",
        title: "Dashboard",
        path: "/member-dashboard",
        icon: "DashboardOutlined",
        description: "Overview of all system activities and stats"
    },
    {
        objectID: "faq",
        title: "FAQ",
        path: "/faq",
        icon: "HelpOutline",
        description: "Frequently Asked Questions"
    },
    {
        objectID: "feedback-support",
        title: "Feedback & Support",
        path: "/feedback&support",
        icon: "FeedbackOutlined",
        description: "Provide feedback or get support"
    }
]

// Team Leader specific items
const teamLeaderItems = [
    {
        objectID: "dashboard",
        title: "Dashboard",
        path: "/leader-dashboard",
        icon: "DashboardOutlined",
        description: "Overview of all system activities and stats"
    },
    {
        objectID: "tasks",
        title: "Tasks",
        path: "/team-tasks",
        icon: "AssignmentOutlined",
        description: "Manage and track all your team tasks"
    },
    {
        objectID: "team-members",
        title: "Team Members",
        path: "/team",
        icon: "PeopleOutlined",
        description: "View and manage your team members"
    },
    {
        objectID: "analytics",
        title: "Analytics",
        path: "/analytics",
        icon: "BarChartOutlined",
        description: "View comprehensive analytics and reports"
    }
];

// Function to get search items based on role
export const getSearchItems = (role) => {
    console.log('Getting items for role:', role); // Debug log
    
    switch (role) {
        case 'Leader':
            return [...commonItems, ...teamLeaderItems];
        case 'Member':
            return [...commonItems, ...teamMemberItems];
        default:
            console.log('Falling back to common items only'); // Debug log
            return commonItems;
    }
};

// Optional: Export individual arrays if needed
export { commonItems, teamLeaderItems, teamMemberItems };
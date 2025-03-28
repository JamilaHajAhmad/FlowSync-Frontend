import { useNotifications } from "./NotificationContext";
import NotificationItem from "./NotificationItem";
import { Box } from "@mui/material";

const NotificationList = () => {
  const { notifications } = useNotifications();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} {...notification} />
      ))}
    </Box>
  );
};

export default NotificationList;
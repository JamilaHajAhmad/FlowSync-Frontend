import { Alert, Snackbar } from "@mui/material";
import { useNotifications } from "./NotificationContext";

const NotificationItem = ({ id, message, type }) => {
  const { removeNotification } = useNotifications();

  return (
    <Snackbar
      open={true}
      autoHideDuration={5000}
      onClose={() => removeNotification(id)}
    >
      <Alert onClose={() => removeNotification(id)} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationItem;
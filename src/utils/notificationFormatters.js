export const formatLoginNotification = (notification) => {
    // Extract device info and IP from message
    const messageParts = notification.message.split('with IP:');
    const deviceInfo = messageParts[0].replace('Login detected from device:', '').trim();
    const ipAddress = messageParts[1]?.trim() || 'Unknown IP';

    const browserInfo = deviceInfo.match(/Chrome\/[\d.]+|Firefox\/[\d.]+|Safari\/[\d.]+/);
    const osInfo = deviceInfo.match(/\((.*?)\)/)?.[1];
    const browser = browserInfo ? browserInfo[0].split('/')[0] : 'Unknown Browser';
    const os = osInfo || 'Unknown OS';
    const ip = ipAddress === "::1" ? "localhost" : ipAddress;

    return {
        title: "New Login Detected",
        message: `Login from ${browser} on ${os}`,
        details: `IP Address: ${ip}`,
    };
};
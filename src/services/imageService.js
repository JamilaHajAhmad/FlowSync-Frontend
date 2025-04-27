import axios from 'axios';

export const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'flowsync_preset'); // Cloudinary preset name

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dkuaxxnwz/image/upload`,
            data
        );
        return response.data.secure_url; // This URL you send to your backend
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};


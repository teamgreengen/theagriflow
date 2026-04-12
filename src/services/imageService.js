import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export const ImageService = {
  async uploadImage(file, folder = 'products') {
    if (!file) return null;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  },

  async uploadMultipleImages(files, folder = 'products') {
    const urls = await Promise.all(
      Array.from(files).map(file => this.uploadImage(file, folder))
    );
    return urls.filter(url => url !== null);
  },

  async deleteImage(imageUrl) {
    try {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  },

  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 5MB)' };
    }
    
    return { valid: true };
  }
};

export default ImageService;
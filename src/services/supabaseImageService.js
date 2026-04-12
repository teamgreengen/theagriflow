import supabase from '../config/supabase';

export const ImageService = {
  async uploadImage(file, folder = 'products') {
    if (!file) return null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async uploadMultipleImages(files, folder = 'products') {
    const urls = await Promise.all(
      Array.from(files).map(file => this.uploadImage(file, folder))
    );
    return urls.filter(url => url !== null);
  },

  async deleteImage(imageUrl) {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/');
      
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);
      
      if (error) throw error;
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
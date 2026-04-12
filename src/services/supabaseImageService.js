import supabase from '../config/supabase';

const BUCKET_NAME = 'images';

const ensureBucketExists = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880
    });
    if (error && !error.message.includes('already exists')) {
      console.warn('Bucket creation note:', error.message);
    }
  }
  
  await ensurePoliciesExist();
};

const ensurePoliciesExist = async () => {
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('polname')
    .eq('schemaname', 'storage')
    .eq('tablename', 'objects');
  
  const policyNames = policies?.map(p => p.polname) || [];
  
  if (!policyNames.includes('Public can read images')) {
    await supabase.rpc('create_storage_policy', { 
      bucket_name: BUCKET_NAME,
      policy_name: 'Public can read images',
      policy_type: 'SELECT'
    }).catch(() => {});
  }
};

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

    await ensureBucketExists();

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
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
        .from(BUCKET_NAME)
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
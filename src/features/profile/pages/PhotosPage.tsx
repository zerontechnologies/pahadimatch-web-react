import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  GripVertical,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  useGetMyPhotosQuery, 
  useUploadPhotoMutation, 
  useDeletePhotoMutation,
  useSetProfilePhotoMutation,
  useTogglePhotoPrivacyMutation,
  useReorderPhotosMutation,
  useGetPhotoRequirementsQuery
} from '@/store/api/photoApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { PHOTO_CONSTRAINTS } from '@/types';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types';

export function PhotosPage() {
  const dispatch = useAppDispatch();
  const { data: photosData, isLoading } = useGetMyPhotosQuery();
  const { data: requirements } = useGetPhotoRequirementsQuery();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadPhotoMutation();
  const [deletePhoto] = useDeletePhotoMutation();
  const [setProfilePhoto] = useSetProfilePhotoMutation();
  const [togglePhotoPrivacy] = useTogglePhotoPrivacyMutation();
  const [reorderPhotos] = useReorderPhotosMutation();

  const photos = photosData?.data || [];
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reorderedPhotos, setReorderedPhotos] = useState<Photo[]>(photos);

  // Update reordered photos when API data changes
  useEffect(() => {
    if (photos.length > 0) {
      setReorderedPhotos(photos);
    }
  }, [photos]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length >= PHOTO_CONSTRAINTS.maxPhotos) {
      dispatch(addToast({
        type: 'error',
        title: 'Photo Limit Reached',
        message: `You can only upload up to ${PHOTO_CONSTRAINTS.maxPhotos} photos`,
      }));
      return;
    }

    for (const file of acceptedFiles) {
      // Validate file size
      if (file.size > PHOTO_CONSTRAINTS.maxFileSize) {
        dispatch(addToast({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} is larger than 8MB. Please choose a smaller file.`,
        }));
        continue;
      }

      // Validate file type
      if (!PHOTO_CONSTRAINTS.allowedTypes.includes(file.type as any)) {
        dispatch(addToast({
          type: 'error',
          title: 'Invalid File Type',
          message: `${file.name} is not a valid image. Only JPG, JPEG, and PNG files are allowed.`,
        }));
        continue;
      }

      try {
        const isFirstPhoto = photos.length === 0;
        await uploadPhoto({
          file,
          isProfilePhoto: isFirstPhoto,
          isPrivate: false,
        }).unwrap();

        dispatch(addToast({
          type: 'success',
          title: 'Photo Uploaded',
          message: `${file.name} has been uploaded successfully`,
        }));
      } catch (err: any) {
        dispatch(addToast({
          type: 'error',
          title: 'Upload Failed',
          message: err?.data?.message || `Failed to upload ${file.name}`,
        }));
      }
    }
  }, [photos.length, uploadPhoto, dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: PHOTO_CONSTRAINTS.maxPhotos - photos.length,
    disabled: photos.length >= PHOTO_CONSTRAINTS.maxPhotos || isUploading,
  });

  const handleDelete = async (photoId: string) => {
    try {
      await deletePhoto(photoId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Photo Deleted',
        message: 'Photo has been deleted successfully',
      }));
      setDeleteConfirmId(null);
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.data?.message || 'Failed to delete photo',
      }));
    }
  };

  const handleSetProfilePhoto = async (photoId: string) => {
    try {
      await setProfilePhoto(photoId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Profile Photo Updated',
        message: 'Your profile photo has been updated',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.data?.message || 'Failed to set profile photo',
      }));
    }
  };

  const handleTogglePrivacy = async (photoId: string) => {
    try {
      await togglePhotoPrivacy(photoId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Privacy Updated',
        message: 'Photo privacy has been updated',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.data?.message || 'Failed to update photo privacy',
      }));
    }
  };

  const handleDragStart = (photoId: string) => {
    setDraggedPhoto(photoId);
  };

  const handleDragOver = (e: React.DragEvent, photoId: string) => {
    e.preventDefault();
    if (draggedPhoto && draggedPhoto !== photoId) {
      const draggedIndex = reorderedPhotos.findIndex((p) => p.id === draggedPhoto);
      const targetIndex = reorderedPhotos.findIndex((p) => p.id === photoId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newPhotos = [...reorderedPhotos];
        const [removed] = newPhotos.splice(draggedIndex, 1);
        newPhotos.splice(targetIndex, 0, removed);
        setReorderedPhotos(newPhotos);
      }
    }
  };

  const handleDragEnd = async () => {
    if (draggedPhoto) {
      const photoOrder = reorderedPhotos.map((p) => p.id);
      try {
        await reorderPhotos({ photoOrder }).unwrap();
        dispatch(addToast({
          type: 'success',
          title: 'Photos Reordered',
          message: 'Photo order has been saved',
        }));
      } catch (err: any) {
        dispatch(addToast({
          type: 'error',
          title: 'Reorder Failed',
          message: err?.data?.message || 'Failed to reorder photos',
        }));
        // Revert on error
        setReorderedPhotos(photos);
      }
      setDraggedPhoto(null);
    }
  };

  const sortedPhotos = [...reorderedPhotos].sort((a, b) => (a.order || 0) - (b.order || 0));
  const canUploadMore = photos.length < PHOTO_CONSTRAINTS.maxPhotos;
  const needsMorePhotos = (requirements?.data?.count || 0) < PHOTO_CONSTRAINTS.minPhotos;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary" />
          Photo Management
        </h1>
        <p className="text-text-secondary mt-1">
          Upload and manage your profile photos (Min: {PHOTO_CONSTRAINTS.minPhotos}, Max: {PHOTO_CONSTRAINTS.maxPhotos})
        </p>
      </div>

      {/* Requirements Alert */}
      {needsMorePhotos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text">
              Minimum Photos Required
            </p>
            <p className="text-xs text-text-muted mt-1">
              You need at least {PHOTO_CONSTRAINTS.minPhotos} photos. Currently you have {requirements?.data?.count || 0} photos.
            </p>
          </div>
        </motion.div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                isDragActive
                  ? 'border-primary bg-primary-50'
                  : 'border-border hover:border-primary-200 hover:bg-champagne/30'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text font-medium mb-2">
                {isDragActive ? 'Drop photos here' : 'Drag & drop photos here, or click to select'}
              </p>
              <p className="text-sm text-text-muted">
                JPG, JPEG, or PNG (max {PHOTO_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB per file)
              </p>
              <p className="text-xs text-text-muted mt-2">
                {PHOTO_CONSTRAINTS.maxPhotos - photos.length} more photos allowed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-champagne rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sortedPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {sortedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                draggable
                onDragStart={() => handleDragStart(photo.id)}
                onDragOver={(e) => handleDragOver(e, photo.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                  photo.isProfilePhoto
                    ? 'border-accent shadow-lg'
                    : 'border-border hover:border-primary-200',
                  draggedPhoto === photo.id && 'opacity-50'
                )}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 left-2 flex gap-2">
                    {photo.isProfilePhoto && (
                      <Badge variant="gold" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Profile
                      </Badge>
                    )}
                    {photo.isPrivate && (
                      <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/30">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleSetProfilePhoto(photo.id)}
                      disabled={photo.isProfilePhoto}
                    >
                      <Star className={cn('w-4 h-4', photo.isProfilePhoto && 'fill-current')} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleTogglePrivacy(photo.id)}
                    >
                      {photo.isPrivate ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteConfirmId(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute top-2 right-2">
                    <GripVertical className="w-5 h-5 text-white/70" />
                  </div>
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text font-medium mb-2">No Photos Yet</p>
            <p className="text-sm text-text-muted mb-6">
              Upload at least {PHOTO_CONSTRAINTS.minPhotos} photos to complete your profile
            </p>
            {canUploadMore && (
              <Button onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">Minimum Requirements</p>
              <p className="text-xs text-text-muted">Upload at least {PHOTO_CONSTRAINTS.minPhotos} photos (maximum {PHOTO_CONSTRAINTS.maxPhotos})</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">File Format</p>
              <p className="text-xs text-text-muted">Only JPG, JPEG, or PNG files (max {PHOTO_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB per file)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">Profile Photo</p>
              <p className="text-xs text-text-muted">Set one photo as your profile photo (shown first)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">Drag to Reorder</p>
              <p className="text-xs text-text-muted">Drag photos to change their display order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
              {photos.length - 1 < PHOTO_CONSTRAINTS.minPhotos && (
                <span className="block mt-2 text-warning">
                  Warning: You will have less than {PHOTO_CONSTRAINTS.minPhotos} photos after deletion.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-error hover:bg-error-dark"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}


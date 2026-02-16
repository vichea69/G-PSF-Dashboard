import { useEffect, useMemo, useState } from 'react';
import type { FileWithPreview } from '@/hooks/use-file-upload';
import {
  derivePostFields,
  normalizeImageUrl,
  parseId
} from '@/features/post/component/post-form-helpers';
import type {
  EditingImage,
  InitialFileMetadata,
  PostFormData
} from '@/features/post/component/post-form-types';

type UsePostFormStateParams = {
  editingPost?: any | null;
  initialActiveLanguage: 'en' | 'km';
};

type UsePostFormStateResult = {
  formData: PostFormData;
  setFormData: React.Dispatch<React.SetStateAction<PostFormData>>;
  activeLanguage: 'en' | 'km';
  setActiveLanguage: React.Dispatch<React.SetStateAction<'en' | 'km'>>;
  initialFileMetadata: InitialFileMetadata[];
  previewImages: Array<{ id: string; src: string }>;
  handleImagesChange: (files: FileWithPreview[]) => void;
};

export function usePostFormState({
  editingPost,
  initialActiveLanguage
}: UsePostFormStateParams): UsePostFormStateResult {
  const editingImages: EditingImage[] = useMemo(() => {
    if (!Array.isArray(editingPost?.images)) return [];

    return editingPost.images
      .filter((image: any) => image && typeof image === 'object')
      .map((image: any, index: number) => {
        const id = parseId(image.id);
        const key = id !== undefined ? String(id) : `existing-${index}`;

        return {
          key,
          id,
          url: normalizeImageUrl(image.url),
          sortOrder:
            typeof image.sortOrder === 'number' ? image.sortOrder : index,
          fileName:
            typeof image.fileName === 'string' && image.fileName.length > 0
              ? image.fileName
              : `Image ${index + 1}`,
          size: typeof image.size === 'number' ? image.size : 0,
          mimeType:
            typeof image.mimeType === 'string' && image.mimeType.length > 0
              ? image.mimeType
              : 'image/*'
        } as EditingImage;
      })
      .sort(
        (a: { sortOrder: number }, b: { sortOrder: number }) =>
          a.sortOrder - b.sortOrder
      );
  }, [editingPost]);

  const existingImageIdMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const image of editingImages) {
      if (typeof image.id === 'number') {
        map.set(image.key, image.id);
      }
    }
    return map;
  }, [editingImages]);

  const initialFileMetadata: InitialFileMetadata[] = useMemo(
    () =>
      editingImages.map((image) => ({
        id: image.key,
        name: image.fileName,
        size: image.size,
        type: image.mimeType,
        url: image.url
      })),
    [editingImages]
  );

  const initialFields = useMemo(
    () => derivePostFields(editingPost),
    [editingPost]
  );

  const [formData, setFormData] = useState<PostFormData>({
    title: initialFields.title,
    titleEn: initialFields.titleEn,
    titleKm: initialFields.titleKm,
    descriptionEn: initialFields.descriptionEn,
    descriptionKm: initialFields.descriptionKm,
    coverImage: initialFields.coverImage,
    document: initialFields.document,
    documentThumbnail: initialFields.documentThumbnail,
    link: initialFields.link,
    status:
      editingPost?.status === 'published' || editingPost?.status === 'draft'
        ? editingPost.status
        : 'draft',
    content: initialFields.content,
    categoryId: editingPost?.category?.id ?? editingPost?.categoryId,
    sectionId: editingPost?.section?.id ?? editingPost?.sectionId,
    pageId: editingPost?.page?.id ?? editingPost?.pageId,
    newImages: [],
    existingImageIds: editingImages
      .map((image) => image.id)
      .filter((id): id is number => typeof id === 'number'),
    removedImageIds: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>(() =>
    initialFileMetadata.map((file) => ({
      id: file.id,
      file,
      preview: file.url
    }))
  );

  const [activeLanguage, setActiveLanguage] = useState<'en' | 'km'>(
    initialActiveLanguage
  );

  useEffect(() => {
    setUploadedFiles(
      initialFileMetadata.map((file) => ({
        id: file.id,
        file,
        preview: file.url
      }))
    );

    setFormData((prev) => ({
      ...prev,
      existingImageIds: editingImages
        .map((image) => image.id)
        .filter((id): id is number => typeof id === 'number'),
      removedImageIds: []
    }));
  }, [editingImages, initialFileMetadata]);

  useEffect(() => {
    if (!editingPost) return;
    const derived = derivePostFields(editingPost);

    setFormData((prev) => ({
      ...prev,
      title: derived.title ?? prev.title,
      titleEn: derived.titleEn ?? prev.titleEn,
      titleKm: derived.titleKm ?? prev.titleKm,
      descriptionEn: derived.descriptionEn ?? prev.descriptionEn,
      descriptionKm: derived.descriptionKm ?? prev.descriptionKm,
      coverImage: derived.coverImage ?? prev.coverImage,
      document: derived.document ?? prev.document,
      documentThumbnail: derived.documentThumbnail ?? prev.documentThumbnail,
      link: derived.link ?? prev.link,
      status:
        editingPost?.status === 'published' || editingPost?.status === 'draft'
          ? editingPost.status
          : prev.status,
      content: derived.content ?? prev.content,
      categoryId:
        editingPost?.category?.id ?? editingPost?.categoryId ?? prev.categoryId,
      sectionId:
        editingPost?.section?.id ?? editingPost?.sectionId ?? prev.sectionId,
      pageId: editingPost?.page?.id ?? editingPost?.pageId ?? prev.pageId,
      newImages: []
    }));
  }, [editingPost]);

  const previewImages = useMemo(
    () =>
      uploadedFiles
        .filter((file) => typeof file.preview === 'string' && file.preview)
        .map((file) => ({
          id: file.id,
          src: normalizeImageUrl(file.preview)
        }))
        .filter((image) => image.src.length > 0),
    [uploadedFiles]
  );

  const handleImagesChange = (files: FileWithPreview[]) => {
    setUploadedFiles(files);

    setTimeout(() => {
      const newImages = files
        .filter((file) => file.file instanceof File)
        .map((file) => file.file as File);

      const keptExistingIds = files
        .map((file) => existingImageIdMap.get(file.id))
        .filter((id): id is number => typeof id === 'number');

      const removedImageIds = Array.from(existingImageIdMap.values()).filter(
        (id) => !keptExistingIds.includes(id)
      );

      setFormData((prev) => ({
        ...prev,
        newImages,
        existingImageIds: keptExistingIds,
        removedImageIds
      }));
    }, 0);
  };

  return {
    formData,
    setFormData,
    activeLanguage,
    setActiveLanguage,
    initialFileMetadata,
    previewImages,
    handleImagesChange
  };
}

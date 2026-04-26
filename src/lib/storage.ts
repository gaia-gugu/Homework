import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadMedia(
  file: File | Blob,
  path: string,
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadConversationPhoto(
  conversationId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `conversations/${conversationId}/photos/${Date.now()}.${ext}`;
  return uploadMedia(file, path);
}

export async function uploadVoiceMessage(
  conversationId: string,
  blob: Blob,
): Promise<string> {
  const path = `conversations/${conversationId}/voice/${Date.now()}.webm`;
  return uploadMedia(blob, path);
}

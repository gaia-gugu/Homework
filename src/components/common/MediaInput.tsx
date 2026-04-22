import { useRef, useState } from 'react';
import { Mic, MicOff, Image as ImageIcon, X, Send } from 'lucide-react';
import { uploadConversationPhoto, uploadVoiceMessage } from '../../lib/storage';

interface MediaInputProps {
  conversationId: string;
  onSend: (text: string, type: 'text' | 'photo' | 'voice', mediaUrl?: string) => Promise<void>;
  accentColor: string;
  placeholder?: string;
}

export function MediaInput({ conversationId, onSend, accentColor, placeholder = 'Write a message…' }: MediaInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function handleSendText() {
    if (!text.trim() || sending) return;
    setSending(true);
    try { await onSend(text.trim(), 'text'); setText(''); }
    finally { setSending(false); }
  }

  async function handleSendPhoto() {
    if (!pendingFile || sending) return;
    setSending(true); setError(null);
    try {
      const url = await uploadConversationPhoto(conversationId, pendingFile);
      await onSend(text.trim() || '[Photo]', 'photo', url);
      setText(''); setPendingFile(null); setPreviewUrl(null);
    } catch (e) {
      setError('Photo upload failed. This works once the app is deployed online.');
    } finally { setSending(false); }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setSending(true);
        try {
          const url = await uploadVoiceMessage(conversationId, blob);
          await onSend('[Voice message]', 'voice', url);
        } catch {
          setError('Voice upload failed. This works once the app is deployed online.');
        } finally { setSending(false); setRecording(false); }
      };
      mr.start();
      setRecording(true);
    } catch {
      setError('Microphone access denied. Please allow microphone in your browser settings.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  if (previewUrl && pendingFile) {
    return (
      <div className="border-t border-gray-100 p-3 bg-white">
        <div className="relative inline-block mb-2">
          <img src={previewUrl} alt="preview" className="h-24 rounded-xl object-cover" />
          <button onClick={() => { setPendingFile(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5">
            <X size={14} />
          </button>
        </div>
        <input
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Add a caption…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none mb-2 focus:border-primary-400"
        />
        <button onClick={handleSendPhoto} disabled={sending} className="w-full py-2 rounded-xl text-white font-semibold text-sm disabled:opacity-50" style={{ backgroundColor: accentColor }}>
          {sending ? 'Sending…' : 'Send Photo'}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 p-3 bg-white safe-area-bottom">
      <div className="flex items-end gap-2">
        <input type="file" ref={fileRef} accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={sending || recording} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-40 shrink-0">
          <ImageIcon size={20} />
        </button>
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          disabled={sending}
          className={`p-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-40 ${recording ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
        >
          {recording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); }}}
          placeholder={placeholder}
          rows={1}
          disabled={recording || sending}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-base outline-none resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:opacity-50 leading-snug max-h-32 overflow-y-auto"
          style={{ minHeight: 44 }}
        />
        <button
          onClick={handleSendText}
          disabled={!text.trim() || sending || recording}
          className="p-2.5 rounded-xl text-white transition-all disabled:opacity-40 shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <Send size={20} />
        </button>
      </div>
      {recording && <p className="text-xs text-red-500 text-center mt-1.5 animate-pulse">Recording… release to send</p>}
      {error && <p className="text-xs text-red-500 text-center mt-1.5">{error}</p>}
    </div>
  );
}

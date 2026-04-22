import * as XLSX from 'xlsx';
import type { Conversation, Message, AppUser } from '../types';

function formatDate(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function exportGrandparentConversations(
  grandparent: AppUser,
  conversations: Conversation[],
  messagesByConversation: Record<string, Message[]>,
) {
  const wb = XLSX.utils.book_new();
  const rows: (string | number)[][] = [];

  rows.push([`Family Stories — ${grandparent.displayName} (${grandparent.grandparentTitle ?? ''})`]);
  rows.push([`Exported on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`]);
  rows.push([]);
  rows.push(['Date', 'Grandchild', 'Topic / Question', 'Sender', 'Time', 'Message', 'Media']);

  for (const conv of conversations) {
    const messages = messagesByConversation[conv.id] ?? [];
    rows.push([]);
    rows.push([
      `── ${formatDate(conv.createdAt)}`,
      conv.grandchildName,
      conv.title,
      '', '', '', '',
    ]);
    for (const msg of messages) {
      rows.push([
        '',
        '',
        '',
        msg.senderName,
        formatTime(msg.createdAt),
        msg.type === 'text' ? msg.text : `[${msg.type.toUpperCase()}] ${msg.text}`,
        msg.mediaUrl ? msg.mediaUrl : '',
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 45 }, { wch: 16 }, { wch: 8 }, { wch: 60 }, { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, grandparent.displayName.slice(0, 31));
  return wb;
}

export function downloadWorkbook(wb: ReturnType<typeof XLSX.utils.book_new>, filename: string) {
  XLSX.writeFile(wb, filename);
}

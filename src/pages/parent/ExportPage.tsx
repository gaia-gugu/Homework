import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { getUsersByRole } from '../../lib/auth';
import { getAllConversationsOnce, getMessagesForConversation } from '../../lib/db';
import { exportGrandparentConversations, downloadWorkbook } from '../../lib/export';
import * as XLSX from 'xlsx';
import type { Message } from '../../types';

export function ExportPage() {
  const { language } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function handleExport() {
    setLoading(true);
    setStatus(language === 'zh' ? '正在获取数据…' : 'Fetching data…');
    try {
      const grandparents = await getUsersByRole('grandparent');
      const allConversations = await getAllConversationsOnce();

      const wb = XLSX.utils.book_new();

      for (const gp of grandparents) {
        setStatus(language === 'zh' ? `正在处理 ${gp.displayName} 的数据…` : `Processing ${gp.displayName}…`);
        const gpConvs = allConversations.filter(c => c.grandparentId === gp.id);
        const messagesByConv: Record<string, Message[]> = {};
        for (const conv of gpConvs) {
          messagesByConv[conv.id] = await getMessagesForConversation(conv.id);
        }
        const gpWb = exportGrandparentConversations(gp, gpConvs, messagesByConv);
        const sheetName = gp.displayName.slice(0, 31);
        const ws = gpWb.Sheets[sheetName];
        if (ws) XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      const filename = `FamilyStories_${new Date().toISOString().slice(0, 10)}.xlsx`;
      setStatus(language === 'zh' ? '正在生成文件…' : 'Generating file…');
      downloadWorkbook(wb, filename);
      setStatus(language === 'zh' ? '✓ 下载成功！' : '✓ Downloaded!');
    } catch (e) {
      setStatus(language === 'zh' ? '导出失败，请重试' : 'Export failed, please try again');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={language === 'zh' ? '导出故事' : 'Export Stories'} showBack backTo="/parent" />
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-card-lg p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Download size={30} className="text-orange-500" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">
            {language === 'zh' ? '导出所有对话' : 'Export All Conversations'}
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {language === 'zh'
              ? '将所有对话导出为 Excel 文件，每个祖父母一个工作表。包含照片链接和语音消息标注。'
              : 'Download all conversations as an Excel file. One sheet per grandparent, including photo links and voice message notes.'}
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm text-gray-600 mb-6 space-y-1">
            <p className="font-semibold text-gray-700">{language === 'zh' ? '包含内容：' : 'What\'s included:'}</p>
            <p>📋 {language === 'zh' ? '每个对话的完整问答内容' : 'Full Q&A for every conversation'}</p>
            <p>📷 {language === 'zh' ? '照片链接（可在线查看）' : 'Photo links (viewable online)'}</p>
            <p>🎙️ {language === 'zh' ? '语音消息标注' : 'Voice message annotations'}</p>
            <p>📅 {language === 'zh' ? '日期和时间戳' : 'Dates and timestamps'}</p>
          </div>
          {status && (
            <p className={`text-sm mb-4 font-medium ${status.startsWith('✓') ? 'text-green-600' : 'text-gray-500'}`}>
              {status}
            </p>
          )}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {language === 'zh' ? '下载 Excel' : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Loader2, CheckCircle2 } from 'lucide-react';
import { createFamilyUser } from '../lib/auth';
import { seedPromptsAndCategories, isSeeded } from '../lib/db';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES, SEED_PROMPTS, CHILD_COLORS, CHILD_AVATARS, GRANDPA_COLOR, GRANDMA_COLOR } from '../constants';

export function Setup() {
  const [step, setStep] = useState<'welcome' | 'running' | 'done' | 'error'>('welcome');
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  function addLog(msg: string) {
    setLog(prev => [...prev, msg]);
  }

  async function runSetup() {
    setStep('running');
    try {
      addLog('Checking if already seeded…');
      const seeded = await isSeeded();
      if (!seeded) {
        addLog('Seeding prompt categories and questions…');
        await seedPromptsAndCategories(CATEGORIES, SEED_PROMPTS as Parameters<typeof seedPromptsAndCategories>[1]);
        addLog('✓ 50 seed prompts created across 5 categories');
      } else {
        addLog('✓ Prompts already seeded, skipping');
      }

      addLog('Creating parent account (username: parent, PIN: 0000)…');
      const parent = await createFamilyUser({
        username: 'parent', displayName: 'Parent', pin: '0000',
        role: 'parent', color: '#7c3aed', avatar: '👤',
        language: 'en', createdBy: 'setup',
      });
      addLog('✓ Parent account created');

      addLog('Creating 公公 account (username: gongong, PIN: 1111)…');
      await createFamilyUser({
        username: 'gongong', displayName: '公公', pin: '1111',
        role: 'grandparent', color: GRANDPA_COLOR, avatar: '👴',
        language: 'zh', grandparentTitle: '公公', createdBy: parent.id,
      });
      addLog('✓ 公公 account created');

      addLog('Creating 婆婆 account (username: popo, PIN: 2222)…');
      await createFamilyUser({
        username: 'popo', displayName: '婆婆', pin: '2222',
        role: 'grandparent', color: GRANDMA_COLOR, avatar: '👵',
        language: 'zh', grandparentTitle: '婆婆', createdBy: parent.id,
      });
      addLog('✓ 婆婆 account created');

      const kids = [
        { username: 'child1', displayName: 'Child 1', pin: '3333' },
        { username: 'child2', displayName: 'Child 2', pin: '4444' },
        { username: 'child3', displayName: 'Child 3', pin: '5555' },
        { username: 'child4', displayName: 'Child 4', pin: '6666' },
      ];
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i];
        addLog(`Creating ${k.displayName} account (username: ${k.username}, PIN: ${k.pin})…`);
        await createFamilyUser({
          username: k.username, displayName: k.displayName, pin: k.pin,
          role: 'grandchild', color: CHILD_COLORS[i], avatar: CHILD_AVATARS[i],
          language: 'en', createdBy: parent.id,
        });
        addLog(`✓ ${k.displayName} account created`);
      }

      addLog('');
      addLog('🎉 Setup complete! Signing you in as parent…');
      setUser(parent);
      setStep('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setStep('error');
    }
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-card-lg p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Settings size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">First-Time Setup</h1>
          <p className="text-gray-500 text-sm mb-6">
            This will create default accounts for everyone and seed the 50 starter questions.
            You can rename and customise everything afterwards in the Parent admin panel.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-xs text-amber-800 mb-6 space-y-1">
            <p className="font-semibold">Default accounts:</p>
            <p>Parent — username: <strong>parent</strong>, PIN: <strong>0000</strong></p>
            <p>公公 — username: <strong>gongong</strong>, PIN: <strong>1111</strong></p>
            <p>婆婆 — username: <strong>popo</strong>, PIN: <strong>2222</strong></p>
            <p>Child 1–4 — username: child1–4, PIN: 3333–6666</p>
            <p className="text-amber-600 font-semibold mt-1">Change all PINs immediately after setup!</p>
          </div>
          <button
            onClick={runSetup}
            className="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-lg shadow-sm hover:bg-primary-700 transition-colors"
          >
            Run Setup
          </button>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-card-lg p-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-800 mb-2">All Set!</h2>
          <p className="text-gray-500 text-sm mb-6">Your family app is ready. Head to the parent dashboard to rename accounts and set proper PINs.</p>
          <button onClick={() => navigate('/parent')} className="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-lg">
            Go to Parent Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-card-lg p-8">
        {step === 'running' && <Loader2 size={28} className="text-primary-500 animate-spin mx-auto mb-4" />}
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          {step === 'error' ? '❌ Setup failed' : 'Setting up…'}
        </h2>
        <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-600 space-y-0.5 max-h-60 overflow-y-auto">
          {log.map((l, i) => <p key={i}>{l}</p>)}
        </div>
        {step === 'error' && (
          <div className="mt-4">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={() => setStep('welcome')} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

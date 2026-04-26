import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Avatar } from '../../components/common/Avatar';
import { getAllUsers, createFamilyUser, updateUserProfile, deleteUserAccount, updateUserPin, updateUsername } from '../../lib/auth';
import { updateGrandchildAppearanceInConversations } from '../../lib/db';
import type { AppUser, Role, GrandparentTitle } from '../../types';
import { CHILD_COLORS, CHILD_AVATARS, GRANDPA_COLOR, GRANDMA_COLOR, PATERNAL_GRANDMA_COLOR, COLOR_PALETTE, AVATAR_OPTIONS } from '../../constants';

const ROLE_LABELS: Record<Role, string> = {
  parent:      'Parent',
  grandparent: 'Grandparent',
  grandchild:  'Child',
};

interface EditState {
  username: string;
  displayName: string;
  color: string;
  avatar: string;
  notificationEmail: string;
  newPin: string;
  allowedGrandparentIds: string[];
  grandparentTitleOverrides: Record<string, GrandparentTitle>;
}

const TITLE_OVERRIDE_OPTIONS: GrandparentTitle[] = ['公公', '婆婆', '嫲嫲', '姥姥'];

function defaultGrandparentColor(title: '公公' | '婆婆' | '嫲嫲'): string {
  if (title === '公公') return GRANDPA_COLOR;
  if (title === '嫲嫲') return PATERNAL_GRANDMA_COLOR;
  return GRANDMA_COLOR;
}

function defaultGrandparentAvatar(title: '公公' | '婆婆' | '嫲嫲'): string {
  return title === '公公' ? '👴' : '👵';
}

export function ManageAccounts() {
  const { user, language } = useAuthStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '', displayName: '', pin: '', role: 'grandchild' as Role,
    grandparentTitle: '公公' as '公公' | '婆婆' | '嫲嫲', notificationEmail: '',
    allowedGrandparentIds: [] as string[],
    grandparentTitleOverrides: {} as Record<string, GrandparentTitle>,
  });

  const grandparentUsers = users.filter(u => u.role === 'grandparent');

  useEffect(() => { getAllUsers().then(setUsers); }, []);

  function startEdit(u: AppUser) {
    setEditingId(u.id);
    setEditState({
      username: u.username,
      displayName: u.displayName,
      color: u.color,
      avatar: u.avatar,
      notificationEmail: u.notificationEmail ?? '',
      newPin: '',
      allowedGrandparentIds: u.allowedGrandparentIds ?? [],
      grandparentTitleOverrides: u.grandparentTitleOverrides ?? {},
    });
  }

  async function saveEdit(u: AppUser) {
    if (!editState || saving) return;
    setSaving(true);
    try {
      const updates: Partial<AppUser> = {
        displayName: editState.displayName,
        color: editState.color,
        avatar: editState.avatar,
        notificationEmail: editState.notificationEmail,
      };
      if (u.role === 'grandchild') {
        updates.allowedGrandparentIds = editState.allowedGrandparentIds;
        updates.grandparentTitleOverrides = editState.grandparentTitleOverrides;
      }
      await updateUserProfile(u.id, updates);
      if (editState.username && editState.username !== u.username) {
        await updateUsername(u.id, editState.username);
        updates.username = editState.username;
      }
      if (editState.newPin && editState.newPin.length === 4) {
        await updateUserPin(u.id, editState.newPin);
      }
      if (u.role === 'grandchild' && (editState.color !== u.color || editState.avatar !== u.avatar)) {
        await updateGrandchildAppearanceInConversations(u.id, editState.color, editState.avatar);
      }
      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, ...updates } : p));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: AppUser) {
    if (!window.confirm(`Delete ${u.displayName}? This cannot be undone.`)) return;
    await deleteUserAccount(u.id);
    setUsers(prev => prev.filter(p => p.id !== u.id));
  }

  async function handleCreate() {
    if (!user || !newUser.username || !newUser.displayName || newUser.pin.length !== 4 || saving) return;
    setSaving(true);
    try {
      const color = newUser.role === 'grandparent'
        ? defaultGrandparentColor(newUser.grandparentTitle)
        : CHILD_COLORS[users.filter(u => u.role === 'grandchild').length % 4];
      const avatar = newUser.role === 'grandparent'
        ? defaultGrandparentAvatar(newUser.grandparentTitle)
        : CHILD_AVATARS[users.filter(u => u.role === 'grandchild').length % 4];
      const created = await createFamilyUser({
        username: newUser.username,
        displayName: newUser.displayName,
        pin: newUser.pin,
        role: newUser.role,
        color, avatar,
        language: 'en',
        grandparentTitle: newUser.role === 'grandparent' ? newUser.grandparentTitle : undefined,
        notificationEmail: newUser.notificationEmail || undefined,
        allowedGrandparentIds: newUser.role === 'grandchild' ? newUser.allowedGrandparentIds : undefined,
        grandparentTitleOverrides: newUser.role === 'grandchild' ? newUser.grandparentTitleOverrides : undefined,
        createdBy: user.id,
      });
      setUsers(prev => [...prev, created]);
      setShowCreate(false);
      setNewUser({
        username: '', displayName: '', pin: '', role: 'grandchild',
        grandparentTitle: '公公', notificationEmail: '',
        allowedGrandparentIds: [], grandparentTitleOverrides: {},
      });
    } finally {
      setSaving(false);
    }
  }

  const byRole = (role: Role) => users.filter(u => u.role === role);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={language === 'zh' ? '管理账户' : 'Manage Accounts'} showBack backTo="/parent" />
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-6 pb-10">

        {(['grandparent', 'grandchild', 'parent'] as Role[]).map(role => (
          <section key={role}>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{ROLE_LABELS[role]}s</h2>
            <div className="space-y-2">
              {byRole(role).map(u => (
                <div key={u.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                  {editingId === u.id && editState ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={editState.displayName || u.displayName} color={editState.color} avatar={editState.avatar} size="md" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Login username</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-400">@</span>
                            <input
                              value={editState.username}
                              onChange={e => setEditState(s => ({ ...s!, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary-400"
                            />
                          </div>
                        </div>
                      </div>
                      <input value={editState.displayName} onChange={e => setEditState(s => ({ ...s!, displayName: e.target.value }))} placeholder="Display name" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
                      <input value={editState.notificationEmail} onChange={e => setEditState(s => ({ ...s!, notificationEmail: e.target.value }))} placeholder="Notification email (optional)" type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
                      <input value={editState.newPin} onChange={e => setEditState(s => ({ ...s!, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="New PIN (4 digits, leave blank to keep)" inputMode="numeric" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />

                      {u.role === 'grandchild' && grandparentUsers.length > 0 && (
                        <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-600">Grandparents this child can message</p>
                          <p className="text-[11px] text-gray-400 -mt-1">Leave all unchecked to allow messaging every grandparent.</p>
                          {grandparentUsers.map(gp => {
                            const checked = editState.allowedGrandparentIds.includes(gp.id);
                            const overrideTitle = editState.grandparentTitleOverrides[gp.id];
                            return (
                              <div key={gp.id} className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => setEditState(s => ({
                                      ...s!,
                                      allowedGrandparentIds: checked
                                        ? s!.allowedGrandparentIds.filter(id => id !== gp.id)
                                        : [...s!.allowedGrandparentIds, gp.id],
                                    }))}
                                  />
                                  <span>{gp.grandparentTitle} <span className="text-gray-400">({gp.displayName})</span></span>
                                </label>
                                <select
                                  value={overrideTitle ?? ''}
                                  onChange={e => setEditState(s => {
                                    const next = { ...s!.grandparentTitleOverrides };
                                    if (e.target.value) next[gp.id] = e.target.value as GrandparentTitle;
                                    else delete next[gp.id];
                                    return { ...s!, grandparentTitleOverrides: next };
                                  })}
                                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                                  title="Show this grandparent under a different title for this child"
                                >
                                  <option value="">Default ({gp.grandparentTitle})</option>
                                  {TITLE_OVERRIDE_OPTIONS.map(t => (
                                    <option key={t} value={t}>Show as {t}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Colour</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {COLOR_PALETTE.map(c => (
                            <button
                              key={c}
                              onClick={() => setEditState(s => ({ ...s!, color: c }))}
                              className="w-8 h-8 rounded-full border-4 transition-all"
                              style={{ backgroundColor: c, borderColor: editState.color === c ? '#1f2937' : 'transparent' }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Avatar</p>
                        <div className="flex gap-1 flex-wrap">
                          {AVATAR_OPTIONS.map(e => (
                            <button
                              key={e}
                              onClick={() => setEditState(s => ({ ...s!, avatar: e }))}
                              className={`text-2xl p-1.5 rounded-xl transition-all ${editState.avatar === e ? 'bg-primary-100 ring-2 ring-primary-400' : 'hover:bg-gray-100'}`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveEdit(u)} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                          <Save size={15} /> {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center gap-3">
                      <Avatar name={u.displayName} color={u.color} avatar={u.avatar} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{u.displayName}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                      <button onClick={() => startEdit(u)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                        <Edit2 size={16} />
                      </button>
                      {u.id !== user?.id && (
                        <button onClick={() => handleDelete(u)} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Add new user */}
        {showCreate ? (
          <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
            <h3 className="font-bold text-gray-800">New Account</h3>
            <select value={newUser.role} onChange={e => setNewUser(s => ({ ...s, role: e.target.value as Role }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option value="grandchild">Child</option>
              <option value="grandparent">Grandparent</option>
              <option value="parent">Parent</option>
            </select>
            {newUser.role === 'grandparent' && (
              <select value={newUser.grandparentTitle} onChange={e => setNewUser(s => ({ ...s, grandparentTitle: e.target.value as '公公' | '婆婆' | '嫲嫲' }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
                <option value="公公">公公</option>
                <option value="婆婆">婆婆</option>
                <option value="嫲嫲">嫲嫲</option>
              </select>
            )}
            {newUser.role === 'grandchild' && grandparentUsers.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">Grandparents this child can message</p>
                <p className="text-[11px] text-gray-400 -mt-1">Leave all unchecked to allow messaging every grandparent.</p>
                {grandparentUsers.map(gp => {
                  const checked = newUser.allowedGrandparentIds.includes(gp.id);
                  const overrideTitle = newUser.grandparentTitleOverrides[gp.id];
                  return (
                    <div key={gp.id} className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700 flex-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setNewUser(s => ({
                            ...s,
                            allowedGrandparentIds: checked
                              ? s.allowedGrandparentIds.filter(id => id !== gp.id)
                              : [...s.allowedGrandparentIds, gp.id],
                          }))}
                        />
                        <span>{gp.grandparentTitle} <span className="text-gray-400">({gp.displayName})</span></span>
                      </label>
                      <select
                        value={overrideTitle ?? ''}
                        onChange={e => setNewUser(s => {
                          const next = { ...s.grandparentTitleOverrides };
                          if (e.target.value) next[gp.id] = e.target.value as GrandparentTitle;
                          else delete next[gp.id];
                          return { ...s, grandparentTitleOverrides: next };
                        })}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                        title="Show this grandparent under a different title for this child"
                      >
                        <option value="">Default ({gp.grandparentTitle})</option>
                        {TITLE_OVERRIDE_OPTIONS.map(t => (
                          <option key={t} value={t}>Show as {t}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
            <input value={newUser.username} onChange={e => setNewUser(s => ({ ...s, username: e.target.value.toLowerCase().replace(/\s/g, '') }))} placeholder="Login username (no spaces, e.g. emma)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
            <input value={newUser.displayName} onChange={e => setNewUser(s => ({ ...s, displayName: e.target.value }))} placeholder="Display name (e.g. Emma)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
            <input value={newUser.pin} onChange={e => setNewUser(s => ({ ...s, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="4-digit PIN" inputMode="numeric" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
            <input value={newUser.notificationEmail} onChange={e => setNewUser(s => ({ ...s, notificationEmail: e.target.value }))} placeholder="Notification email (optional)" type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={!newUser.username || !newUser.displayName || newUser.pin.length !== 4 || saving} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm disabled:opacity-50">
                {saving ? 'Creating…' : 'Create Account'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm"><X size={15} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-semibold hover:border-primary-400 hover:text-primary-600 transition-colors">
            <Plus size={18} /> {language === 'zh' ? '添加新账户' : 'Add New Account'}
          </button>
        )}
      </div>
    </div>
  );
}

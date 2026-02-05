'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

const roleOptions = ['ADMIN', 'MANAGER', 'MEMBER'] as const;

type Role = (typeof roleOptions)[number];

type UserRow = {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
};

type Props = {
  users: UserRow[];
  onUsersChange: (updater: (users: UserRow[]) => UserRow[]) => void;
};

export default function UserTable({ users, onUsersChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const startEdit = (user: UserRow) => {
    setEditingId(user.id);
    setDraftName(user.name ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName('');
  };

  const saveEdit = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draftName.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      const updated = (await response.json()) as UserRow;
      onUsersChange((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      toast.success('User updated.');
      cancelEdit();
    } catch {
      toast.error('Unable to update user.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: Role) => {
    const current = users.find((user) => user.id === userId);
    if (!current || current.role === nextRole) {
      return;
    }

    const shouldProceed = confirm(
      `Change role for ${current.email} from ${current.role} to ${nextRole}?`,
    );
    if (!shouldProceed) return;

    setUpdatingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      const updated = (await response.json()) as UserRow;
      onUsersChange((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      toast.success('Role updated.');
    } catch {
      toast.error('Unable to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Users</p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            Manage users
          </h2>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-4 pr-4">
                    {editingId === user.id ? (
                      <input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">
                        {user.name ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {user.email}
                  </td>
                  <td className="py-4 pr-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(user.id, event.target.value as Role)
                      }
                      disabled={updatingId === user.id}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-4">
                    {editingId === user.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(user.id)}
                          disabled={updatingId === user.id}
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

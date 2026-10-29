'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmDialog from '@/components/ConfirmDialog';
import { deletePost } from '@/app/posts/actions';

type PostActionsMenuProps = { id: string };

const triggerClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-gray-400 text-gray-700 hover:bg-black hover:border-black hover:text-white cursor-pointer disabled:opacity-50';

const itemClass = 'flex w-full items-center gap-3 px-4 py-2 text-left text-sm';

// Three-dots menu for a post the user owns: Edit and Delete
export default function PostActionsMenu({ id }: PostActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // While the menu is open, a click outside it or the Escape key closes it
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await deletePost(id);
      if (result.error) alert(result.error);
    });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Post actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        disabled={deleting}
        className={triggerClass}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg cursor-pointer"
        >
          <Link
            role="menuitem"
            href={`/posts/${id}/edit`}
            onClick={() => setMenuOpen(false)}
            className={`${itemClass} text-gray-800 hover:bg-gray-100`}
          >
            <FontAwesomeIcon icon={faPen} />
            Edit
          </Link>

          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
            className={`${itemClass} text-red-600 hover:bg-red-50 cursor-pointer`}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

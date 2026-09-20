import { useEffect, useRef, type ReactNode } from 'react';

/** The native modal manages background inertness, focus containment and focus return. */
export function AdminDialog({ children, labelledBy, busy, onDismiss, wide = false, returnFocusId }: {
  children: ReactNode; labelledBy: string; busy: boolean; onDismiss: () => void; wide?: boolean; returnFocusId: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!opener.current) opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement : document.getElementById(returnFocusId);
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); if (opener.current?.isConnected) opener.current.focus(); };
  }, [returnFocusId]);

  return <dialog ref={ref} tabIndex={-1} aria-labelledby={labelledBy} aria-modal="true"
    className={`admin-dialog rounded-2xl bg-white p-0 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const elements = [...event.currentTarget.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]')]
        .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); event.currentTarget.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault(); if (!busy) onDismiss(); }}>
    {children}
  </dialog>;
}

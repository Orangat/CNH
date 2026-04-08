import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';

type ToastKind = 'info' | 'success' | 'error';
interface Toast { id: number; message: string; kind: ToastKind; }

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | undefined>(undefined);

let nextId = 1;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="admin-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`admin-toast ${t.kind}`}>{t.message}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
};

export const useToast = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside ToastProvider');
  return c;
};

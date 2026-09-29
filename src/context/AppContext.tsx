import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

export type RequestItem = {
  id: string;
  type: string;
  title: string;
  address: string;
  description: string;
  date: string;
  status: 'Em análise' | 'Respondido' | 'Concluído';
};

type User = { name: string; email: string };
type AppContextValue = {
  user: User;
  setUser: (user: User) => void;
  dark: boolean;
  setDark: (value: boolean) => void;
  requests: RequestItem[];
  addRequest: (item: Omit<RequestItem, 'id' | 'date' | 'status'>) => string;
};

const AppContext = createContext<AppContextValue | null>(null);

const initialRequests: RequestItem[] = [
  { id: 'AL20240001', type: 'Solicitação', title: 'Reparo de calçada na Rua das Flores', address: 'Rua das Flores, Centro', description: 'Solicitação de reparo em trecho danificado da calçada.', date: '24 de fev. de 2026', status: 'Em análise' },
  { id: 'AL20240002', type: 'Reclamação', title: 'Iluminação pública defeituosa', address: 'Centro', description: 'Poste com iluminação defeituosa.', date: '22 de fev. de 2026', status: 'Respondido' },
];

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>({ name: 'Sabrina', email: 'sabrina@email.com' });
  const [dark, setDark] = useState(true);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);

  const addRequest = (item: Omit<RequestItem, 'id' | 'date' | 'status'>) => {
    const id = `AL${new Date().getFullYear()}${String(requests.length + 1).padStart(4, '0')}`;
    const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    setRequests(prev => [{ ...item, id, date, status: 'Em análise' }, ...prev]);
    return id;
  };

  const value = useMemo(() => ({ user, setUser, dark, setDark, requests, addRequest }), [user, dark, requests]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
  return ctx;
}

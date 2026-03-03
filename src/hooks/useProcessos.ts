import { useState, useEffect } from 'react';
import type { ProcessoData } from '../types/processo';

export function useProcessos() {
  const [data, setData] = useState<ProcessoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/processos.json')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar dados');
        return res.json();
      })
      .then((json: ProcessoData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

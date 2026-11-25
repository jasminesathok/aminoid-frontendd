import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useFetch = (path) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.get(path)
      .then(res => { if (!cancelled) { setData(res.data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [path]);

  return { data, loading, error };
};

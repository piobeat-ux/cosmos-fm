/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function useApi() {
  const initData = (window as any).Telegram?.WebApp?.initData || '';
  return axios.create({
    baseURL: API_URL,
    headers: { 'x-telegram-init-data': initData }
  });
}

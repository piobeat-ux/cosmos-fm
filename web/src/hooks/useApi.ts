/// <reference types="vite/client" />
import axios from 'axios';
import { useTelegram } from './useTelegram';

const API_URL = import.meta.env.VITE_API_URL || 'https://mgbsbxzbdwxynpqqjbio.supabase.co/functions/v1/api';

export function useApi() {
  const { initData } = useTelegram();
  return axios.create({
    baseURL: API_URL,
    headers: { 
      'x-telegram-init-data': initData,
      'Content-Type': 'application/json'
    }
  });
}
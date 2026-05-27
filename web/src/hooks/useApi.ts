/// <reference types="vite/client" />
import axios from 'axios';
import { useTelegram } from './useTelegram';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function useApi() {
  const { initData } = useTelegram();
  return axios.create({
    baseURL: API_URL,
    headers: { 'x-telegram-init-data': initData }
  });
}

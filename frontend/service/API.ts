import axios, { type AxiosInstance } from "axios";

const createAxiosInstance = (): AxiosInstance => {
  const config = useRuntimeConfig();
  return axios.create({
    baseURL: config.public.apiBaseUrl,
  });
};

export default createAxiosInstance;

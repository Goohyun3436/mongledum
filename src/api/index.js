// import { env } from "../env";
import axios from "axios";

export const serverUrl = `http://${import.meta.env.REACT_APP_SERVER_IP}:${import.meta.env.REACT_APP_SERVER_PORT}/api/`;
// export const serverUrl = `http://${env.REACT_APP_SERVER_IP}:${env.REACT_APP_SERVER_PORT}/api/`;

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response?.data?.detail === "Invalid token or expired token.") {
      alert("로그인 유효 시간이 만료되었습니다.");
      sessionStorage.clear();
      window.location.href = "/login";
      return;
    }
    return Promise.reject(error);
  },
);

async function get(params) {
  return axios.get(serverUrl + params, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

async function patch(params, data) {
  return axios.patch(serverUrl + params, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

async function post(params, data) {
  return axios.post(serverUrl + params, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

async function put(params, data) {
  return axios.put(serverUrl + params, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

async function del(params, data) {
  return axios.delete(serverUrl + params, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

async function patchWithFormData(params, data) {
  return axios.patch(serverUrl + params, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  });
}

export { get, patch, post, put, del, patchWithFormData };

import axios from "axios";

// export const url = "https://api.tan.live/api/v1/"; //main
export const url = "http://172.16.16.206:8009/api/v1/"; //local shivam

export const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  //   config.headers["Content-Type"] = "application/json";
  //   const token = localStorage.getItem("access_token");
  //   if (token) {
  //     config.headers["token"] = token;
  //   }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // toast.error(error.response.data.message);
      if (error.response.status === 401) {
        setTimeout(() => {
          // window.location.href = '/';
        }, 1000);
      }
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    return Promise.reject(error);
  }
);

// Updated methods with custom headers support
export const get = async (url, params = {}, customHeaders = {}) => {
  try {
    const response = await api.get(url, {
      params,
      headers: {
        ...customHeaders,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await api.post(url, data, {
      headers: {
        ...customHeaders,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const put = async (url, data = {}, customHeaders = {}) => {
  try {
    const response = await api.put(url, data, {
      headers: {
        ...customHeaders,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const del = async (url, customHeaders = {}) => {
  try {
    const response = await api.delete(url, {
      headers: {
        ...customHeaders,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

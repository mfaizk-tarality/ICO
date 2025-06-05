import { api, url } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const refPlanList = () => {
  return useQuery({
    queryKey: ["refPlanList"],
    queryFn: async () => {
      return api({
        url: "/ref/refPlanList",
        method: "GET",
      });
    },
    select: (data) => {
      if (data?.data?.responseCode == 200) {
        return data?.data?.result;
      }
      return [];
    },
  });
};

export const getTotalRefAmount = (address) => {
  return useQuery({
    queryKey: ["totalRefAmount"],
    queryFn: async () => {
      return api({
        url: "/ref/totalRefAmount",
        method: "GET",
        params: {
          userAddress: address,
        },
      });
    },
    select: (data) => {
      if (data?.data?.responseCode == 200) {
        return data?.data?.result;
      }
      return 0;
    },
    enabled: !!address,
  });
};

export const useTotalTokenSold = (network) => {
  return useQuery({
    queryKey: ["totalTokenSold"],
    queryFn: async () => {
      const response = await api({
        url: `${url}deposit/totalTokenSold`,
      });
      return response?.data;
    },
    select: (data) => {
      if (data?.responseCode == 200) {
        return data?.result;
      }
      return 0;
    },
  });
};

export const userTotalToken = (walletAddress, isConnected) => {
  return useQuery({
    queryKey: ["userTotalToken", isConnected, walletAddress],
    queryFn: async () => {
      const response = await api({
        url: `${url}deposit/userTotalToken`,
        method: "GET",
        params: {
          walletAddress,
        },
      });
      return response?.data;
    },
    select: (data) => {
      if (data?.responseCode == 200) {
        return data?.result;
      }
      return 0;
    },
    enabled: isConnected,
  });
};

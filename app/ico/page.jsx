"use client";
import CustomButton from "@/common_component/CustomButton";
import { useTierData } from "@/hooks/useTierData";
import {
  BNB_USDC_ADDRESS,
  BNB_USDT_ADDRESS,
  bscConfig,
  ICO_CONTRACT_ADDRESS_BNB,
  ICO_CONTRACT_ADDRESS_BNB_OLD,
} from "@/modules/ico/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatUnits, parseUnits } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useConfig,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import ICOAbi from "@/abi/ICOAbi.json";
import { erc20Abi } from "viem";
import { api, post } from "@/services/apiServices";
import { toast } from "sonner";
import {
  getTotalRefAmount,
  refPlanList,
  userTotalToken,
  useTotalTokenSold,
} from "@/modules/ico";
import { formatNice } from "coin-format";
import { handleNegativeValue, handleWheelFocusBlur } from "@/utils";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import moment from "moment";
import Faq from "@/common_component/ico/FAQ";
import Video from "@/common_component/ico/Video";

const nativeCurrencySymbol = "BNB";

const ICO = () => {
  const queryClient = useQueryClient();
  const { isConnected, address, chain } = useAccount();
  const {
    writeContractAsync,
    status,
    isPending: writeContractPending,
  } = useWriteContract();
  const config = useConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [presaleDataLoading, setPresaleDataLoading] = useState(false);
  const [presaleData, setPresaleData] = useState([]);
  const [refCode, setRefCode] = useState("");
  const [formValue, setFormValue] = useState({
    fromAmount: "",
    toAmount: "",
    currentSelectedCrypto: coinsList?.[0],
  });

  const {
    balance: selectedTokenBalance,
    loading: selectedTokenBalanceLoading,
    refetch: refetchSelectedTokenBalance,
  } = useTokenBalance({
    tokenAddress: formValue?.currentSelectedCrypto?.address || undefined,
    chainId: bscConfig?.chainId,
    userAddress: address,
  });

  const {
    data: totalTokenSold,
    isLoading: totalTokenSoldLoading,
    refetch: refetchTotalTokenSold,
  } = useTotalTokenSold();
  const {
    data: userTotalTokenData,
    isLoading: userTotalTokenDataLoading,
    refetch: refetchUserTotalTokenData,
  } = userTotalToken(address, isConnected);
  const {
    tierData,
    error: tierDataError,
    isLoading: tierDataLoading,
  } = useTierData();

  const amount = useMemo(() => {
    return formValue?.fromAmount ? parseUnits(formValue?.fromAmount, 18) : 0;
  }, [formValue?.fromAmount]);
  const { data: nativeCoinBalance } = useBalance({
    address: address,
    chainId: chain?.id,
  });

  const {
    data: minDollarAmountData,
    error: dollarAmountError,
    isLoading: dollarAmountLoading,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB,
    functionName: "minDeposit",
  });

  const minDollarAmount = useMemo(() => {
    return Number(Number(minDollarAmountData) / 1e18)?.toFixed(2);
  }, [minDollarAmountData]);

  const {
    data: tokenBalance,
    isLoading: tokenBalanceLoading,
    isError,
    error: tokenError,
  } = useReadContract({
    address: formValue?.currentSelectedCrypto?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: chain?.id,
    enabled: Boolean(address && formValue?.currentSelectedCrypto?.address),
  });

  const {
    data: presaleIDData,
    error: preSaleError,
    isError: preSaleErrorState,
    refetch: refetchPreSaleID,
    isLoading: presaleLoading,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB,
    functionName: "presaleId",
  });
  const presaleId = useMemo(() => {
    return presaleIDData ? BigInt(Number(presaleIDData)) : "";
  }, [presaleIDData]);

  const { mutateAsync: sendRefAmount } = useMutation({
    mutationFn: async ({ amount, refId, transactionHash, userAddress }) => {
      return api({
        url: "/ref/saveRefRequest",
        method: "POST",
        data: {
          amount,
          refId,
          transactionHash,
          userAddress,
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["refPlanList"] });
      queryClient.invalidateQueries({ queryKey: ["totalRefAmount"] });
      reftechRefPlans();
      totalRefAmountRefetch();
      toast.success(data?.data?.responseMessage);
    },
  });

  useEffect(() => {
    getPresaleData();
  }, [address, presaleId]);
  const getPresaleData = async () => {
    try {
      const preSaleIdManual = presaleId ? presaleId : 2;
      setPresaleDataLoading(true);
      const data = await readContract(bscConfig, {
        abi: ICOAbi,
        address: ICO_CONTRACT_ADDRESS_BNB,
        functionName: "presale",
        args: [preSaleIdManual],
      });

      setPresaleData(data);
    } catch (error) {
      console.log(error, "presaleDataError");
    } finally {
      setPresaleDataLoading(false);
    }
  };

  const { data: presaleCurrentData, refetch: refetchPresaleCurrentData } =
    useReadContract({
      abi: ICOAbi,
      address: ICO_CONTRACT_ADDRESS_BNB,
      functionName: "presale",
      args: [presaleIDData],
    });

  const presaleDataToUse = useMemo(() => {
    const data = {
      saleStartTimeInUnix: Number(presaleData?.[0]),
      saleEndTimeInUnix: Number(presaleData?.[1]),
      TANPriceInDollar: Number(presaleData?.[2]) / 1e18,
      TotalTANToSale: Number(presaleData?.[3]),
      tanExchangeToDollar: Number(presaleData?.[4]),
      TotalTANSold: Number(presaleData?.[5]),
      nextPrice: Number(presaleCurrentData?.[2]) / 1e18,
    };

    return data;
  }, [presaleData]);
  const {
    data: TANData,
    refetch: refetchTanBalance,
    isError: TanError,
    isFetched: TanDataFetched,
    isLoading: TANDataLoading,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB,
    functionName: "userDeposits",
    args: [address, presaleId],
  });
  const {
    data: TANDataOld,
    refetch: refetchTanBalanceOld,
    isError: TanErrorOld,
    isFetched: TanDataFetchedOld,
    isLoading: TANDataLoadingOld,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB_OLD,
    functionName: "userDeposits",
    args: [address, presaleId],
  });

  const {
    data: refPlans,
    isLoading: refPlanLoading,
    refetch: reftechRefPlans,
  } = refPlanList();
  const {
    data: totalRefAmount,
    isLoading: totalRefAmountLoading,
    refetch: totalRefAmountRefetch,
  } = getTotalRefAmount();

  const conversionDataToUse = useMemo(() => {
    return {
      amount: formValue?.fromAmount ? parseUnits(formValue?.fromAmount, 18) : 0,
    };
  }, [formValue?.fromAmount]);
  const {
    data: conversionData,
    refetch: refetechConversionData,
    isFetched: isCnversionRefetched,
    isLoading: conversionDataLoading,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB,
    functionName: "calculateEthToUsd",
    args: [conversionDataToUse?.amount],
  });

  const bonusAmountData = useMemo(() => {
    const usdtCheck =
      String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
        "usdt".toLowerCase() ||
      String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
        "usdc".toLowerCase();
    const amountToSend = formValue?.fromAmount
      ? usdtCheck
        ? parseUnits(formValue?.fromAmount, 18)
        : conversionData
      : 0;
    return {
      amount: amountToSend,
      isUsdtUsdc:
        String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
          "usdt".toLowerCase() ||
        String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
          "usdc".toLowerCase(),
    };
  }, [formValue, conversionData]);
  const {
    data: bonusData,
    refetch: refetchBonus,
    isFetched: bonusFetched,
    isLoading: bonusLoading,
    error,
  } = useReadContract({
    abi: ICOAbi,
    address: ICO_CONTRACT_ADDRESS_BNB,
    functionName: "calculateBonus",
    args: [presaleId, bonusAmountData?.amount],
  });

  const amountYouWillGet = useMemo(() => {
    return bonusData ? Number(bonusData?.[2]) : 0;
  }, [bonusData]);
  const bonusAmount = useMemo(() => {
    if (bonusAmountData?.isUsdtUsdc) {
      return formatUnits(bonusData ? bonusData?.[3] : 0, 18);
    }
    return formatUnits(bonusData ? bonusData?.[3] : 0, 18);
  }, [bonusData]);
  const tanBalance = useMemo(() => {
    return Number(TANData ? TANData?.[3] : 0);
  }, [TANData, TanDataFetched]);
  const currentBalance = useMemo(() => {
    if (
      String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
      String(nativeCurrencySymbol)?.toLowerCase()
    ) {
      return formatUnits(
        nativeCoinBalance?.value ? nativeCoinBalance?.value : 0,
        18
      );
    }

    return formatUnits(tokenBalance ? tokenBalance : 0, 18);
  }, [tokenBalance, nativeCoinBalance, nativeCurrencySymbol, formValue]);
  const depositToken = async () => {
    try {
      let approveHash = "";
      await refetchPreSaleID();

      if (
        String(nativeCurrencySymbol)?.toLowerCase() !=
        String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase()
      ) {
        approveHash = await writeContractAsync(
          {
            abi: erc20Abi,
            address: formValue?.currentSelectedCrypto?.address,
            functionName: "approve",
            args: [ICO_CONTRACT_ADDRESS_BNB, amount],
          },
          {
            onSuccess: handleDeposit,
          }
        );
      } else {
        handleDeposit();
      }
    } catch (error) {
      toast.error(
        String(error?.message)?.includes("User rejected")
          ? "User rejected the request."
          : ""
      );
    }
  };
  const tokenLevel = useMemo(() => {
    const currentToken = String(
      formValue?.currentSelectedCrypto?.symbol
    )?.toLowerCase();
    return currentToken == String(nativeCurrencySymbol)?.toLowerCase()
      ? 0
      : currentToken == "usdt"
      ? 1
      : currentToken == "usdc"
      ? 2
      : "";
  }, [formValue?.currentSelectedCrypto]);
  const handleDeposit = async (hash) => {
    try {
      setIsLoading(true);

      if (hash) {
        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: hash,
        });
      }

      let txhash = "";

      if (
        String(nativeCurrencySymbol)?.toLowerCase() ==
        String(formValue.currentSelectedCrypto?.symbol)?.toLowerCase()
      ) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          ICO_CONTRACT_ADDRESS_BNB,
          ICOAbi,
          signer
        );

        const tx = await contract.Deposit(presaleId, amount, tokenLevel, {
          value: amount, // Send ETH value if paymentMethod is 0 (ETH)
        });

        const receipt = await tx.wait();
        txhash = receipt?.hash;
      } else {
        const tx = await writeContractAsync({
          abi: ICOAbi,
          address: ICO_CONTRACT_ADDRESS_BNB,
          functionName: "Deposit",
          args: [presaleId, amount, tokenLevel],
        });
        txhash = tx;
      }

      const amountToSend =
        tokenLevel == 0
          ? Number(formValue?.fromAmount)
          : Number(bonusAmountData?.amount) / 1e18;

      const response = await post("deposit/saveTransactionDetails", {
        user: address,
        transactionHash: txhash,
        paymentMethod: formValue?.currentSelectedCrypto?.symbol,
        amount: amountToSend,
        network: chain?.nativeCurrency?.symbol,
        timestamp: String(moment().unix()),
        totalTokens: amountYouWillGet,
      });
      if (txhash) {
        const refPlan = refPlans?.find((data) => data.refCode == refCode);
        const refId = refPlan?.id;
        const actualValue = Number(amountYouWillGet ?? 0);
        const amountForReferal =
          Number(refPlan?.percenatge) * (actualValue / 100);

        if (amountForReferal) {
          sendRefAmount({
            amount: amountForReferal,
            refId,
            transactionHash: txhash,
            userAddress: address,
          });
        }
      }

      setTimeout(async () => {
        await refetchTanBalance();
        await refetchTotalTokenSold();
        await refetchUserTotalTokenData();
        await refetchUserTotalTokenData();
        refetchSelectedTokenBalance();
        await totalRefAmountRefetch();
        setFormValue({ ...formValue, fromAmount: "" });
      }, 5000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const teirAmountToUse = useMemo(() => {
    if (bonusAmountData?.isUsdtUsdc) {
      return Number(bonusAmountData?.amount) / 1e18;
    }
    return Number(bonusAmountData?.amount) / 1e18;
  }, [bonusAmountData]);

  const valueInDollar = useMemo(() => {
    if (
      String(formValue?.currentSelectedCrypto?.symbol)?.toLowerCase() ==
      String(nativeCurrencySymbol)?.toLowerCase()
    ) {
      return Number(conversionData) / 1e18;
    }
    return Number(formValue?.fromAmount);
  }, [formValue?.currentSelectedCrypto?.symbol, conversionData]);

  const tanBalanceFinal = useMemo(() => {
    return Number(userTotalTokenData ?? 0) + Number(totalRefAmount ?? 0);
  }, [totalRefAmount, userTotalTokenData]);

  const progressPercentage = useMemo(() => {
    return Number(
      ((Number(totalTokenSold ?? 0) + Number(totalRefAmount ?? 0)) /
        500000000) *
        100
    );
  }, [totalTokenSold, totalRefAmount]);

  const tanDetails = useMemo(() => {
    const soldTan = Number(totalTokenSold ?? 0) + Number(totalRefAmount ?? 0);
    return [
      {
        label: "Total TAN",
        value: presaleDataToUse?.TotalTANToSale
          ? formatNice(Number(presaleDataToUse?.TotalTANToSale))
          : 0,
      },
      {
        label: "Sold TAN",
        value: formatNice(soldTan || 0),
      },
      { label: "Next Price", value: "$0.0005 (+100%)" },
    ];
  }, [presaleDataToUse?.TotalTANToSale, totalTokenSold, totalRefAmount]);

  const tierProgressPercentage = useMemo(() => {
    if (tierData?.[tierData?.length - 1]?.amount <= teirAmountToUse) {
      return 100;
    }
    return 20;
  }, [tierData, teirAmountToUse]);

  return (
    <div className="md:w-full grid grid-cols-12 mx-4 md:mx-0">
      <div className="col-span-12 lg:col-start-3 lg:col-span-8 py-10 pt-20">
        <h1 className="text-xl md:text-6xl text-center font-semibold">
          Stay Ahead of Inflation with Revolutionary Blockchain Technology
        </h1>
        <p className="text-center mt-10">
          TAN: A Scalable, Secure, and Future-Ready EVM-Compatible Layer-1
          Blockchain with Inflation Protection <br /> Powered by Block Per
          Reward Proof of Stake (BPoS) Consensus
        </p>

        <div
          className="border border-stroke my-8 rounded-xl p-14 md:p-10 md:px-20"
          style={{
            background:
              "linear-gradient(148.97deg, rgba(8, 8, 8, 0.04) 0%, rgba(87, 30, 94, 0.35) 100%)",
          }}
        >
          <div className="flex justify-between ">
            <p className="font-medium text-xs md:text-lg">
              Super Seed Sale is Live
            </p>
            <p className="font-medium text-xs md:text-lg">1 TAN = $0.00025</p>
          </div>
          <div className="w-full my-20 relative ">
            <img
              src="/assets/ico/softcap.svg"
              alt="softcap"
              className="h-10 absolute -top-12 left-[calc(20%-50px)]"
            />

            <div className="absolute top-6 left-[calc(20%-40px)] flex justify-center items-center flex-col">
              <div className="w-0 h-6 border border-dashed border-white"></div>
              <p>100M TAN</p>
            </div>

            <img
              src="/assets/ico/hardcap.svg"
              alt="hardcap"
              className="h-10 absolute -top-12 left-[calc(100%-50px)]"
            />
            <div className="absolute top-6 left-[calc(100%-40px)] flex justify-center items-center flex-col">
              <div className="w-0 h-6 border border-dashed border-white"></div>
              <p className="text-nowrap">500M TAN</p>
            </div>

            <progress
              className="progress text-tanborder h-4"
              value={progressPercentage}
              max={100}
            ></progress>
          </div>
          <div className="flex w-full justify-between items-center flex-col md:flex-row">
            {tanDetails?.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`flex flex-row md:flex-col gap-2 justify-between w-full `}
                >
                  <p className="text-sm">{item.label}</p>
                  <p className="font-semibold"> {item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex pr-4">
            <div className="w-full flex gap-6">
              {coinsList?.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className={`border flex gap-1 px-4 p-2 rounded-md cursor-pointer ${
                      formValue?.currentSelectedCrypto?.symbol == item?.symbol
                        ? "bg-tanborder"
                        : "bg-transparent"
                    }`}
                    onClick={() => {
                      if (isConnected) {
                        setFormValue({
                          ...formValue,
                          currentSelectedCrypto: item,
                          fromAmount: "",
                        });
                      }
                    }}
                  >
                    <img src={item.img} alt={idx} />
                    <p>{item?.label}</p>
                  </div>
                );
              })}
            </div>
            {(isLoading ||
              presaleLoading ||
              presaleDataLoading ||
              TANDataLoading ||
              conversionDataLoading ||
              bonusLoading ||
              writeContractPending ||
              selectedTokenBalanceLoading) && (
              <span className="loading loading-infinity loading-xl"></span>
            )}
          </div>
          <div className="grid grid-cols-12 w-full gap-6 mt-8">
            <div className="col-span-12 md:col-span-6 ">
              <div className="flex justify-between">
                <p className="text-description"> You Pay</p>
                <p className="text-error text-sm">
                  {formValue?.fromAmount &&
                  Number(valueInDollar) < Number(minDollarAmount)
                    ? `Minimum $${minDollarAmount} required.`
                    : Number(currentBalance) < Number(formValue?.fromAmount)
                    ? "Amount exceed wallet balance."
                    : ""}
                </p>
              </div>
              <div className="border border-stroke  p-4 flex flex-col gap-4 rounded-xl min-h-28">
                <div className=" flex justify-between">
                  <input
                    type="text"
                    onKeyDown={handleNegativeValue}
                    onWheel={handleWheelFocusBlur}
                    disabled={!isConnected || !formValue?.currentSelectedCrypto}
                    value={formValue?.fromAmount}
                    className="text-3xl font-medium outline-0 w-full"
                    placeholder="0.00"
                    onChange={(e) => {
                      const { value } = e?.target;
                      const decimal = 3;
                      const regex = new RegExp(
                        `^(\\d*(\\.\\d{0,${decimal}})?)?$`
                      );

                      if (regex.test(value)) {
                        setFormValue({
                          ...formValue,
                          fromAmount: value,
                        });
                      }
                    }}
                  />
                  <div className="flex bg-card2 items-center justify-center gap-2 px-2 rounded-md min-w-20  min-h-10">
                    <img
                      src={
                        formValue?.currentSelectedCrypto?.img ||
                        "/assets/ico/onlyBNB.svg"
                      }
                      alt=""
                      className="h-6 object-contain"
                    />
                    <p>{formValue?.currentSelectedCrypto?.label || "BNB"}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {String(
                    formValue?.currentSelectedCrypto?.symbol
                  )?.toLowerCase() ==
                    String(nativeCurrencySymbol)?.toLowerCase() && (
                    <p className="text-xs border p-1 px-2 rounded">
                      {conversionData
                        ? `$${Number(
                            conversionData ? Number(conversionData) / 1e18 : 0
                          )?.toFixed(2)}`
                        : `$${0}`}
                    </p>
                  )}
                  <p className="text-description text-sm">
                    Balance: {formatNice(Number(selectedTokenBalance ?? 0))}{" "}
                    {formValue?.currentSelectedCrypto?.symbol || ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <p className="text-description"> You Receive</p>
              <div className="border border-stroke  p-4 flex flex-col gap-4 rounded-xl min-h-28">
                <div className=" flex justify-between">
                  <p className="text-3xl font-medium">
                    {formatNice(amountYouWillGet || 0)}
                  </p>
                  <div className="flex bg-card2 items-center justify-center gap-2 px-2 rounded-md min-w-20 min-h-10">
                    <img
                      src={"/assets/brand/onlyLogo.svg"}
                      alt=""
                      className="h-6 object-contain"
                    />
                    <p>TAN</p>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <p className="text-description text-sm">
                    Balance: {formatNice(tanBalanceFinal || 0)} TAN
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 w-full gap-6 py-10">
            <div className="col-span-12 my-10 relative">
              <div className="h-12 w-12 bg-card absolute -top-2 left-[calc(20%)] rounded-full flex items-center justify-center z-10 border-4 border-tanborder">
                <p> 0%</p>
              </div>

              <div className="h-12 w-12 bg-card absolute -top-2 left-[calc(75%)] rounded-full flex items-center justify-center z-10 border-4 border-tanborder">
                <p>25%</p>
              </div>

              <progress
                className="progress text-tanborder h-2 "
                value={tierProgressPercentage}
                max={100}
              ></progress>
            </div>
          </div>
          <div className="grid grid-cols-12 w-full gap-6 items-end">
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
              <div className="w-full flex justify-between">
                <p className="text-description text-sm">TAN Receive</p>
                <p className="text-sm">
                  {formatNice(amountYouWillGet - bonusAmount)}
                </p>
              </div>
              {Number(bonusAmountData?.amount) / 1e18 >
                Number(tierData?.[3]?.amount) && (
                <div className="w-full flex justify-between">
                  <p className="text-description text-sm">TAN Bonus</p>
                  <p className="text-sm">
                    {bonusAmount > 0 ? `+${bonusAmount}` : bonusAmount}
                  </p>
                </div>
              )}
              <div className="w-full flex justify-between">
                <p className="text-description text-sm">Total TAN Amount</p>
                <p className="text-sm">{formatNice(amountYouWillGet || 0)}</p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
              <div className="flex w-full flex-col">
                <div className="flex justify-between px-2 p-1">
                  <p className="text-red-600">
                    {refCode &&
                      !refPlans?.find((data) => data.refCode == refCode) &&
                      "Invalid ref code"}
                  </p>
                  {refPlanLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <></>
                  )}
                </div>
                <input
                  disabled={refPlanLoading}
                  type="text"
                  className="border border-description/40 border-dashed text-center rounded-lg outline-0 min-h-10 w-full"
                  placeholder="Enter Refer Code"
                  value={refCode}
                  onChange={(e) => {
                    const { value } = e?.target;
                    setRefCode(value);
                  }}
                />
              </div>

              <CustomButton
                className={"rounded-lg min-h-10"}
                clickHandler={() => {
                  if (
                    !formValue?.fromAmount ||
                    Number(formValue?.fromAmount) <= 0 ||
                    writeContractPending ||
                    Number(currentBalance) < Number(formValue?.fromAmount) ||
                    valueInDollar < minDollarAmount
                  ) {
                    return;
                  }
                  depositToken();
                }}
                isConnected={isConnected}
                isLoading={writeContractPending}
              >
                Pay Now
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 ">
        <Video />
      </div>
      <div className="col-span-12">
        <Faq />
      </div>
    </div>
  );
};

export default ICO;

const coinsList = [
  {
    label: "BNB",
    symbol: "BNB",
    img: "/assets/ico/bnb.svg",
  },
  {
    label: "USDT",
    symbol: "USDT",
    img: "/assets/ico/usdt.svg",
    address: BNB_USDT_ADDRESS,
  },
  {
    label: "USDC",
    symbol: "USDC",
    img: "/assets/ico/usdc.svg",
    address: BNB_USDC_ADDRESS,
  },
];

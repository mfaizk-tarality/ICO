import { useEffect, useState } from "react";
import ICOAbi from "@/abi/ICOAbi.json";
import { readContract } from "@wagmi/core";
import { bscConfig, ICO_CONTRACT_ADDRESS_BNB } from "@/modules/ico/config";

export const useTierData = () => {
  const [tierData, setTierData] = useState([]);
  const [error, setError] = useState(null);
  const [teir1Data, setTeir1Data] = useState([]);
  const [teir2Data, setTeir2Data] = useState([]);
  const [teir3Data, setTeir3Data] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTierDataWithoutWalletConnect = async () => {
    try {
      setIsLoading(true);
      const data = await readContract(bscConfig, {
        abi: ICOAbi,
        address: ICO_CONTRACT_ADDRESS_BNB,
        functionName: "bonusThresholds",
        args: [0],
      });
      setTeir1Data(data);
      const data1 = await readContract(bscConfig, {
        abi: ICOAbi,
        address: ICO_CONTRACT_ADDRESS_BNB,
        functionName: "bonusThresholds",
        args: [1],
      });
      setTeir2Data(data1);
      const data2 = await readContract(bscConfig, {
        abi: ICOAbi,
        address: ICO_CONTRACT_ADDRESS_BNB,
        functionName: "bonusThresholds",
        args: [2],
      });
      setTeir3Data(data2);
      setIsLoading(false);
    } catch (error) {
      console.log(error, "tierData");
      setIsLoading(false);
      setError(error);
    }
  };

  useEffect(() => {
    getTierDataWithoutWalletConnect();
  }, [ICO_CONTRACT_ADDRESS_BNB]);

  // const { data: teir1Data, error: teir1Error } = useReadContract({
  //   abi: ICOAbi,
  //   address: ICO_CONTRACT_ADDRESS,
  //   functionName: "bonusThresholds",
  //   args: [0],
  // });

  // const { data: teir2Data, error: teir2Error } = useReadContract({
  //   abi: ICOAbi,
  //   address: ICO_CONTRACT_ADDRESS,
  //   functionName: "bonusThresholds",
  //   args: [1],
  // });

  // const { data: teir3Data, error: teir3Error } = useReadContract({
  //   abi: ICOAbi,
  //   address: ICO_CONTRACT_ADDRESS,
  //   functionName: "bonusThresholds",
  //   args: [2],
  // });

  useEffect(
    () => {
      // if (teir1Error || teir2Error || teir3Error) {
      //   setError(teir1Error || teir2Error || teir3Error);
      //   return;
      // }
      if (error) {
        return;
      }

      if (teir1Data && teir2Data && teir3Data) {
        // parseInt6

        const tier0DataToUse = {
          amount: 0,
          percentage: 0,
        };

        const tier1DataToUse = {
          amount: teir1Data?.[0] ? Number(teir1Data?.[0]) / 1e18 : 0,
          percentage: teir1Data ? Number(teir1Data?.[1]) / 10 : 0,
        };
        const tier2DataToUse = {
          amount: teir2Data?.[0] ? Number(teir2Data?.[0]) / 1e18 : 0,
          percentage: teir2Data ? Number(teir2Data?.[1]) / 10 : 0,
        };
        const tier3DataToUse = {
          amount: teir3Data?.[0] ? Number(teir3Data?.[0]) / 1e18 : 0,
          percentage: teir3Data ? Number(teir3Data?.[1]) / 10 : 0,
        };

        setTierData([
          tier0DataToUse,
          tier1DataToUse,
          tier2DataToUse,
          tier3DataToUse,
        ]);
      }
    },
    //  [teir1Data, teir2Data, teir3Data, teir1Error, teir2Error, teir3Error]
    [teir1Data, teir2Data, teir3Data]
  );

  return { tierData, error, isLoading };
};

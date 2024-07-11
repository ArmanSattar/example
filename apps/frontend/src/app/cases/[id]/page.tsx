"use client";

import { CaseDetails } from "./components/CaseDetails";
import { CaseItems } from "./components/CaseItems";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { CaseCarousel } from "./components/CaseCarousel";
import { useWebSocket } from "../../context/WebSocketContext";
import { toggleDemoClicked, togglePaidSpinClicked } from "../../../store/slices/demoSlice";
import { ProvablyFair } from "./components/ProvablyFair";
import { v4 as uuidv4 } from "uuid";
import useWindowSize from "./hooks/useWindowResize";
import { Back } from "../../components/Back";
import { PreviousDrops } from "./components/PreviousDrops";
import { CaseItemRarity } from "../../types";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { CaseType } from "@solspin/types";
import { addToBalance } from "../../../store/slices/userSlice";

const generateClientSeed = async (): Promise<string> => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const exampleCase: BaseCase = {
  name: "Watson Power",
  price: 5.42,
  rarity: "Extraordinary",
  highestPrice: 123.23,
  lowestPrice: 0.98,
  tag: "Hot",
  imagePath: "/cases/dota_3.svg",
  items: [
    {
      id: "1",
      name: "Cobalt Gloves",
      wear: "Factory New",
      price: 42.42,
      rarity: CaseItemRarity.EXTROARDINARY,
      chance: 0.0001,
      rollNumbers: [0, 9],
      imagePath: "/cases/gloves.svg",
    },
    {
      id: "2",
      name: "Hyper Beast",
      wear: "Minimal Wear",
      price: 27.28,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [10, 509],
      imagePath: "/cases/ak47-pink.svg",
    },
    {
      id: "3",
      name: "Momentum",
      wear: "Well Worn",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [510, 1009],
      imagePath: "/cases/aug.svg",
    },
    {
      id: "4",
      name: "Asiimov",
      wear: "Field Tested",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.02,
      rollNumbers: [1010, 3009],
      imagePath: "/cases/ak47-orange.svg",
    },
    {
      id: "5",
      name: "Neo-Noir",
      wear: "Factory New",
      price: 123.23,
      rarity: CaseItemRarity.CLASSIFIED,
      chance: 0.04,
      rollNumbers: [3010, 7009],
      imagePath: "/cases/usp.svg",
    },
    {
      id: "6",
      name: "Graffiti",
      wear: "Battle Scarred",
      price: 42.42,
      rarity: CaseItemRarity.RESTRICTED,
      chance: 0.08,
      rollNumbers: [7010, 15009],
      imagePath: "/cases/five-seven.svg",
    },
    {
      id: "7",
      name: "Neural Net",
      wear: "Battle Scarred",
      price: 42.42,
      rarity: CaseItemRarity.MIL_SPEC,
      chance: 0.16,
      rollNumbers: [15010, 31009],
      imagePath: "/cases/gun.svg",
    },
    {
      id: "8",
      name: "Decimator",
      wear: "Field Tested",
      price: 42.42,
      rarity: CaseItemRarity.INDUSTRIAL_GRADE,
      chance: 0.32,
      rollNumbers: [31010, 63009],
      imagePath: "/cases/tec-9.svg",
    },
    {
      id: "9",
      name: "Doppler",
      wear: "Factory New",
      price: 2400.21,
      rarity: CaseItemRarity.COVERT,
      chance: 0.3699,
      rollNumbers: [63010, 99999],
      imagePath: "/cases/talon-knife.webp",
    },
  ],
  type: CaseType.NFT,
  id: "",
  itemPrefixSums: [],
};

exampleCase.items = exampleCase.items.sort((a, b) => a.chance - b.chance);

const generateCases = (numCases: number, itemWon: BaseCaseItem | null): BaseCaseItem[][] => {
  return Array.from({ length: numCases }, () =>
    Array.from({ length: 51 }, (index) => {
      if (index === 25 + 20 && itemWon) {
        return itemWon;
      }

      const roll = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99999
      const selectedItem = exampleCase.items.find(
        (item) => roll >= item.rollNumbers[0] && roll <= item.rollNumbers[1]
      );

      if (!selectedItem) {
        throw new Error("No item found for roll number: " + roll);
      }

      return { ...selectedItem, id: uuidv4() };
    })
  );
};

export default function CasePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const isDemoClicked = useSelector((state: RootState) => state.demo.demoClicked);
  const isPaidSpinClicked = useSelector((state: RootState) => state.demo.paidSpinClicked);
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const fastClicked = useSelector((state: RootState) => state.demo.fastClicked);
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState<string>("");
  const { sendMessage, connectionStatus, socket } = useWebSocket();
  const [generateSeed, setGenerateSeed] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(0);
  const dispatch = useDispatch();
  const [cases, setCases] = useState<BaseCaseItem[][]>(generateCases(numCases, null));
  const windowSize = useWindowSize();
  const [itemWon, setItemWon] = useState<BaseCaseItem | null>(null);
  const [rollValue, setRollValue] = useState<number | null>(null);
  const [serverSeed, setServerSeed] = useState<string | null>(null);
  const [previousServerSeedHash, setPreviousServerSeedHash] = useState<string | null>(null);
  const [isFirstServerSeedHash, setIsFirstServerSeedHash] = useState(true);

  const handleClientSeedChange = (newClientSeed: string) => {
    setClientSeed(newClientSeed);
  };

  useEffect(() => {
    setCases(generateCases(numCases, itemWon));
  }, [numCases, generateCases]);

  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const initializeClientSeed = async () => {
      const newClientSeed = await generateClientSeed();
      setClientSeed(newClientSeed);
    };

    initializeClientSeed();
  }, []);

  useEffect(() => {
    if (isPaidSpinClicked && animationComplete == 0) {
      console.log("Spinning cases");
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "case-spin",
            clientSeed,
            caseId: id,
          })
        );
      }
    } else if (isDemoClicked && animationComplete == 0) {
      setCases(generateCases(numCases, null));
    }
  }, [
    isPaidSpinClicked,
    animationComplete,
    numCases,
    connectionStatus,
    sendMessage,
    clientSeed,
    id,
    isDemoClicked,
  ]);

  useEffect(() => {
    if (animationComplete === numCases && (isDemoClicked || isPaidSpinClicked)) {
      if (isDemoClicked) dispatch(toggleDemoClicked());
      if (isPaidSpinClicked) {
        dispatch(togglePaidSpinClicked());
        dispatch(addToBalance(itemWon?.price || 0));
      }
      setAnimationComplete(0);
      setItemWon(null);
    }
  }, [animationComplete, numCases, isDemoClicked, dispatch, isPaidSpinClicked]);

  useEffect(() => {
    if (connectionStatus === "connected" && generateSeed) {
      sendMessage(JSON.stringify({ action: "generate-seed" }));
      setGenerateSeed(false);
    }
  }, [connectionStatus, sendMessage, generateSeed]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if ("type" in data && data["type"] == "case") {
          const message = data["message"]
          if ("server-seed-hash" in message) {
            console.log("serverseedhash", isFirstServerSeedHash);
            if (isFirstServerSeedHash) {
              setServerSeedHash(message["server-seed-hash"]);
              setIsFirstServerSeedHash(false);
            } else {
              console.log("here");
              setPreviousServerSeedHash(serverSeedHash);
              setServerSeedHash(message["server-seed-hash"]);
            }
            console.log("Server Seed Hash set:",  message["server-seed-hash"]);
          }
  
          if ("case-result" in message) {
            const { caseItem, rollValue, serverSeed } = message["case-result"];
            setItemWon(caseItem as BaseCaseItem);
            setCases(generateCases(numCases, caseItem as BaseCaseItem));
            setRollValue(rollValue as number);
            setServerSeed(serverSeed as string);
          }
        }

       
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    if (socket) {
      socket.addEventListener("message", handleMessage);
    }

    return () => {
      if (socket) {
        socket.removeEventListener("message", handleMessage);
      }
    };
  }, [socket, isFirstServerSeedHash, serverSeedHash]);

  return (
    <div className="w-full h-full flex flex-col space-y-10 py-2">
      <Back text="Back to Cases" to={""} />
      <CaseDetails {...exampleCase} />
      <ProvablyFair
        serverSeedHash={serverSeedHash || "Please Login"}
        clientSeed={clientSeed || "Generating..."}
        onClientSeedChange={handleClientSeedChange}
        rollValue={rollValue || ""}
        serverSeed={serverSeed || ""}
        previousServerSeedHash={previousServerSeedHash}
      />
      <div className="flex flex-col xl:flex-row justify-between items-center w-full xl:space-x-2 xl:space-y-0 space-y-2">
        {cases.map((items, index) => (
          <CaseCarousel
            key={index}
            items={items}
            isPaidSpinClicked={isPaidSpinClicked}
            isDemoClicked={isDemoClicked}
            itemWon={itemWon}
            isFastAnimationClicked={fastClicked}
            numCases={numCases}
            onAnimationComplete={handleAnimationComplete}
            windowSize={windowSize}
          />
        ))}
      </div>
      {<CaseItems items={exampleCase.items} activeCase={exampleCase} />}
      <PreviousDrops />
    </div>
  );
}

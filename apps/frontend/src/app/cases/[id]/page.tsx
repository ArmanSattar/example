"use client";

import { CaseDetails } from "./components/CaseDetails";
import { CaseItems } from "./components/CaseItems";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { CaseCarousel } from "./components/CaseCarousel";
import { useWebSocket } from "../../context/WebSocketContext";
import { toggleDemoClicked } from "../../../store/slices/demoSlice";
import { ProvablyFair } from "./components/ProvablyFair";
import { v4 as uuidv4 } from "uuid";
import useWindowSize from "./hooks/useWindowResize";
import { Back } from "../../components/Back";
import { PreviousDrops } from "./components/PreviousDrops";
import { CaseItemRarity, ICase, ICaseItem } from "../../types";

const generateClientSeed = async (): Promise<string> => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

let exampleCase: ICase = {
  name: "Watson Power",
  price: 5.42,
  rarity: "Extraordinary",
  highestPrice: 123.23,
  lowestPrice: 0.98,
  tag: "Hot",
  image: "/cases/dota_3.svg",
  items: [
    {
      type: "Gloves",
      name: "Cobalt Gloves",
      wear: "Factory New",
      price: 42.42,
      rarity: CaseItemRarity.EXTROARDINARY,
      chance: 0.0001,
      rollNumbers: [0, 9],
      imagePath: "/cases/gloves.svg",
    },
    {
      type: "AK-47",
      name: "Hyper Beast",
      wear: "Minimal Wear",
      price: 27.28,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [10, 509],
      imagePath: "/cases/ak47-pink.svg",
    },
    {
      type: "AUG",
      name: "Momentum",
      wear: "Well-Worn",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.005,
      rollNumbers: [510, 1009],
      imagePath: "/cases/aug.svg",
    },
    {
      type: "AK-47",
      name: "Asiimov",
      wear: "Field-Tested",
      price: 42.42,
      rarity: CaseItemRarity.COVERT,
      chance: 0.02,
      rollNumbers: [1010, 3009],
      imagePath: "/cases/ak47-orange.svg",
    },
    {
      type: "USP-S",
      name: "Neo-Noir",
      wear: "Factory New",
      price: 123.23,
      rarity: CaseItemRarity.CLASSIFIED,
      chance: 0.04,
      rollNumbers: [3010, 7009],
      imagePath: "/cases/usp.svg",
    },
    {
      type: "Five-Seven",
      name: "Graffiti",
      wear: "Battle-Scarred",
      price: 42.42,
      rarity: CaseItemRarity.RESTRICTED,
      chance: 0.08,
      rollNumbers: [7010, 15009],
      imagePath: "/cases/five-seven.svg",
    },
    {
      type: "Famas",
      name: "Neural Net",
      wear: "Battle-Scarred",
      price: 42.42,
      rarity: CaseItemRarity.MIL_SPEC,
      chance: 0.16,
      rollNumbers: [15010, 31009],
      imagePath: "/cases/gun.svg",
    },
    {
      type: "Tec-9",
      name: "Decimator",
      wear: "Field-Tested",
      price: 42.42,
      rarity: CaseItemRarity.INDUSTRIAL_GRADE,
      chance: 0.32,
      rollNumbers: [31010, 63009],
      imagePath: "/cases/tec-9.svg",
    },
    {
      type: "Talon Knife",
      name: "Doppler",
      wear: "Factory New",
      price: 2400.21,
      rarity: CaseItemRarity.COVERT,
      chance: 0.3699,
      rollNumbers: [63010, 99999],
      imagePath: "/cases/talon-knife.webp",
    },
  ],
};

exampleCase.items = exampleCase.items.sort((a, b) => a.chance - b.chance);

const generateCases = (numCases: number): ICaseItem[][] => {
  return Array.from({ length: numCases }, () =>
    Array.from({ length: 51 }, () => {
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
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const fastClicked = useSelector((state: RootState) => state.demo.fastClicked);
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState<string>("");
  const { sendMessage, connectionStatus, socket } = useWebSocket();
  const [generateSeed, setGenerateSeed] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(0);
  const dispatch = useDispatch();
  const [cases, setCases] = useState<ICaseItem[][]>(generateCases(numCases));
  const windowSize = useWindowSize();
  const [itemWon, setItemWon] = useState<ICaseItem | null>(null);

  const handleClientSeedChange = (newClientSeed: string) => {
    setClientSeed(newClientSeed);
  };

  useEffect(() => {
    setCases(generateCases(numCases));
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
    if (isDemoClicked && animationComplete == 0) {
      console.log("Spinning cases");
      setCases(generateCases(numCases));
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "case-spin",
            clientSeed,
            caseId: id,
          })
        );
      }
    }
  }, [isDemoClicked, animationComplete, numCases, connectionStatus, sendMessage, clientSeed, id]);

  useEffect(() => {
    if (animationComplete === numCases && isDemoClicked) {
      dispatch(toggleDemoClicked());
      setAnimationComplete(0);
    }
  }, [animationComplete, numCases, isDemoClicked, dispatch]);

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
        console.log("Received WebSocket message:", data);

        if ("server-seed-hash" in data) {
          setServerSeedHash(data["server-seed-hash"]);
          console.log("Server Seed Hash set:", data["server-seed-hash"]);
        }

        if ("caseRolledItem" in data) {
          setItemWon(data["caseRolledItem"] as ICaseItem);
          console.log("Spin result:", data["caseRolledItem"]);
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
  }, [socket]);

  return (
    <div className="w-full h-full flex flex-col space-y-10 py-2">
      <Back text="Back to Cases" to={""} />
      <CaseDetails {...exampleCase} />
      <ProvablyFair
        serverSeedHash={serverSeedHash || "Please Login"}
        clientSeed={clientSeed || "Generating..."}
        onClientSeedChange={handleClientSeedChange}
      />
      <div className="flex flex-col xl:flex-row justify-between items-center w-full xl:space-x-2 xl:space-y-0 space-y-2">
        {cases.map((items, index) => (
          <CaseCarousel
            key={index}
            items={items}
            isDemoClicked={isDemoClicked}
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

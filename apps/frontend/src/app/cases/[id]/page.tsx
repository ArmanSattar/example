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

interface CaseItem {
  name: string;
  price: number;
  rarity: string;
  tag: string;
  image: string;
}

const caseExample: CaseItem = {
  name: "Watson Power",
  price: 4.99,
  rarity: "Extraordinary",
  tag: "Hot",
  image: "/cases/dota_3.svg",
};

const generateClientSeed = async (): Promise<string> => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export type ICarouselItem = {
  id: string;
  name: string;
  price: number;
  rarity: string;
  imagePath: string;
};

const generateCases = (numCases: number): ICarouselItem[][] => {
  return Array.from(
    { length: numCases },
    () =>
      Array.from({ length: 51 }, () => ({
        id: uuidv4(),
        name: Math.random() < 0.5 ? "XXX" : "YYY",
        price: 4.99,
        rarity: Math.random() < 0.5 ? "Extraordinary" : "Rare",
        imagePath: Math.random() < 0.5 ? "/cases/dota_3.svg" : "/cases/gun.svg",
      })) as ICarouselItem[]
  );
};

export default function CasePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const isDemoClicked = useSelector((state: RootState) => state.demo.demoClicked);
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState<string>("");
  const { sendMessage, connectionStatus, socket } = useWebSocket();
  const [generateSeed, setGenerateSeed] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(0);
  const dispatch = useDispatch();
  const [cases, setCases] = useState<ICarouselItem[][]>(generateCases(numCases));
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

  console.log(cases);

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

        if ("spin-result" in data) {
          console.log("Spin result:", data["spin-result"]);
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
    <div className="w-full h-full flex flex-col space-y-10 p-2">
      <CaseDetails {...caseExample} />
      <ProvablyFair
        serverSeedHash={serverSeedHash || "Please Login"}
        clientSeed={clientSeed || "Generating..."}
        onClientSeedChange={handleClientSeedChange}
      />
      <div className="flex flex-col xl:flex-row justify-between items-center w-full xl:space-x-2 xl:space-y-0 space-y-2">
        {cases.map((cases, index) => (
          <CaseCarousel
            key={index}
            items={cases}
            isDemoClicked={isDemoClicked}
            numCases={numCases}
            onAnimationComplete={handleAnimationComplete}
          />
        ))}
      </div>
      <CaseItems />
      {/*<PreviousDrops />*/}
    </div>
  );
}

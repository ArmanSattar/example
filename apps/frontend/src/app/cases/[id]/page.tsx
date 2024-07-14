"use client";

import { CaseDetails } from "./components/CaseDetails";
import { CaseItems } from "./components/CaseItems";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { CaseCarousel } from "./components/CaseCarousel";
import { useWebSocket } from "../../context/WebSocketContext";
import {
  toggleDemoClicked,
  togglePaidSpinClicked,
  toggleRarityInfoPopup,
} from "../../../store/slices/demoSlice";
import { ProvablyFair } from "./components/ProvablyFair";
import { v4 as uuidv4 } from "uuid";
import useWindowSize from "./hooks/useWindowResize";
import { Back } from "../../components/Back";
import { PreviousDrops } from "./components/PreviousDrops";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { SpinResponse } from "@solspin/orchestration-types";
import { addToBalance } from "../../../store/slices/userSlice";
import { useFetchCase } from "./hooks/useFetchCase";
import { toast } from "sonner";
import { SoundToggle } from "./components/SoundToggle";

const generateClientSeed = async (): Promise<string> => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const generateCases = (
  numCases: number,
  itemWon: BaseCaseItem | null,
  baseCase: BaseCase | undefined
): BaseCaseItem[][] => {
  if (!baseCase) {
    return [];
  }
  return Array.from({ length: numCases }, () =>
    Array.from({ length: 51 }, (_, index) => {
      if (index === 25 + 20 && itemWon) {
        return itemWon;
      }

      const roll = Math.floor(Math.random() * 100000); // Generate a random number between 0 and 99999
      const selectedItem = baseCase.items.find(
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
  const caseId = params.id;
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
  const [cases, setCases] = useState<BaseCaseItem[][]>([]);
  const windowSize = useWindowSize();
  const [itemWon, setItemWon] = useState<BaseCaseItem | null>(null);
  const [rollValue, setRollValue] = useState<string | null>(null);
  const [serverSeed, setServerSeed] = useState<string | null>(null);
  const [previousServerSeedHash, setPreviousServerSeedHash] = useState<string | null>(null);
  const [isFirstServerSeedHash, setIsFirstServerSeedHash] = useState(true);
  const { data: caseInfo, isLoading, isError, error } = useFetchCase(caseId);
  const caseData = caseInfo as BaseCase;

  const handleClientSeedChange = (newClientSeed: string) => {
    setClientSeed(newClientSeed);
  };

  useEffect(() => {
    if (caseData) {
      console.log("Generating cases");
      setCases(generateCases(numCases, null, caseData));
    }
  }, [numCases, caseData]);

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
    if (caseData && isPaidSpinClicked && animationComplete == 0) {
      console.log("Spinning cases");
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "case-spin",
            clientSeed,
            caseId: caseData.id,
            spins: numCases,
          })
        );
      }
    } else if (isDemoClicked && animationComplete == 0) {
      setCases(generateCases(numCases, null, caseData));
    }
  }, [
    isPaidSpinClicked,
    animationComplete,
    numCases,
    connectionStatus,
    sendMessage,
    clientSeed,
    isDemoClicked,
    caseData,
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

        if (caseData && "type" in data && data["type"] == "case") {
          const message = data["message"];
          if ("server-seed-hash" in message) {
            console.log("serverseedhash", isFirstServerSeedHash);
            if (isFirstServerSeedHash) {
              setServerSeedHash(message["server-seed-hash"]);
              setIsFirstServerSeedHash(false);
            } else {
              setPreviousServerSeedHash(serverSeedHash);
              setServerSeedHash(message["server-seed-hash"]);
            }
            console.log("Server Seed Hash set:", message["server-seed-hash"]);
          }

          if ("case-results" in message) {
            const spinResult: SpinResponse = message["case-results"];
            const { caseItems, serverSeed } = spinResult;
            console.log(caseItems, serverSeed);

            // TODO: Caseitems is the array of CaseItem. Make it work with multiple spins
            const caseItemWon = caseItems[0].caseItem as BaseCaseItem;
            setItemWon(caseItemWon);
            setCases(generateCases(numCases, caseItemWon, caseData));
            setRollValue(rollValue);
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
  }, [socket, isFirstServerSeedHash, serverSeedHash, caseData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || error) {
    toast.error(`Failed to fetch case data`);
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col space-y-10 py-2">
      <Back text="Back to Cases" to={""} />
      <CaseDetails {...caseData} numberOfItems={caseData.items.length} />
      <div className="w-full flex space-x-4 items-center justify-start">
        <ProvablyFair
          serverSeedHash={serverSeedHash || "Please Login"}
          clientSeed={clientSeed || "Generating..."}
          onClientSeedChange={handleClientSeedChange}
          rollValue={rollValue}
          serverSeed={serverSeed || ""}
          previousServerSeedHash={previousServerSeedHash}
        />
        <SoundToggle />
        <span
          onClick={() => dispatch(toggleRarityInfoPopup())}
          className="text-white hover:cursor-pointer"
        >
          Rarity Info
        </span>
      </div>
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
      {<CaseItems items={caseData.items} />}
      <PreviousDrops />
    </div>
  );
}

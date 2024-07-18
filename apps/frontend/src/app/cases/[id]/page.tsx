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
import useWindowSize from "./hooks/useWindowResize";
import { Back } from "../../components/Back";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import { SpinResponse } from "@solspin/orchestration-types";
import { addToBalance } from "../../../store/slices/userSlice";
import { useFetchCase } from "./hooks/useFetchCase";
import { toast } from "sonner";
import { SoundToggle } from "./components/SoundToggle";
import { generateCases, generateClientSeed } from "./utils";
import LoadingOverlay from "../../components/LoadingOverlay";
import { PreviousDrops } from "./components/PreviousDrops";

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
  const [itemsWon, setItemsWon] = useState<BaseCaseItem[] | null>(null);
  const [rollValues, setRollValues] = useState<string[]>([]);
  const [serverSeed, setServerSeed] = useState<string | null>(null);
  const [previousServerSeedHash, setPreviousServerSeedHash] = useState<string | null>(null);
  const [isFirstServerSeedHash, setIsFirstServerSeedHash] = useState(true);
  const startMiddleItem = useSelector((state: RootState) => state.caseCarousel.startMiddleItem);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkipAnimationClicked, setisSkipAnimationClicked] = useState(false);
  const { data: caseInfo, isLoading: isCaseInfoLoading, isError, error } = useFetchCase(caseId);
  const caseData = caseInfo as BaseCase;
  const [hasBeenRolled, setHasBeenRolled] = useState<boolean>(false);
  const [childComponentsLoaded, setChildComponentsLoaded] = useState({
    caseDetails: false,
  });

  const handleClientSeedChange = (newClientSeed: string) => {
    setClientSeed(newClientSeed);
  };

  const handleChildLoaded = useCallback((componentName: string) => {
    console.log("Component loaded:", componentName);
    setChildComponentsLoaded((prev) => ({ ...prev, [componentName]: true }));
  }, []);

  useEffect(() => {
    if (!isCaseInfoLoading && !isError && Object.values(childComponentsLoaded).every(Boolean)) {
      setIsLoading(false);
    }
  }, [isCaseInfoLoading, isError, childComponentsLoaded]);

  useEffect(() => {
    if (caseData && cases.length < numCases) {
      setCases(generateCases(numCases, null, caseData, startMiddleItem, cases));
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
      setCases(generateCases(numCases, null, caseData, startMiddleItem));
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
      if (isDemoClicked) {
        dispatch(toggleDemoClicked());
      }
      if (isPaidSpinClicked) {
        dispatch(togglePaidSpinClicked());
        const amount = itemsWon?.reduce((sum, item) => sum + item.price, 0) || 0;
        dispatch(addToBalance(amount));
      }
      if (isSkipAnimationClicked) setisSkipAnimationClicked(false);
      setAnimationComplete(0);
      setItemsWon(null);
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
            console.log("Case items won", caseItems);

            if (!caseItems) {
              toast.error("Error parsing WebSocket message: No case items found");
              console.error("Error parsing WebSocket message: No case item");
              return;
            }

            const caseItemsWon = caseItems.map((item) => item.rewardItem as BaseCaseItem);

            if (caseItemsWon.length !== numCases) {
              toast.error("Error parsing WebSocket message: Incorrect number of case items");
              console.error("Error parsing WebSocket message: Incorrect number of case items");
              return;
            }

            const newCases = generateCases(numCases, caseItemsWon, caseData);
            const generatedRollValues = caseItems.map((item) => item.rollValue.toString());
            setCases(newCases);
            setItemsWon(caseItemsWon);
            setRollValues(generatedRollValues);
            setServerSeed(serverSeed as string);
            setHasBeenRolled(true);
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
  }, [socket, isFirstServerSeedHash, serverSeedHash, caseData, numCases]);

  if (isError || error) {
    toast.error(`Failed to fetch case data`);
    return null;
  }
  console.log(isPaidSpinClicked, isDemoClicked);
  return (
    <div className="w-full h-full flex flex-col gap-10 py-2">
      <LoadingOverlay isLoading={isLoading} />
      {caseData && (
        <>
          <Back text="Back to Cases" to={""} />
          <CaseDetails
            {...caseData}
            numberOfItems={caseData.items.length}
            onLoaded={() => handleChildLoaded("caseDetails")}
          />
          <div className="w-full flex space-x-4 items-center justify-start">
            <ProvablyFair
              serverSeedHash={serverSeedHash || "Please Login"}
              clientSeed={clientSeed || "Generating..."}
              onClientSeedChange={handleClientSeedChange}
              rollValues={rollValues}
              serverSeed={serverSeed || ""}
              previousServerSeedHash={previousServerSeedHash}
              hasRolled={hasBeenRolled}
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
            {Array.from({ length: numCases }).map((_, i) =>
              cases[i] ? (
                <CaseCarousel
                  key={i}
                  items={cases[i]}
                  isSpinClicked={isDemoClicked || isPaidSpinClicked}
                  isFastAnimationClicked={fastClicked}
                  numCases={numCases}
                  onAnimationComplete={handleAnimationComplete}
                  windowSize={windowSize}
                  skipAnimation={isSkipAnimationClicked}
                />
              ) : (
                <div
                  key={i}
                  className="w-full h-[310px] bg-gray-800 animate-pulse rounded-md"
                ></div>
              )
            )}
          </div>
          {(isDemoClicked || isPaidSpinClicked) && (
            <div className={"w-full flex justify-center items-center"}>
              <button
                className={"py-2 px-4 rounded-md w-max bg-gray-700 text-white"}
                onClick={() => {
                  if (!isSkipAnimationClicked) {
                    setisSkipAnimationClicked(true);
                  }
                }}
              >
                Skip Animation
              </button>
            </div>
          )}
          <CaseItems items={caseData.items} />
          <PreviousDrops />
        </>
      )}
    </div>
  );
}

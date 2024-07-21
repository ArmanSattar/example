import { CaseCarousel } from "./CaseCarousel";
import React, { useCallback, useEffect, useState } from "react";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import useWindowSize from "../hooks/useWindowResize";
import { ProvablyFair } from "./ProvablyFair";
import {
  setNumCases,
  toggleDemoClicked,
  toggleFastClicked,
  togglePaidSpinClicked,
  toggleRarityInfoPopup,
} from "../../../../store/slices/demoSlice";
import { useDispatch, useSelector } from "react-redux";
import { addToBalance } from "../../../../store/slices/userSlice";
import { RootState } from "../../../../store";
import { SoundToggle } from "./SoundToggle";
import { generateCases, generateClientSeed } from "../utils";
import { SpinResponse } from "@solspin/orchestration-types";
import { toast } from "sonner";
import { useWebSocket } from "../../../context/WebSocketContext";
import { useAuth } from "../../../context/AuthContext";

interface CarouselSectionProps {
  caseData: BaseCase;
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({ caseData }) => {
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
  const [isSkipAnimationClicked, setisSkipAnimationClicked] = useState(false);
  const [hasBeenRolled, setHasBeenRolled] = useState<boolean>(false);
  const { user } = useAuth();
  const balance = useSelector((state: RootState) => state.user.balance);
  const price = caseData.price;
  const spinClicked = isDemoClicked || isPaidSpinClicked;

  const handleClientSeedChange = (newClientSeed: string) => {
    setClientSeed(newClientSeed);
  };

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

  return (
    <div
      className={
        "flex flex-col p-4 space-y-4 justify-between w-full items-center rounded-lg main-element"
      }
    >
      <ProvablyFair
        serverSeedHash={serverSeedHash || "Please Login"}
        clientSeed={clientSeed || "Generating..."}
        onClientSeedChange={handleClientSeedChange}
        rollValues={rollValues}
        serverSeed={serverSeed || ""}
        previousServerSeedHash={previousServerSeedHash}
        hasRolled={hasBeenRolled}
      />
      <div className="flex flex-col xl:flex-row justify-between items-center w-full xl:space-x-2 xl:space-y-0 space-y-4">
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
            <div key={i} className="w-full h-[310px] bg-gray-800 animate-pulse rounded-md"></div>
          )
        )}
      </div>
      <div className={`relative flex justify-between items-center gap-2 w-full`}>
        <div className={`flex space-x-2 justify-start items-center`}>
          {Array.from({ length: 4 }, (_, index) => (
            <button
              key={index}
              className={`border-[1.5px] border-purple-500 bg-purple-500 bg-opacity-20 group hover:bg-opacity-30 rounded-md min-w-[48px] sm:flex-grow-0 flex-grow h-12 p-2 ${
                index + 1 === numCases ? "!bg-opacity-100" : ""
              }`}
              onClick={() => !spinClicked && dispatch(setNumCases(index + 1))}
              disabled={spinClicked}
            >
              <span
                className={`text-gray-300 group-hover:text-white ${
                  index + 1 === numCases ? "text-white" : ""
                }`}
              >
                {index + 1}
              </span>
            </button>
          ))}
        </div>
        <div
          className={
            "absolute bottom-0 mx-auto inset-x-0 flex justify-center items-center w-max gap-x-2"
          }
        >
          {isDemoClicked || isPaidSpinClicked ? (
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
          ) : (
            <>
              <button
                className={`flex flex-[2] sm:flex-grow-0 bg-green-500 rounded-md h-12 p-4 space-x-1 justify-center items-center ${
                  spinClicked ? "opacity-50 cursor-not-allowed" : ""
                } ${user ? "" : "hidden"}`}
                onClick={() => {
                  if (!spinClicked && balance >= price * numCases) {
                    dispatch(togglePaidSpinClicked());
                    dispatch(addToBalance(-price * numCases));
                  }
                }}
                disabled={spinClicked}
              >
                <span className="text-white font-semibold whitespace-nowrap">
                  Open {numCases} Case{numCases > 1 ? "s" : ""}
                </span>
                <span className="hidden sm:block text-white font-semibold text-sm">·</span>
                <span className="text-white font-semibold whitespace-nowrap">
                  ${Math.round(price * numCases * 100) / 100}
                </span>
              </button>
              <button
                className={`flex flex-1 sm:flex-grow-0 justify-center items-center bg-custom_gray rounded-md h-12 p-3 ${
                  spinClicked ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!isDemoClicked) {
                    dispatch(toggleDemoClicked());
                  }
                }}
                disabled={spinClicked}
              >
                <span className="text-white">Demo</span>
              </button>
              <button
                className={`flex flex-1 sm:flex-grow-0 justify-center items-center bg-custom_gray rounded-md h-12 p-3 space-x-2 ${
                  spinClicked ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!spinClicked) {
                    dispatch(toggleFastClicked());
                  }
                }}
                disabled={spinClicked}
              >
                <div
                  className={`rounded-full w-2 h-2 ${fastClicked ? "bg-green-500" : "bg-red-700"}`}
                ></div>
                <span className="text-white">Quick</span>
              </button>
            </>
          )}
        </div>
        <div className={"flex space-x-4 justify-end items-center"}>
          <SoundToggle />
          <span
            onClick={() => dispatch(toggleRarityInfoPopup())}
            className="text-white hover:cursor-pointer"
          >
            Rarity Info
          </span>
        </div>
      </div>
    </div>
  );
};

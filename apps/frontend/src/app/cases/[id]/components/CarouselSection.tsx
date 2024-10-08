import { CaseCarousel } from "./CaseCarousel";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";
import useWindowSize from "../hooks/useWindowResize";
import { toggleDemoClicked, togglePaidSpinClicked } from "../../../../store/slices/demoSlice";
import { useDispatch, useSelector } from "react-redux";
import { addToBalance } from "../../../../store/slices/userSlice";
import { RootState } from "../../../../store";
import { generateCases, generateClientSeed } from "../utils";
import { SpinResponse } from "@solspin/orchestration-types";
import { toast } from "sonner";
import { useWebSocket } from "../../../context/WebSocketContext";
import { ProvablyFair } from "./ProvablyFair";
import { CarouselButtonsSubSection } from "./CarouselButtonsSubSection";
import { SoundToggle } from "./SoundToggle";
import { useQueryClient } from "@tanstack/react-query";

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
  const spinClicked = useMemo(
    () => isDemoClicked || isPaidSpinClicked,
    [isDemoClicked, isPaidSpinClicked]
  );
  const queryClient = useQueryClient();

  const handleClientSeedChange = useCallback((newClientSeed: string) => {
    setClientSeed(newClientSeed);
  }, []);

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
      const cases = generateCases(numCases, null, caseData, startMiddleItem);
      setCases(cases);
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
            if (isFirstServerSeedHash) {
              setServerSeedHash(message["server-seed-hash"]);
              setIsFirstServerSeedHash(false);
            } else {
              setPreviousServerSeedHash(serverSeedHash);
              setServerSeedHash(message["server-seed-hash"]);
            }
          }

          if ("case-results" in message) {
            const spinResult: SpinResponse = message["case-results"];
            const { caseItems, serverSeed } = spinResult;

            if (!caseItems) {
              toast.error("Error parsing WebSocket message: No case items found");
              if (isPaidSpinClicked) dispatch(togglePaidSpinClicked());
              return;
            }

            const caseItemsWon = caseItems.map((item) => item.rewardItem as BaseCaseItem);

            if (caseItemsWon.length !== numCases) {
              toast.error("Error parsing WebSocket message: Incorrect number of case items");
              if (isPaidSpinClicked) dispatch(togglePaidSpinClicked());
              return;
            }

            queryClient.invalidateQueries({ queryKey: ["bet_history"] });
            const newCases = generateCases(numCases, caseItemsWon, caseData, startMiddleItem);
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
        if (isPaidSpinClicked) dispatch(togglePaidSpinClicked());
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
  }, [socket, isFirstServerSeedHash, serverSeedHash, caseData, numCases, startMiddleItem]);

  return (
    <div className={"flex flex-col space-y-4 justify-between w-full items-center rounded-lg -mt-5"}>
      <div className={"hidden md:flex xl:hidden justify-between items-center w-full"}>
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
      </div>
      <div className="flex flex-col xl:flex-row justify-between items-center w-full xl:space-x-1 xl:space-y-0 space-y-4">
        {Array.from({ length: numCases }).map((_, i) => (
          <CaseCarousel
            key={`${i}-${numCases}`}
            index={i}
            items={cases[i]}
            isSpinClicked={spinClicked}
            isFastAnimationClicked={fastClicked}
            numCases={numCases}
            onAnimationComplete={handleAnimationComplete}
            windowSize={windowSize}
            skipAnimation={isSkipAnimationClicked}
            attachObserver={i === 0}
          />
        ))}
      </div>
      <div
        className={"flex flex-col md:flex-row justify-end xl:justify-between items-center w-full"}
      >
        <div className={"hidden xl:flex justify-between items-center gap-x-1 xl:gap-x-4"}>
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
        </div>
        <CarouselButtonsSubSection price={caseData.price} />
        <div className={"flex md:hidden justify-around items-center w-full"}>
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
        </div>
      </div>
    </div>
  );
};

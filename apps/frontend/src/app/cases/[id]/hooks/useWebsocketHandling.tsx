import { useEffect, useState } from "react";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { useDispatch } from "react-redux";
import { setServerSeed } from "../../../../store/slices/caseCarouselSlice";
import { useWebSocket } from "../../../context/WebSocketContext";

interface UseWebSocketHandlingProps {
  setItemsWon: React.Dispatch<React.SetStateAction<BaseCaseItem[] | null[]>>;
  isPaidSpinClicked: boolean;
  animationComplete: number;
  clientSeed: string;
  caseId: string;
  numCases: number;
}

export const useWebSocketHandling = ({
  setItemsWon,
  isPaidSpinClicked,
  animationComplete,
  clientSeed,
  caseId,
  numCases,
}: UseWebSocketHandlingProps) => {
  const { sendMessage, connectionStatus, socket } = useWebSocket();
  const dispatch = useDispatch();
  const [generateSeed, setGenerateSeed] = useState(true);

  useEffect(() => {
    if (connectionStatus === "connected" && generateSeed) {
      sendMessage(JSON.stringify({ action: "generate-seed" }));
      setGenerateSeed(false);
    }
  }, [connectionStatus, sendMessage, generateSeed]);

  useEffect(() => {
    if (isPaidSpinClicked && animationComplete === 0) {
      console.log("Spinning cases");
      if (connectionStatus === "connected") {
        sendMessage(
          JSON.stringify({
            action: "case-spin",
            clientSeed,
            caseId,
          })
        );
      }
    }
  }, [isPaidSpinClicked, animationComplete, connectionStatus, sendMessage, clientSeed, caseId]);

  useEffect(() => {
    const handleMessage = (event: { data: string }) => {
      try {
        const data = JSON.parse(event.data);

        if ("server-seed-hash" in data && data["server-seed-hash"]) {
          dispatch(setServerSeed(data["server-seed-hash"]));
          console.log("Server Seed Hash set:", data["server-seed-hash"]);
        }

        // TODO - Remove this once multiple cases at once is supported
        if ("case-result" in data) {
          setItemsWon(
            Array.from({ length: numCases }, () => data["case-result"].caseItem as BaseCaseItem)
          );
          console.log(
            Array.from({ length: numCases }, () => data["case-result"].caseItem as BaseCaseItem),
            numCases,
            "blaha"
          );
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
  }, [socket, setItemsWon, dispatch]);

  return { generateSeed, setGenerateSeed };
};

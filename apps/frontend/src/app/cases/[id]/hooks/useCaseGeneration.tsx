import { useEffect } from "react";
import { useDispatch } from "react-redux";

interface UseCaseGenerationProps {
  isPaidSpinClicked: boolean;
  animationComplete: number;
  numCases: number;
  connectionStatus: string;
  sendMessage: (message: string) => void;
  clientSeed: string;
  id: string;
}

export const useCaseGeneration = ({
  isPaidSpinClicked,
  animationComplete,
  numCases,
  connectionStatus,
  sendMessage,
  clientSeed,
  id,
}: UseCaseGenerationProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (isPaidSpinClicked && animationComplete === 0) {
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
    }
  }, [
    isPaidSpinClicked,
    animationComplete,
    numCases,
    connectionStatus,
    sendMessage,
    clientSeed,
    id,
  ]);
};

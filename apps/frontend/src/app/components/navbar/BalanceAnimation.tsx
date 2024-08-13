import React, { useEffect, useState } from "react";

interface BalanceAnimationProps {
  amount: number;
}

const BalanceAnimation: React.FC<BalanceAnimationProps> = ({ amount }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (amount !== 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [amount]);

  if (!visible || amount === 0) return null;

  return (
    <div className={`animationContainer ${amount > 0 ? "positive" : "negative"}`}>
      {amount > 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
    </div>
  );
};

export default BalanceAnimation;

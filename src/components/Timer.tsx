import { useEffect, useState } from "react";

type TimerProps = {
  className?: string;
  // Reserve space to avoid layout shift; measured in monospace character widths.
  minWidthCh?: number;
};

const started = new Date("July 27, 2022");

function Timer({ className, minWidthCh = 12 }: TimerProps) {
  const [timeDifference, setTimeDifference] = useState(0);

  useEffect(() => {
    const tick = () => {
      setTimeDifference(Date.now() - started.getTime());
    };

    tick();
    const timer = setInterval(tick, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <span
      className={["inline-block text-center tabular-nums", className]
        .filter(Boolean)
        .join(" ")}
      style={{ minWidth: `${minWidthCh}ch` }}
    >
      {timeDifference || "\u00a0"}
    </span>
  );
}

export default Timer;

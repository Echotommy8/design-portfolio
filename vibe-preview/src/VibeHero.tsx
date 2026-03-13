import { motion, useAnimationControls } from "framer-motion";
import { useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.6,
    },
  },
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0, rotate: 0 },
  pop: {
    opacity: 1,
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
  wiggle: {
    rotate: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeInOut" as const },
  },
};

const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.1 },
  },
};

function WiggleCircle({
  className,
  children,
}: {
  className: string;
  children?: React.ReactNode;
}) {
  const controls = useAnimationControls();
  const playedRef = useRef(false);

  return (
    <motion.div
      className={className}
      variants={circleVariants}
      initial="hidden"
      animate={controls}
      whileHover={{ scale: 1.1 }}
      viewport={{ once: true, amount: 0.6 }}
      onViewportEnter={async () => {
        if (playedRef.current) return;
        playedRef.current = true;
        await controls.start("pop");
        await controls.start("wiggle");
      }}
    >
      {children}
    </motion.div>
  );
}

export default function VibeHero() {
  return (
    <motion.div
      className="flex flex-col gap-6 p-20 font-serif text-6xl font-bold italic"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-4">
        <WiggleCircle className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-green-500">
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl text-white"
          >
            ★
          </motion.div>
        </WiggleCircle>
        <span className="text-green-500">Scalable</span>
        <span className="text-slate-900">products</span>
      </div>

      <div className="ml-20 flex items-center gap-4">
        <span className="italic text-slate-900">Highly</span>
        <WiggleCircle className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl text-white"
          >
            ✦
          </motion.div>
        </WiggleCircle>
        <span className="text-green-500">crafted</span>
        <span className="text-slate-900">UI</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-green-500">Delightful</span>
        <span className="text-slate-900">Experiences</span>
        <WiggleCircle className="h-20 w-20 rounded-full bg-green-400" />
      </div>
    </motion.div>
  );
}


import { motion, HTMLMotionProps } from "framer-motion";

const fieldAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function AnimatedField(
  props: HTMLMotionProps<"div">
) {
  return (
    <motion.div
      variants={fieldAnim}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      {...props}
    />
  );
}
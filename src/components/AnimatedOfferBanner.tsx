import { motion } from "framer-motion";
import { TicketPercent } from "lucide-react";

const AnimatedOfferBanner = () => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
      className="relative mx-auto mb-12 w-fit max-w-full rounded-[20px] border-2 border-dashed border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-200 px-6 py-4 shadow-lg flex items-center gap-4"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="text-yellow-700"
      >
        <TicketPercent className="w-10 h-10" />
      </motion.div>
      <div className="text-center text-yellow-900">
        <p className="font-bold text-lg sm:text-xl">Offre spéciale</p>
        <p className="text-sm sm:text-base">
          🎉 10% sur ta 1<sup>ère</sup> réservation <br />
          🐾 10% sur ta 5<sup>ème</sup> réservation
        </p>
      </div>
    </motion.div>
  );
};

export default AnimatedOfferBanner;
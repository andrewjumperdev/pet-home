export const needsExtraCharge = (arrivalTime: string, departureTime: string) => {
  if (!arrivalTime || !departureTime) return false;
  const [ah, am] = arrivalTime.split(":").map(Number);
  const [dh, dm] = departureTime.split(":").map(Number);
  const totalArrival = ah * 60 + am;
  const totalDeparture = dh * 60 + dm;
  return totalDeparture - totalArrival > 120;
};

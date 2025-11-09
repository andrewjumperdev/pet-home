import Calendar from "react-calendar";
import { timeOptions } from "../constants/timeOptions";
import { needsExtraCharge } from "../utils/calculateExtraCharge";

export default function BookingStep1({
  selectedRange,
  setSelectedRange,
  arrivalTime,
  setArrivalTime,
  departureTime,
  setDepartureTime,
  onNext,
  bookedDates,
  loadingDates,
}: {
  selectedRange: [Date, Date] | null;
  setSelectedRange: (range: [Date, Date] | null) => void;
  arrivalTime: string;
  setArrivalTime: (time: string) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;
  onNext: () => void;
  bookedDates: string[];
  loadingDates: boolean;
}) {
  return (
    <div className="bg-white p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Sélectionnez vos dates</h2>

      {loadingDates ? (
        <p className="text-gray-600">Chargement...</p>
      ) : (
        <Calendar
          selectRange
          onChange={(range) =>
            Array.isArray(range) && setSelectedRange(range as [Date, Date])
          }
          tileDisabled={({ date }) =>
            bookedDates.includes(date.toISOString().split("T")[0])
          }
          value={selectedRange || new Date()}
          className="rounded-xl mx-auto shadow"
        />
      )}

      {selectedRange && (
        <p className="text-sm text-gray-500 mt-2">
          {Math.round(
            (selectedRange[1].getTime() - selectedRange[0].getTime()) / (1000 * 60 * 60 * 24)
          )}{" "}
          nuits
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure d’arrivée</label>
          <select
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="w-full border-gray-300 rounded-lg p-3 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Sélectionner --</option>
            {timeOptions.map((time) => (
              <option key={`arrival-${time}`} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ</label>
          <select
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full border-gray-300 rounded-lg p-3 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Sélectionner --</option>
            {timeOptions.map((time) => (
              <option key={`departure-${time}`} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      {needsExtraCharge(arrivalTime, departureTime) && (
        <p className="text-red-600 text-sm mt-3 font-medium">
          Un supplément de <strong>12€</strong> sera appliqué si le départ excède de deux heures l'heure d’arrivée.
        </p>
      )}

      <button
        onClick={onNext}
        disabled={!selectedRange || !arrivalTime || !departureTime}
        className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </div>
  );
}

export type Review = {
  _id: string;
  author: string;
  date: string;
  text: string;
  sourceUrl: string;
  starRating: number;
};

type Props = {
  review: Review;
};

export default function ReviewCard({ review }: Props) {
  const formattedDate = new Date(review.date).toLocaleDateString("fr-FR");

  return (
    <div className="flex flex-col justify-between h-full bg-white rounded-2xl shadow-md p-4 text-left sm:p-6 transition-transform duration-300 ease-in-out hover:scale-[1.02] animate-fade-in">
      <div className="flex-grow">
        <p className="text-gray-800 text-base sm:text-lg whitespace-pre-line">
          {review.text}
        </p>
      </div>
      <div className="mt-4">
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
          ))}
        </div>
        <div className="text-sm sm:text-md text-gray-500">
          Par <span className="font-semibold text-gray-700">{review.author}</span> le {formattedDate}
        </div>
      </div>
    </div>
  );
}

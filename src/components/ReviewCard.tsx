
type Review = {
  _id: string;
  author: string;
  date: string;
  text: string;
  sourceUrl: string;
};

type Props = {
  review: Review;
};

export default function ReviewCard({ review }: Props) {
  const formattedDate = new Date(review.date).toLocaleDateString("fr-FR");

  return (
    <div className="shadow-xl rounded-xl p-4 shadow-sm bg-white">
      <p className="text-gray-800 whitespace-pre-line mb-3">{review.text}</p>
      <div className="text-sm text-gray-500 mb-2">
        Par <span className="font-semibold">{review.author}</span> le {formattedDate}
      </div>
      {/* <a
        href={review.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-blue-600 hover:underline font-medium"
      >
        Voir sur Rover →
      </a> */}
    </div>
  );
}

import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { CloudUpload, Trash2 } from "lucide-react";

type ImageData = {
  id: string;
  url: string;
  name: string;
};

export default function AdminGallery() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=711bea0af9cd9be4a115705e4205e5b9`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const url = data.data.url;

      const docRef = await addDoc(collection(db, "gallery"), {
        url,
        name: `${Date.now()}-${file.name}`,
      });

      setImages((prev) => [
        ...prev,
        { id: docRef.id, url, name: file.name },
      ]);
      setFile(null);
    } catch (err) {
      console.error("Error uploading to ImgBB:", err);
    } finally {
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gallery", id));
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "gallery"));
        const fetchedImages: ImageData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          url: doc.data().url,
          name: doc.data().name,
        }));
        setImages(fetchedImages);
      } catch (err) {
        console.error("Error fetching gallery images:", err);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold text-gray-800">
            Galería de Imágenes
          </h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full sm:w-auto"
            />
            {file && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                <CloudUpload size={18} />
                {isUploading ? "Subiendo..." : "Subir imagen"}
              </button>
            )}
          </div>
        </div>

        <div>
          {images.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No hay imágenes aún.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative group overflow-hidden rounded-lg shadow hover:shadow-xl transition"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex justify-end p-2 transition">
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

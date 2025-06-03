import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../lib/firebase";

type ImageData = {
  id: string;
  url: string;
  name: string;
};

export default function AdminGallery() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);

const handleUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=711bea0af9cd9be4a115705e4205e5b9`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const url = data.data.url;

    // Guarda la URL en Firebase Realtime Database
    const docRef = await addDoc(collection(db, "gallery"), {
      url,
      name: `${Date.now()}-${file.name}`,
    });

    setImages((prev) => [...prev, { id: docRef.id, url, name: file.name }]);
    setFile(null);
    setUploadProgress(0);
  } catch (err) {
    console.error("Error uploading to ImgBB:", err);
  }
};


  const handleDelete = (id: string) => {
    // ImgBB no ofrece borrado sin token asociado a la imagen subida.
    // Así que solo borramos localmente.
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Galería</h1>
      </div>

      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpload}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Subir imagen
            </button>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-40 object-cover rounded border"
            />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

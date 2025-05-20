import Gallery from "../components/Gallerie";

const images = [
    "/carousel/1.jpg",
    "/carousel/2.jpg",
    "/carousel/3.jpg",
    "/carousel/1.jpg",
    "/carousel/2.jpg",
    "/carousel/3.jpg",
    "/carousel/1.jpg",
    "/carousel/2.jpg",
    "/carousel/3.jpg",
    "/carousel/1.jpg",
    "/carousel/2.jpg",
    "/carousel/3.jpg",
    "/carousel/1.jpg",
    "/carousel/2.jpg",
    "/carousel/3.jpg",
    "/carousel/3.jpg",
  ];

function GalleryPage() {
  return (
    <section>
      <h2>Notre galerie</h2>
      <Gallery images={images} />
    </section>
  );
}
export default GalleryPage;
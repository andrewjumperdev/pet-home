import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Heart, Eye, Handshake, Star } from "lucide-react";
import CustomButton from "../components/CustomButton";

const LazyImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  alt,
  src,
  className,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`transition-opacity duration-700 ease-in-out ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
};

const APropos: React.FC = () => {
  // const [nombre, setNombre] = useState("");
  // const [email, setEmail] = useState("");
  // const [mensaje, setMensaje] = useState("");
  // const [loadingSubmit, setLoadingSubmit] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoadingSubmit(true);
  //   setError(null);
  //   try {
  //     await addDoc(collection(db, "consults"), {
  //       nombre,
  //       email,
  //       mensaje,
  //       fecha: new Date().toISOString(),
  //     });
  //     setSuccess(true);
  //     setNombre("");
  //     setEmail("");
  //     setMensaje("");
  //   } catch (err: any) {
  //     console.error(err);
  //     setError("Error al enviar, inténtalo de nuevo.");
  //   } finally {
  //     setLoadingSubmit(false);
  //   }
  // };

  return (
    <main>
      <Helmet>
        <title>Qui sommes-nous ? - PetHome</title>
        <meta
          name="description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta property="og:title" content="Qui sommes-nous ? - PetHome" />
        <meta
          property="og:description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <section
        className="container mx-auto px-2 mt-12 lg:px-50 py-12"
        aria-labelledby="about-heading"
      >
        {/* Header */}
        <header className="text-center mb-12">
          <h1 id="about-heading" className="text-4xl font-extrabold text-black">
            Qui sommes-nous ?
          </h1>
          <p className="mt-4 text-lg text-gray-900 text-start font-serif font-semibold">
            PetHome n’est pas une pension ni un refuge où sa mascotte partagera
            son lieu de vie avec des dizaines d’autres chiens et chats. PetHome est
            une vraie maison d’accueil où votre mascotte se sent en vacances
            avec sa seconde famille.
          </p>
        </header>

        {/* Team Photos & Text */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-start">
          {/* Text Column */}
          <div className="order-1 md:order-1 space-y-4 text-gray-700 leading-relaxed">
            <p>
              Nous sommes un couple passionné avec de très longues années
              d’expérience dans la garde et le bien-être des animaux. <br /> Mon
              mari, Andrew, a grandi dans une ferme au Costa Rica entouré de 7
              chiens, 8 chats, des chevaux, des vaches, des poules… et a été
              assistant vétérinaire pendant son adolescence. Il a un vrai don
              pour comprendre et éduquer les animaux mais est aussi attentionné,
              doux et joueur.
              <br /> <br />
              Quant à moi, je m’appelle Justine. J’ai grandi en région
              parisienne, toujours entourée de chiens et de chats. Je suis très
              câline, joueuse et attentive à leurs besoins. <br /> <br />
              Nous travaillons en télétravail ce qui nous permet d’être
              disponibles 24h/24 et 7j/7 pour les animaux que nous gardons.
            </p>
            <p>
              Nous habitons dans un appartement de 60m² à Antony,
              Hauts-de-Seine, juste en face d’un grand parc traversé par la
              coulée verte. Ces espaces verts sont parfaits pour faire de belles
              et longues balades avec les chiens au minimum 3 fois par jour et 4
              pour ceux avec beaucoup d'énergie.
            </p>
            <p>
              Nous accueillons jusqu'à deux chiens/chats d'un SEUL propriétaire
              à la fois pour offrir toute notre attention et assurer un séjour
              exclusif de haute qualité. <br /> <br />
              N’hésitez pas à nous contacter si vous avez une question, nous
              serons ravis de vous répondre! On a hâte de rencontrer votre
              petite boule d’amour et de lui faire passer de merveilleuses
              vacances chez nous :)
            </p>
          </div>

          {/* Images Column */}
          <div className="order-2 md:order-2 grid grid-cols-2 grid-rows-2 gap-4">
            <LazyImage
              src="/carousel/1.jpg"
              alt="Photo équipe 1"
              className="w-full h-48 md:h-64 object-cover rounded-xl"
            />
            <LazyImage
              src="/carousel/2.jpg"
              alt="Photo équipe 2"
              className="w-full h-48 md:h-64 object-cover rounded-xl"
            />
            <LazyImage
              src="/carousel/3.jpg"
              alt="Photo équipe 3"
              className="w-full h-48 md:h-64 object-cover rounded-xl"
            />
            <LazyImage
              src="/carousel/4.jpg"
              alt="Photo équipe 4"
              className="w-full h-48 md:h-64 object-cover rounded-xl"
            />
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16" aria-labelledby="values-heading">
          <h2
            id="values-heading"
            className="text-2xl font-semibold text-center text-gray-800 mb-6"
          >
            Nos valeurs
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, label: "Amour et respect", color: "text-red-500" },
              { icon: Eye, label: "Transparence", color: "text-yellow-500" },
              { icon: Handshake, label: "Confiance", color: "text-green-500" },
              { icon: Star, label: "Expérience", color: "text-indigo-500" },
            ].map(({ icon: Icon, label, color }) => (
              <li
                key={label}
                className="flex items-center p-4 border rounded-xl shadow-sm"
              >
                <Icon className={`w-6 h-6 ${color}`} />
                <span className="ml-3 text-gray-700 font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-12">
          <h3 className="text-2xl font-medium text-gray-800 mb-8">
            Une question ?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <CustomButton
              label="FAQ"
              alt="Aller à la page FAQ"
              variant="primary"
              to="/FAQ"
              className="text-sm px-4 py-2"
            />
            <CustomButton
              label="Contactez-nous"
              alt="Aller à la page de contact"
              variant="primary"
              to="/contact"
              className="text-sm px-4 py-2"
            />
          </div>
        </section>
      </section>
    </main>
  );
};

export default APropos;

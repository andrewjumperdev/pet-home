import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Heart,
  Eye,
  Handshake,
  Star,
  MapPin,
  Clock,
  Users,
  PawPrint,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LazyImage: React.FC<
  React.ImgHTMLAttributes<HTMLImageElement> & { aspectRatio?: string }
> = ({ alt, src, className, aspectRatio = "aspect-square", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`${aspectRatio} overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
};

const APropos: React.FC = () => {
  const values = [
    {
      icon: Heart,
      label: "Amour et respect",
      description: "Chaque animal est traité avec tout l'amour qu'il mérite",
      color: "bg-rose-50 text-rose-600 border-rose-100",
      iconBg: "bg-rose-100",
    },
    {
      icon: Eye,
      label: "Transparence",
      description: "Photos et nouvelles régulières pendant le séjour",
      color: "bg-amber-50 text-amber-600 border-amber-100",
      iconBg: "bg-amber-100",
    },
    {
      icon: Handshake,
      label: "Confiance",
      description: "Une relation basée sur la communication et l'honnêteté",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      iconBg: "bg-emerald-100",
    },
    {
      icon: Star,
      label: "Expérience",
      description: "Des années d'expertise au service de vos compagnons",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      iconBg: "bg-indigo-100",
    },
  ];

  const highlights = [
    { icon: MapPin, text: "Antony, Hauts-de-Seine (92)" },
    { icon: Clock, text: "Disponibles 24h/24, 7j/7" },
    { icon: Users, text: "Garde exclusive et personnalisée" },
    { icon: PawPrint, text: "Grand parc à proximité" },
  ];

  return (
    <main className="bg-white">
      <Helmet>
        <title>Qui sommes-nous ? - Maison pour Pets</title>
        <meta
          name="description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta
          property="og:title"
          content="Qui sommes-nous ? - Maison pour Pets"
        />
        <meta
          property="og:description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 pt-24 pb-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border-4 border-white rounded-full" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6">
              Notre histoire
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              PetHome n’est pas une pension ni un refuge où sa mascotte
              partagera son lieu de vie avec des dizaines d’autres chiens et
              chats. PetHome est une vraie maison d’accueil où votre mascotte se
              sent en vacances avec sa seconde famille.
            </p>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 lg:px-8 -mt-16 relative z-20">
        {/* Photo Grid - Featured */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16"
        >
          <LazyImage
            src="/carousel/1.jpg"
            alt="Andrew et un chien"
            className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
            aspectRatio="aspect-[4/5]"
          />
          <LazyImage
            src="/carousel/2.jpg"
            alt="Justine avec un chat"
            className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 md:mt-8"
            aspectRatio="aspect-[4/5]"
          />
          <LazyImage
            src="/carousel/3.jpg"
            alt="Promenade au parc"
            className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
            aspectRatio="aspect-[4/5]"
          />
          <LazyImage
            src="/carousel/4.jpg"
            alt="Moment câlin"
            className="relative rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 md:mt-8"
            aspectRatio="aspect-[4/5]"
          />
        </motion.div>

        {/* Highlights Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-50 rounded-2xl p-6 mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Notre parcours
              </h2>
              <div className="w-20 h-1 bg-teal-500 rounded-full" />
            </div>

            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                Nous sommes un couple passionné avec de très longues années
                d'expérience dans la garde et le bien-être des animaux.
              </p>

              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                <p className="text-slate-700 font-medium mb-2">
                  <strong className="text-teal-700">Andrew</strong>
                </p>
                <p className="text-slate-600 text-base">
                  A grandi dans une ferme au Costa Rica entouré de 7 chiens, 8
                  chats, des chevaux, des vaches, des poules… et a été assistant
                  vétérinaire pendant son adolescence. Il a un vrai don pour
                  comprendre et éduquer les animaux.
                </p>
              </div>

              <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded-r-lg">
                <p className="text-slate-700 font-medium mb-2">
                  <strong className="text-rose-600">Justine</strong>
                </p>
                <p className="text-slate-600 text-base">
                  J'ai grandi en région parisienne, toujours entourée de chiens
                  et de chats. Je suis très câline, joueuse et attentive à leurs
                  besoins.
                </p>
              </div>

              <p>
                Nous travaillons en télétravail ce qui nous permet d'être
                disponibles
                <strong className="text-teal-600"> 24h/24 et 7j/7</strong> pour
                les animaux que nous gardons.
              </p>
            </div>
          </motion.div>

          {/* Large Feature Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="sticky top-24">
              <LazyImage
                src="/carousel/5.jpg"
                alt="Notre maison d'accueil"
                className="rounded-3xl shadow-2xl"
                aspectRatio="aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">60m²</p>
                    <p className="text-sm text-slate-500">d'espace de vie</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Our Approach Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 lg:p-12 mb-20"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Notre approche
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Nous habitons dans un appartement de 60m² à Antony,
              Hauts-de-Seine, juste en face d'un grand parc traversé par la
              coulée verte. Ces espaces verts sont parfaits pour de belles et
              longues balades avec les chiens
              <strong className="text-teal-600">
                {" "}
                au minimum 3 fois par jour
              </strong>
              .
            </p>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-700 leading-relaxed">
                <span className="text-2xl">🐕</span> Le chien ou le chat est
                généralement accueilli{" "}
                <strong className="text-teal-600">seul</strong>. Toutefois, nous
                pouvons recevoir jusqu'à deux animaux de deux propriétaires
                différents,
                <strong className="text-teal-600">
                  {" "}
                  uniquement avec l'accord préalable
                </strong>{" "}
                de leurs propriétaires. Ce service de garde exclusive nous
                permet de leur consacrer toute notre attention et de garantir un
                séjour privilégié.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Nos valeurs
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Les principes qui guident notre engagement envers vos compagnons
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(
              ({ icon: Icon, label, description, color, iconBg }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${color} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div
                    className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {label}
                  </h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </motion.div>
              ),
            )}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-8 lg:p-12 mb-20 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Envie de nous rencontrer ?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            N'hésitez pas à nous contacter si vous avez une question. Nous
            serons ravis de vous répondre et de rencontrer votre petite boule
            d'amour !
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/FAQ"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-sky-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
            >
              Voir la FAQ
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-sky-700 text-white font-semibold rounded-xl hover:bg-sky-800 transition-colors border-2 border-white/20"
            >
              Nous contacter
            </Link>
          </div>
        </motion.section>
      </section>
    </main>
  );
};

export default APropos;

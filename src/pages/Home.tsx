import Hero from '../components/Hero';
import Features from '../components/Features';
import ParallaxSection from '../components/ParallaxSection';
import { Helmet } from 'react-helmet';


const Home = () => (
  <>
        <Helmet>
        <title>PetHome</title>
        <meta
          name="description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta property="og:title" content="PetHome" />
        <meta
          property="og:description"
          content="Découvrez notre histoire, notre passion et nos valeurs pour le bien-être de vos animaux."
        />
        <meta property="og:type" content="website" />
      </Helmet>
    <Hero />
    <Features />
    <ParallaxSection />
  </>
);

export default Home;

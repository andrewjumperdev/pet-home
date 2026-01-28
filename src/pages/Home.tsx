import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import ParallaxSection from '../components/ParallaxSection';
import FinalCTA from '../components/FinalCTA';
import { Helmet } from 'react-helmet';


const Home = () => (
  <>
    <Helmet>
      <title>PetHome - Garderie privée pour chiens et chats</title>
      <meta
        name="description"
        content="PetHome, votre garderie privée et exclusive pour chiens et chats. Maximum 2 animaux à la fois pour une attention personnalisée. Photos quotidiennes, promenades et câlins garantis !"
      />
      <meta property="og:title" content="PetHome - Garderie privée pour chiens et chats" />
      <meta
        property="og:description"
        content="Offrez à votre compagnon les vacances rêvées ! Garderie exclusive avec attention personnalisée, promenades quotidiennes et communication 7j/7."
      />
      <meta property="og:type" content="website" />
    </Helmet>
    <Hero />
    <Features />
    <Stats />
    <HowItWorks />
    <ParallaxSection />
    <FinalCTA />
  </>
);

export default Home;

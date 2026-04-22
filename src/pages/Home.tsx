import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";

const Home = () => (
  <>
    <Hero />
    <Services preview />
    <About />
    <Gallery preview />
    <Contact preview />
  </>
);

export default Home;

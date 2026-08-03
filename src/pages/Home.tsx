import { Hero } from "@/components/sections/Hero";
import { TrendingBanner } from "@/components/sections/TrendingBanner";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";

const Home = () => (
  <>
    <Hero />
    <TrendingBanner />
    <FeaturedProducts />
    <Services preview />
    <About />
    <Gallery preview />
    <Testimonials preview />
    <Contact preview />
  </>
);

export default Home;

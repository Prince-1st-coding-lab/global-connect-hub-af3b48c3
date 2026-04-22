import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      nav: { home: "Home", services: "Services", about: "About", gallery: "Gallery", contact: "Contact" },
      hero: {
        eyebrow: "Noble Spaces",
        tagline: "your space, our passion",
        title: "Interior Design",
        title_script: "Services",
        subtitle: "Experience the difference with our professional interior design services, where creativity meets functionality to create spaces that inspire and delight.",
        cta_primary: "Request a Consultation",
        cta_secondary: "Explore Services",
      },
      services: {
        title: "Core Offerings",
        subtitle: "Twelve disciplines, one signature of craftsmanship.",
        items: [
          "Interior design",
          "Furniture manufacturing",
          "Sofa design and manufacturing",
          "Modern office furniture",
          "Wall partitioning",
          "Kitchen design and installation",
          "Ceiling installation",
          "Furniture repair and renovation",
          "Curtains and carpets installation",
          "Door manufacturing and installation",
          "Sound proof installation",
          "Maintenance work and services",
        ],
      },
      about: {
        title: "Crafting noble interiors",
        body: "At Noble Spaces, every project is a quiet collaboration between architecture, light, and the people who live within it. From private residences to refined offices, we shape interiors that feel intentional, durable, and timeless.",
        stat1: "Years of craft",
        stat2: "Projects delivered",
        stat3: "Skilled artisans",
      },
      gallery: { title: "Selected Work", subtitle: "A glimpse into our portfolio" },
      contact: {
        title: "Get in touch",
        subtitle: "Let's design something noble together.",
        phone: "Phone",
        email: "Email",
        location: "Location",
        address: "Kigali, Kicukiro, Gikondo",
        find_us: "Find us on the map",
      },
      footer: { rights: "All rights reserved.", follow: "Follow us" },
    },
  },
  fr: {
    translation: {
      nav: { home: "Accueil", services: "Services", about: "À propos", gallery: "Galerie", contact: "Contact" },
      hero: {
        eyebrow: "Noble Spaces",
        tagline: "votre espace, notre passion",
        title: "Design",
        title_script: "d'Intérieur",
        subtitle: "Découvrez la différence avec nos services professionnels de design d'intérieur, où la créativité rencontre la fonctionnalité pour créer des espaces qui inspirent et ravissent.",
        cta_primary: "Demander une consultation",
        cta_secondary: "Voir les services",
      },
      services: {
        title: "Nos prestations",
        subtitle: "Douze disciplines, une seule signature d'artisanat.",
        items: [
          "Design d'intérieur",
          "Fabrication de meubles",
          "Conception et fabrication de canapés",
          "Mobilier de bureau moderne",
          "Cloisonnement de murs",
          "Conception et installation de cuisines",
          "Installation de plafonds",
          "Réparation et rénovation de meubles",
          "Installation de rideaux et tapis",
          "Fabrication et installation de portes",
          "Installation d'isolation phonique",
          "Travaux d'entretien et services",
        ],
      },
      about: {
        title: "L'art des intérieurs nobles",
        body: "Chez Noble Spaces, chaque projet est une collaboration discrète entre l'architecture, la lumière et les personnes qui y vivent. Des résidences privées aux bureaux raffinés, nous façonnons des intérieurs intentionnels, durables et intemporels.",
        stat1: "Années de métier",
        stat2: "Projets livrés",
        stat3: "Artisans qualifiés",
      },
      gallery: { title: "Travaux sélectionnés", subtitle: "Un aperçu de notre portefeuille" },
      contact: {
        title: "Contactez-nous",
        subtitle: "Concevons ensemble quelque chose de noble.",
        phone: "Téléphone",
        email: "Email",
        location: "Adresse",
        address: "Kigali, Kicukiro, Gikondo",
        find_us: "Retrouvez-nous sur la carte",
      },
      footer: { rights: "Tous droits réservés.", follow: "Suivez-nous" },
    },
  },
  rw: {
    translation: {
      nav: { home: "Ahabanza", services: "Serivisi", about: "Abo turi bo", gallery: "Amafoto", contact: "Twandikire" },
      hero: {
        eyebrow: "Noble Spaces",
        tagline: "umwanya wawe, ishyaka ryacu",
        title: "Igishushanyo",
        title_script: "cy'Imbere",
        subtitle: "Bonera ubunyangamugayo bwa serivisi z'igishushanyo cy'imbere y'inzu, aho ubuhanga buhura n'akamaro mu kurema imyanya iteza imbere kandi inezeza.",
        cta_primary: "Saba inama",
        cta_secondary: "Reba serivisi",
      },
      services: {
        title: "Serivisi z'Ingenzi",
        subtitle: "Inzobere cumi n'ebyiri, ubuhanga bumwe.",
        items: [
          "Igishushanyo cy'imbere",
          "Ukora ibikoresho byo mu nzu",
          "Igishushanyo n'ukora intebe (sofa)",
          "Ibikoresho bya biro bya kijyambere",
          "Gutandukanya inkuta",
          "Igishushanyo no kurangiza igikoni",
          "Gushyira plafond",
          "Gusana no kuvugurura ibikoresho byo mu nzu",
          "Gushyira amarido n'ibitambaro",
          "Gukora no gushyira inzugi",
          "Gushyira ibikuza urusaku (sound proof)",
          "Imirimo yo kubungabunga na serivisi",
        ],
      },
      about: {
        title: "Dukora imyanya y'icyubahiro",
        body: "Muri Noble Spaces, buri mushinga ni ubufatanye buhoro hagati y'ubwubatsi, urumuri, n'abantu babamo. Kuva mu mazu y'abikorera kugeza kuri biro, dushyira ku rwego rw'imyanya ihamye kandi idahindagurika.",
        stat1: "Imyaka y'ubuhanga",
        stat2: "Imishinga yarangiye",
        stat3: "Abakozi b'inzobere",
      },
      gallery: { title: "Imirimo Yatoranyijwe", subtitle: "Reba bike ku byo dukora" },
      contact: {
        title: "Twandikire",
        subtitle: "Reka dushushanye hamwe ikintu cy'icyubahiro.",
        phone: "Telefone",
        email: "Imeyili",
        location: "Aho turi",
        address: "Kigali, Kicukiro, Gikondo",
        find_us: "Tubone ku ikarita",
      },
      footer: { rights: "Uburenganzira bwose burabitswe.", follow: "Tukurikire" },
    },
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

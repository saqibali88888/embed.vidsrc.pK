// Hero.tsx
import { HeroClient } from "./HeroClient";

async function getData(heroId: string) {
  try {
    const resHero = await fetch(
      `https://api.themoviedb.org/3/movie/${heroId}/images?api_key=${process.env.TMDB_KEY}&language=en-US&include_image_language=en,null`,
      {
        next: { revalidate: 300 },
      }
    );
    const hero = await resHero.json();
    return hero;
  } catch (error) {
    console.log(error);
    return [];
  }
}

const Hero = async ({ hero }: { hero: any }) => {
  const heroData = await getData(hero?.id);
  return <HeroClient hero={hero} heroData={heroData} />;
};

export default Hero;
"use client";
import React, { useEffect, useState } from "react";
import Artplayer from "./ArtPlayer";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { CgClose } from "react-icons/cg";
import { playEpisode, playMovie } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { consumetPlay } from "@/lib/consumetApi";
import { toast } from "react-toastify";
import ErrorMessage from "../ErrorMessage";


interface PosterData {
  posterPath?: string;
  backdropPath?: string;
}

const Stream = ({
  params,
}: {
  params: { imdb: string; type: string; id: string; seasonEpisode?: string; };
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlLang = searchParams.get('lang');
  //const season = searchParams.get("season");
  //const episode = searchParams.get("episode");
  const dispatch = useAppDispatch();
  const [url, setUrl] = useState<string>("");
  const [posterData, setPosterData] = useState<PosterData>({});
  const [error, setError] = useState(false);
  const ref = React.useRef<any>();
  const [art, setArt] = useState<any>();
  const [availableLang, setAvailableLang] = useState<string[]>([]);
  const [currentLang, setCurrentLang] = useState<string>(urlLang || '');
  const [sub, setSub] = useState<any>([]);

  let season: string | null = null;
  let episode: string | null = null;

  if (params.seasonEpisode) {
    [season, episode] = params.seasonEpisode.split('-');
  } else {
    season = searchParams.get("season");
    episode = searchParams.get("episode");
  }

  const provider = useAppSelector((state) => state.options.api);

  // Handle URL language updates
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (currentLang) {
      newParams.set('lang', currentLang);
    } else {
      newParams.delete('lang');
    }
    router.replace(`?${newParams.toString()}`, { scroll: false });
  }, [currentLang]);

  // Validate language against available options
  useEffect(() => {
    if (availableLang.length > 0 && !availableLang.includes(currentLang)) {
      setCurrentLang(availableLang[0]);
    }
  }, [availableLang]);
  
  // Add this useEffect to handle initial language setup
useEffect(() => {
  if (urlLang && availableLang.includes(urlLang)) {
    setCurrentLang(urlLang);
  }
}, [availableLang, urlLang]);
  useEffect(() => {
    async function fetchPosterData() {
      try {
        // First try to get TMDB ID using IMDB ID
        const findResponse = await fetch(
          `https://api.themoviedb.org/3/find/${params.imdb}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&external_source=imdb_id`
        );
        console.log(findResponse)
        const findData = await findResponse.json();
        
        // Get the TMDB ID from the results
        const tmdbId = findData?.movie_results?.[0]?.id || findData?.tv_results?.[0]?.id;
        console.log(tmdbId)
        
        if (tmdbId) {
          // Fetch detailed data using TMDB ID
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/${params.type}/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
          );
          console.log(detailsResponse)
          const detailsData = await detailsResponse.json();
          console.log(detailsData)
          
          setPosterData({
            posterPath: detailsData.poster_path,
            backdropPath: detailsData.backdrop_path
          });
          console.log(detailsData.poster_path)
          console.log(detailsData.backdrop_path)
        }
      } catch (error) {
        console.error('Error fetching poster data:', error);
      }
    }

    fetchPosterData();
  }, [params.imdb, params.type]);

   useEffect(() => {
    async function get8Stream() {
      try {
        let data;
        if (params.type === "movie") {
          data = await playMovie(params.imdb, currentLang);
        } else {
          data = await playEpisode(
            params.imdb,
            parseInt(season as string),
            parseInt(episode as string),
            currentLang
          );
        }

        if (data?.success && data?.data?.link) {
          setUrl(data.data.link);
          setAvailableLang(data.availableLang.filter((lang: string) => lang));
          art?.switchUrl(data.data.link);
        } else {
          setError(true);
          
        }
      } catch (error) {
        setError(true);
       
      }
    }

    async function getConsumet() {
      try {
        const data = await consumetPlay(
          params.id,
          params.type,
          parseInt(episode as string),
          parseInt(season as string)
        );
        
        if (data?.success && data?.data?.sources) {
          setUrl(data.data.sources.slice(-1)[0]?.url);
          setSub(data.data.subtitles);
        } else {
          setError(true);
        
        }
      } catch (error) {
        setError(true);
        
      }
    }

    if (provider === "8stream") {
      get8Stream();
    } else {
      getConsumet();
    }
  }, [currentLang]);

  const getPosterUrl = () => {
    if (posterData.backdropPath) {
      return `https://image.tmdb.org/t/p/original${posterData.backdropPath}`;
    }
    if (posterData.posterPath) {
      return `https://image.tmdb.org/t/p/original${posterData.posterPath}`;
    }
    return ''; // Fallback empty string if no poster available
  };
  return (
    <div className="fixed bg-black inset-0 flex justify-center items-end z-[200]">
      <div className="w-[100%] h-[100%] rounded-lg" id="player-container">
        {url?.length > 0 ? (
          <Artplayer
            artRef={ref}
            sub={sub}
            posterUrl={getPosterUrl()} // Pass poster URL directly to ArtPlayer
            availableLang={availableLang} // Add this prop
            currentLang={currentLang}
            onLanguageChange={(lang: string) => setCurrentLang(lang)}
            style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
            option={{
              container: "#player-container",
              url: url,
              aspectRatio: true,
              flip: true,
              miniProgressBar: true,
              setting: true,
              theme: "#fcba03",
              
              controls: [
                {
                  name: "Lang",
                  position: "right",
                  index: 10,
                  html: ``,
                  style: {
                    display: "none"
                  },
                  selector: availableLang.map((lang: string, index: number) => ({
                    default: lang === currentLang || (index === 0 && !currentLang),
                    html: lang,
                    value: lang,
                  })),
                  onSelect: (selector: any) => setCurrentLang(selector.value),
                }, 
              ],
              playbackRate: true,
              fullscreen: true,
              subtitleOffset: false,
              subtitle: {
                type: "vtt",
                escape: false,
                style: {
                  color: "#fff",
                  // @ts-ignore
                  "font-size": "35px",
                  "font-family": "sans-serif",
                  "text-shadow":
                    "-3px 3px 4px rgba(0, 0, 0, 1),2px 2px 4px rgba(0, 0, 0, 1),1px -1px 3px rgba(0, 0, 0, 1),-3px -2px 4px rgba(0, 0, 0, 1)",
                },
              },
              lock: true,
              fastForward: true,
              cssVar: {
                "--art-indicator-scale": 1.5,
                "--art-indicator-size": "15px",
                "--art-bottom-gap": "0px",
                "--art-control-icon-scale": 1.7,
                //"--art-padding": "10px 30px 0px",
                // "--art-control-icon-size": "60px",
                "--art-volume-handle-size": "20px",
                "--art-volume-height": "150px",
              },
            }}
            getInstance={(art: any) => {
              setArt(art);
            }}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="loader"></span>
          </div>
        )}
      </div>
      {/*<div
        className="absolute top-0 right-0 m-5 cursor-pointer z-50"
        onClick={() => {
          router.replace(`/watch/${params.type}/${params.id}}`);
        }}
      >
        <CgClose className="text-white text-4xl" />
      </div>*/} 
    </div>
  );
};

export default Stream;

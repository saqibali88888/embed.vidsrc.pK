import Image from "next/image"
import { getEpisodeInfo, getSeasonList } from "@/lib/api"
import PlayButton from "@/components/Watch/PlayButton"
import type { Metadata } from "next"

async function getData(id: string, season: string, episode: string) {
  try {
    const episodeInfo = await getEpisodeInfo(id, Number.parseInt(season), Number.parseInt(episode))
    const resImages = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/images?api_key=${process.env.TMDB_KEY}&language=en-US&include_image_language=en,null`,
    )
    const images = await resImages.json()
    return {
      episodeInfo,
      images,
    }
  } catch (error) {
    console.log(error)
    return {
      episodeInfo: null,
      images: [],
    }
  }
}

const EpisodePage = async ({ params }: { params: { id: string; seasonEpisode: string } }) => {
  const [season, episode] = params.seasonEpisode.split('-');
  const data = await getData(params.id, season, episode)
  const filteredImages = data?.images?.backdrops?.filter((image: any) => image.height >= 1000)

  return (
    <div className="overflow-hidden relative h-screen">
      <Image
        unoptimized={true}
        priority={true}
        src={`https://image.tmdb.org/t/p/original${
          data.episodeInfo?.still_path ||
          filteredImages?.[Math.floor(Math.random() * (filteredImages?.length || 0))]?.file_path
        }`}
        alt={data.episodeInfo?.name || "Episode Image"}
        width={1920}
        height={1080}
        className="object-cover w-full h-screen lg:h-[700px] absolute top-0 left-0"
      />
      <div className="absolute top-0 left-0 w-full h-[500px] lg:h-[700px] bg-gradient-to-t from-black to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black to-transparent"></div>
      <div className="flex flex-row max-sm:gap-7 max-sm:flex-col justify-center items-center w-full lg:h-full max-sm:h-screen">
        {/*<div className="top-0 flex flex-col justify-start gap-10 z-20 ml-8 h-full">
          <h1 className="text-white text-4xl lg:text-6xl font-semibold mt-[250px]">{data.episodeInfo?.name}</h1>
          <div className="flex gap-4 mt-4 justify-start items-center">
            <div className="flex justify-start items-center">
              <p className="bg-[#F9CC0B] text-[#02040A] rounded-full px-2 py-1 text-base font-bold">TMDB</p>
              <p className="rounded-full px-3 py-1 text-xl text-white font-extrabold">
                {data.episodeInfo?.vote_average?.toFixed(1)}
              </p>
            </div>
            <p className="text-white text-xl font-medium">{data.episodeInfo?.air_date?.slice(0, 4)}</p>
            <p className="text-white text-xl font-medium">
              S{data.episodeInfo?.season_number} E{data.episodeInfo?.episode_number}
            </p>
          </div>
          <p className="text-white text-sm lg:text-sm font-medium max-w-[500px]">
            {data.episodeInfo?.overview?.length > 350
              ? data.episodeInfo?.overview?.slice(0, 350) + "..."
              : data.episodeInfo?.overview}
          </p>
        </div>*/}
        <div className="flex flex-col justify-center  items-center h-[500px] z-20">
          <PlayButton
            getSeasonList={getSeasonList}
            imdbId={data.episodeInfo?.imdbId}
            tmdbId={params.id}
            type="episode"
            seasonNumber={season}
            episodeNumber={episode}
          />
        </div>
      </div>
    </div>
  )
}

export default EpisodePage

export async function generateMetadata({
  params,
}: {
  params: { id: string; seasonEpisode: string;  }
}): Promise<Metadata> {
const [season, episode] = params.seasonEpisode.split('-');
  const data = await getData(params.id, season, episode)
  return {
    title: `${data.episodeInfo?.name} - Season ${season} Episode ${episode}`,
    description: `Watch ${data.episodeInfo?.name} - Season ${season} Episode ${episode} online. ${data.episodeInfo?.overview}`,
    keywords: ["TV series", "episode", data.episodeInfo?.name],
    category: "TV Series",
  }
}


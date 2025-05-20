"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hook";
import { toggleEpModal } from "@/redux/slices/epModal";
import Image from "next/image";
import { IoPlay } from "react-icons/io5";
import { setSeason } from "@/redux/slices/options";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

const Seasons = ({
  id,
  getEpisodes,
  type,
}: {
  id: {
    tmdb: string;
    imdb: string;
  };
  getEpisodes: (id: string, season_number: number) => Promise<any>;
  type: string;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const opt = useAppSelector((state) => state.options);
  const season = useAppSelector((state) => state.options.season);
  const epModal = useAppSelector((state) => state.epModal.epModal);
  const [episodes, setEpisodes] = useState<any>([]);
  const seasonInfo = useAppSelector((state) => state.options.seasonInfo);

  useEffect(() => {
    async function getSeasons() {
      const data = await getEpisodes(id.tmdb, season);
      setEpisodes(data?.filter((item: any) => item?.still_path !== null));
    }
    getSeasons();
  }, [id, season, getEpisodes]);

  const handleEpisodeClick = (episodeNumber: number, seasonNumber: number) => {
    router.push(`/tv/${id.tmdb}/${seasonNumber}-${episodeNumber}`);
    dispatch(toggleEpModal(false));
  };

  return (
    <AnimatePresence>
      {epModal && (
        <motion.div
          initial={{ y: 1000 }}
          animate={{ y: 0 }}
          exit={{ y: 1000 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0  flex justify-center items-end z-50"
          onClick={() => {
            dispatch(toggleEpModal(false));
          }}
        >
          <div
            className="bg-white bg-opacity-10 backdrop-blur-sm p-5 max-md:h-[100%] h-[100%] w-[100%]
      flex flex-col gap-3 rounded-t-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center gap-5">
              {/* seasons */}
              <div className="flex gap-2 overflow-x-auto">
                {seasonInfo?.map((item: any, i: number) => {
                  return (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        season === i + 1
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/50"
                      }`}
                      onClick={() => dispatch(setSeason(i + 1))}
                    >
                      Season {i + 1}
                    </button>
                  );
                })}
              </div>
              {/* close button */}
              <div
                className="flex justify-center items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2 cursor-pointer hover:bg-opacity-30"
                onClick={() => {
                  dispatch(toggleEpModal(false));
                }}
              >
                <FaChevronDown className="text-white text-base" />
              </div>
            </div>
            <div className="flex flex-col gap-3 pr-1 overflow-y-scroll">
              {episodes
                ?.slice(0, seasonInfo?.[season - 1]?.totalEpisodes || 9999)
                ?.map((episode: any, i: number) => {
                  return (
                    <div
                      key={episode?.id}
                      className="flex bg-white bg-opacity-10 backdrop-blur-md rounded-lg justify-start items-center gap-3 p-2 cursor-pointer hover:bg-opacity-20 bg group"
                      onClick={() => handleEpisodeClick(i + 1, season)}
                    >
                      <div className="relative">
                        <Image
                          unoptimized={true}
                          src={`https://image.tmdb.org/t/p/original${episode?.still_path}`}
                          alt={episode?.name}
                          width={200}
                          height={200}
                          className="object-cover w-[180px] h-[100px] rounded-lg"
                        />
                        <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <IoPlay className="text-white text-4xl" />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <h1 className="text-white max-sm:text-sm text-xl font-medium">
                          {episode?.episode_number}. {episode?.name}
                        </h1>
                        <h1 className="text-white text-xs max-sm:text-[9px] font-medium">
                          {episode?.overview?.length > 100
                            ? episode?.overview?.slice(0, 100) + "..."
                            : episode?.overview}
                        </h1>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Seasons;
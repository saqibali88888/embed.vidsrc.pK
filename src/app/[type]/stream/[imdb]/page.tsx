import { Suspense } from "react";
import Stream from "@/components/Player/Stream";


const page = async ({
  params,
}: {
  params: { imdb: string; type: string; id: string, seasonEpisode: string; };
}) => {
  const streamParams = {
    type: params.type,
    imdb: params.imdb,
    id: params.id || params.imdb, // Use imdb as id if not provided
    seasonEpisode: params.seasonEpisode
  };

  return (
    <div className="w-full h-full"> 
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"/>
      </div>}>
        <Stream params={streamParams} /> 
      </Suspense>
    </div>
  );
};

export default page;

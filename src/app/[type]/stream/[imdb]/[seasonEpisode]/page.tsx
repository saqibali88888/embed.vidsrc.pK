// app/tv/[id]/[imdb]/[seasonEpisode]/page.tsx
import { Suspense } from "react";
import Stream from "@/components/Player/Stream";

interface PageParams {
  imdb: string;
  type: string;
  id: string;
  seasonEpisode?: string; 
}

const Page = async ({
  params,
}: {
  params: PageParams;
}) => {
  return (
    <div>
      <Suspense fallback={<div></div>}>
        <Stream params={params} />
      </Suspense>
    </div>
  );
};

export default Page;
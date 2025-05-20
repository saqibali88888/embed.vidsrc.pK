"use server";

// ----------------- TMDB -----------------//

// episodes list by season
export async function getEpisodes(id: string, season: number) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${process.env.TMDB_KEY}`
    );
    const data = await response.json();
    return data.episodes;
  } catch (error) {
    console.log(error);
  }
}

// search
export async function search(query: string) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_KEY}&query=${query}&include_adult=true&language=en-US&page=1`
    );
    const data = await response.json();
    // media_type: "tv" | "movie"
    const filteredData = data.results.filter(
      (item: any) => item.media_type === "tv" || item.media_type === "movie"
    );
    return filteredData;
  } catch (error) {
    console.log(error);
  }
}

// ----------------- 8stream -----------------//

// get stream url
export async function getStreamUrl(file: string, key: string) {
  try {
    const response = await fetch(`${process.env.STREAM_API}/getStream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file, key }),
    });

    // Handle non-OK responses first
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stream API error:', errorText);
      return { 
        success: false, 
        error: errorText.includes('Too many') ? 'Too many requests' : 'API error',
        status: response.status
      };
    }

    // Verify JSON content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from stream API:', text);
      return { 
        success: false, 
        error: 'Invalid response format',
        responseText: text
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Network error in getStreamUrl:', error);
    return { 
      success: false, 
      error: 'Network request failed',
      details: error 
    };
  }
}

// get Media info
export async function getMediaInfo(id: string) {
  try {
    const response = await fetch(
      `${process.env.STREAM_API}/mediaInfo?id=${id}`,
      { cache: "no-cache" }
    );

    // First check if response is OK
    if (!response.ok) {
      const text = await response.text();
      console.error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      return { 
        success: false, 
        error: `HTTP error! Status: ${response.status}`,
        status: response.status
      };
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('Received non-JSON response:', text);
      return { 
        success: false, 
        error: 'Invalid response format',
        responseText: text
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Network error:', error);
    return { 
      success: false, 
      error: 'Network request failed',
      details: error 
    };
  }
}

// play movie
export async function playMovie(id: string, lang: string) {
  try {
    const mediaInfo = await getMediaInfo(id);
    if (mediaInfo?.success) {
      const playlist = mediaInfo?.data?.playlist;

      // Case-insensitive search with fallback
      const searchLang = lang?.toLowerCase();

     let file = playlist.find((item: any) => 
        item.title.toLowerCase() === searchLang
      ) || playlist[0];

       // Filter valid languages
      const availableLang = playlist
        .map((item: any) => item.title)
        .filter((title: string) => title?.length > 0);

      if (!file) {
        file = playlist?.[0];
      }
      if (!file) {
        return { success: false, error: "No file found" };
      }
      
      const key = mediaInfo?.data?.key;
      const streamUrl = await getStreamUrl(file?.file, key);
      if (streamUrl?.success) {
        return { success: true, data: streamUrl?.data, availableLang };
      } else {
        return { success: false, error: "No stream url found" };
      }
    } else {
      return { success: false, error: "No media info found" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

interface EpisodeFile {
  title: string;
  file: string;
}

interface EpisodeFolder {
  episode: string;
  folder: EpisodeFile[];
}

interface SeasonData {
  id: string;
  folder: EpisodeFolder[];
}

interface MediaInfoResponse {
  success: boolean;
  data?: {
    playlist: SeasonData[];
    key: string;
  };
  error?: string;
}

// play episode
export async function playEpisode(
  id: string,
  season: number,
  episode: number,
  lang: string = ""
) {
  try {
    const mediaInfo: MediaInfoResponse = await getMediaInfo(id);
    if (!mediaInfo?.success || !mediaInfo.data?.playlist) {
      return { success: false, error: "No media info found" };
    }
    const playlist = mediaInfo?.data?.playlist;
    const getSeason = playlist.find(
      (item: any) => item?.id === season.toString()
    );
    if (!getSeason) {
      return { success: false, error: "No season found" };
    }
    const getEpisode = getSeason?.folder.find(
      (item: any) => item?.episode === episode.toString()
    );
    if (!getEpisode) {
      return { success: false, error: "No episode found" };
    }

    const langLower = lang?.toLowerCase() || "";
    let file = getEpisode?.folder.find((item: any) => item?.title?.toLowerCase() === langLower);
    if (!file) {
      file = getEpisode?.folder?.[0];
    }
    if (!file) {
      return { success: false, error: "No file found" };
    }
    const availableLang = getEpisode?.folder.map((item: any) => {
      return item?.title;
    });
    const filterLang = availableLang.filter((item: any) => item?.length > 0);
    const key = mediaInfo?.data?.key;
    const streamUrl = await getStreamUrl(file?.file, key);
    if (streamUrl?.success) {
      return {
        success: true,
        data: streamUrl?.data,
        availableLang: getEpisode.folder
            .map(f => f.title)
            .filter(title => title?.length > 0)
      };
    } else {
      return { success: false, error: "No stream url found" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
}

// get season and episode and lang list
export async function getSeasonList(id: string) {
  try {
    const response = await fetch(
      `${process.env.STREAM_API}/getSeasonList?id=${id}`,
      {
        cache: "no-cache",
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Check if response is ok
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return { success: false, error: `HTTP error! status: ${response.status}` };
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Received non-JSON response:", contentType);
      return { success: false, error: "Invalid response format" };
    }

    const data = await response.json();
    
    // Validate data structure
    if (!data || !Array.isArray(data?.data?.seasons)) {
      console.error("Invalid data structure received:", data);
      return { success: false, error: "Invalid data structure" };
    }

    return data;
  } catch (error) {
    console.error("Error fetching season list:", error);
    return { success: false, error: "Failed to fetch season list" };
  }
}

export async function getEpisodeInfo(tmdbId: string, seasonNumber: number, episodeNumber: number) {
  try {
    // Fetch episode details from TMDB
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch episode info');
    }
    
    const episodeData = await response.json();
    
    // Get the TV show details to extract the IMDB ID
    const showResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
    );
    
    if (!showResponse.ok) {
      throw new Error('Failed to fetch show external IDs');
    }
    
    const externalIds = await showResponse.json();
    
    // Return combined data
    return {
      ...episodeData,
      imdbId: externalIds.imdb_id
    };
  } catch (error) {
    console.error('Error fetching episode info:', error);
    return {
      name: 'Episode not found',
      overview: 'Unable to load episode information',
      still_path: '',
      air_date: '',
      vote_average: 0,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      imdbId: ''
    };
  }
}

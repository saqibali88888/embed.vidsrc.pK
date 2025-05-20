import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  
  // If URL is /movie/stream/tt123456
  if (url.pathname.startsWith("/movie/stream/")) {
    const parts = url.pathname.split("/");
    
    if (parts.length === 4 && parts[3].startsWith("tt")) {
      // Create the clean URL
      const newUrl = new URL(url.toString());
      newUrl.pathname = `/movie/${parts[3]}`;
      
      // Redirect to the clean URL - this changes what's shown in the browser
      return NextResponse.redirect(newUrl);
    }
  }
  
  // If URL is /movie/tt123456
  if (url.pathname.startsWith("/movie/")) {
    const parts = url.pathname.split("/");
    
    if (parts.length === 3 && parts[2].startsWith("tt")) {
      // Rewrite to the stream URL internally - this keeps the clean URL visible
      return NextResponse.rewrite(new URL(`/movie/stream/${parts[2]}`, url.origin));
    }
  }

   // If URL is /tv/stream/tt123456/1-1
   if (url.pathname.startsWith("/tv/stream/")) {
    const parts = url.pathname.split("/");

    if (parts.length === 5 && parts[3].startsWith("tt")) {
      // Create the clean URL
      const newUrl = new URL(url.toString());
      newUrl.pathname = `/tv/${parts[3]}/${parts[4]}`;

      // Redirect to the clean URL - this changes what's shown in the browser
      return NextResponse.redirect(newUrl);
    }
  }

   // If URL is /tv/tt123456/1-1
   if (url.pathname.startsWith("/tv/")) {
    const parts = url.pathname.split("/");

    if (parts.length === 4 && parts[2].startsWith("tt")) {
      // Rewrite to the stream URL internally - this keeps the clean URL visible
      return NextResponse.rewrite(new URL(`/tv/stream/${parts[2]}/${parts[3]}`, url.origin));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/movie/stream/:path*",
    "/movie/:path*",
    "/tv/stream/:path*",
    "/tv/:path*"
  ]
};
// Récupère les dernières vidéos de la chaîne via le flux RSS public de YouTube.
// Aucune clé API nécessaire. Le flux est lu au moment du build : les vidéos se
// mettent donc à jour à chaque déploiement (voir .github/workflows/daily-rebuild.yml).

export interface Video {
  id: string;
  title: string;
  published: Date;
  url: string;
  thumbnail: string;
}

const FEED = "https://www.youtube.com/feeds/videos.xml";

const decodeXml = (text: string) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const parseFeed = (xml: string) =>
  xml
    .split("<entry>")
    .slice(1)
    .map((entry) => {
      const pick = (re: RegExp) => entry.match(re)?.[1] ?? "";
      const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      return {
        id,
        title: decodeXml(pick(/<title>([^<]*)<\/title>/)),
        published: new Date(pick(/<published>([^<]+)<\/published>/)),
        link: pick(/<link rel="alternate" href="([^"]+)"/),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    })
    .filter((video) => video.id);

const fetchFeed = async (query: string) => {
  const res = await fetch(`${FEED}?${query}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}`);
  return parseFeed(await res.text());
};

async function loadVideos(channelId: string, limit: number): Promise<Video[]> {
  try {
    // La playlist « UULF » contient uniquement les vidéos longues (sans les Shorts)
    const longVideos = await fetchFeed(
      `playlist_id=UULF${channelId.replace(/^UC/, "")}`,
    );
    if (longVideos.length >= limit) return longVideos.slice(0, limit);
  } catch (error) {
    console.warn("[youtube] flux sans Shorts indisponible :", error);
  }
  try {
    const all = await fetchFeed(`channel_id=${channelId}`);
    return all
      .filter((video) => !video.link.includes("/shorts/"))
      .slice(0, limit);
  } catch (error) {
    // Le site se construit quand même : la section affiche un lien vers la chaîne
    console.warn("[youtube] flux RSS indisponible :", error);
    return [];
  }
}

// Un seul appel réseau par build, partagé entre les pages FR et EN
const cache = new Map<string, Promise<Video[]>>();

export function getLatestVideos(channelId: string, limit = 3) {
  const key = `${channelId}:${limit}`;
  if (!cache.has(key)) cache.set(key, loadVideos(channelId, limit));
  return cache.get(key)!;
}

import * as fsPromises from "fs/promises";
import { Entry } from "./getEntries";
import naturalCompare from "string-natural-compare";
import path from "path";

export interface Episode {
  id: number;
  title: string;
  num: string;
  absPath: string;
}

export interface Episodes {
  episode: Episode[];
  ova: Episode[];
  movie: Episode[];
}

export const getEntryEpisodes = async (entry: Entry) => {
  let entries = await fsPromises.readdir(entry.absPath, { withFileTypes: true });
  entries = entries.filter((file) => !/(^|\/)\.[^\\/\\.]/g.test(file.name));
  entries = entries.filter((file) => file.isFile());
  entries = entries.filter((file) => !file.name.match(/\.(gif|jpe?g|tiff?|png|webp|bmp|txt)$/i));

  const episodes: Episodes = {
    episode: [],
    ova: [],
    movie: [],
  };

  let id = 0;

  for (const episodeFile of entries) {
    if (entry.type === "series") {
      const episodeMatch = episodeFile.name.match(/^\bep\S*\s*\d*(?:(?:(?:\.|~)(?=\d))\d)?/gi);
      const episode = episodeMatch ? (episodeMatch[0] as string) : null;

      const ovaMatch = episodeFile.name.match(/^\bova\s*\d*(?:(?:\.(?=\d))\d)?/gi);
      const ova = ovaMatch ? (ovaMatch[0] as string) : null;

      const movieMatch = episodeFile.name.match(/^\bmovie\s*\d*(?:(?:\.(?=\d))\d)?/gi);
      const movie = movieMatch ? (movieMatch[0] as string) : null;

      let title: string = episodeFile.name
        .replace(/^\bep\S*\s*\d*(?:(?:(?:\.|~)(?=\d))\d)?/gi, "")
        .replace(/^\bova\s*\d*(?:(?:\.(?=\d))\d)?/gi, "")
        .replace(/^\bmovie\s*\d*(?:(?:\.(?=\d))\d)?/gi, "")
        .replace(/^\s*\\-*\s*/gi, "")
        .replace(".mkv", "")
        .replace(".mp4", "")
        .replace(".webm", "")
        .replace(" - ", "");

      if (title.match(/^\./gi)) {
        title = "";
      }

      if (episode) {
        const itemNumMatch = episode.match(/\d+|\.|~/gi);
        const itemNum = itemNumMatch ? (itemNumMatch.join("") as string) : "";
        episodes.episode.push({ id, title, num: itemNum, absPath: path.join(entry.absPath, episodeFile.name) });
      } else if (ova) {
        const itemNumMatch = ova.match(/\d+|\./gi);
        const itemNum = itemNumMatch ? (itemNumMatch.join("") as string) : "";
        episodes.ova.push({ id, title, num: itemNum, absPath: path.join(entry.absPath, episodeFile.name) });
      } else if (movie) {
        const itemNumMatch = movie.match(/\d+|\./gi);
        const itemNum = itemNumMatch ? (itemNumMatch.join("") as string) : "";
        episodes.movie.push({ id, title, num: itemNum, absPath: path.join(entry.absPath, episodeFile.name) });
      } else {
        // set the number to title if there's no "Episode 01" scheme followed
        episodes.episode.push({ id, title: "", num: title, absPath: path.join(entry.absPath, episodeFile.name) });
      }
    } else {
      const itemNum = "1";

      let title: string = episodeFile.name
        .replace(".mkv", "")
        .replace(".mp4", "")
        .replace(".webm", "")
        .replace(" - ", "");

      if (title.match(/^\./gi)) {
        title = "";
      }

      episodes.episode.push({
        id,
        title: entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
        num: itemNum,
        absPath: path.join(entry.absPath, episodeFile.name),
      });
    }

    id += 1;
  }

  if (entry.type === "series") {
    episodes.episode = episodes.episode.sort((a, b) => naturalCompare(a.num, b.num, { caseInsensitive: true }));
    episodes.ova = episodes.ova.sort((a, b) => naturalCompare(a.num, b.num, { caseInsensitive: true }));
    episodes.movie = episodes.movie.sort((a, b) => naturalCompare(a.num, b.num, { caseInsensitive: true }));
  }

  return episodes;
};

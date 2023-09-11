import * as fsPromises from "fs/promises";
import * as path from "path";

export interface Entry {
  id: number;
  title: string;
  creator: string;
  absPath: string;
  type: "series" | "short" | "shot";
}

export const getEntries = async (dir: string) => {
  // get all folders inside of dir/Series without hidden files
  let series = await fsPromises.readdir(path.join(dir, "Series"), { withFileTypes: true });
  series = series.filter((file) => !/(^|\/)\.[^\\/\\.]/g.test(file.name));
  series = series.filter((file) => file.isDirectory());

  // get all folders inside of dir/Shorts without hidden files
  let shorts = await fsPromises.readdir(path.join(dir, "Shorts"), { withFileTypes: true });
  shorts = shorts.filter((file) => !/(^|\/)\.[^\\/\\.]/g.test(file.name));
  shorts = shorts.filter((file) => file.isDirectory());

  // get all folders inside of dir/Shots without hidden files
  let shots = await fsPromises.readdir(path.join(dir, "Shots"), { withFileTypes: true });
  shots = shots.filter((file) => !/(^|\/)\.[^\\/\\.]/g.test(file.name));
  shots = shots.filter((file) => file.isDirectory());

  const entries: Entry[] = [];
  let id = 0;

  // add all series to entries
  for (const entryDir of series) {
    const title = entryDir.name.replace(/^\[[^\]]+\] /g, "");
    const absPath = path.join(dir, "Series", entryDir.name);

    const creatorMatch = entryDir.name.match(/^\[[^\]]+\]/g);
    const creator = creatorMatch ? (creatorMatch[0] as string) : "";

    id += 1;
    entries.push({ id, title, creator, absPath, type: "series" });
  }

  // add all shorts to entries
  for (const entryDir of shorts) {
    const title = entryDir.name.replace(/^\[[^\]]+\] /g, "");
    const absPath = path.join(dir, "Shorts", entryDir.name);

    const creatorMatch = entryDir.name.match(/^\[[^\]]+\]/g);
    const creator = creatorMatch ? (creatorMatch[0] as string) : "";

    id += 1;
    entries.push({ id, title, creator, absPath, type: "short" });
  }

  // add all shots to entries
  for (const entryDir of shots) {
    const title = entryDir.name.replace(/^\[[^\]]+\] /g, "");
    const absPath = path.join(dir, "Shots", entryDir.name);

    const creatorMatch = entryDir.name.match(/^\[[^\]]+\]/g);
    const creator = creatorMatch ? (creatorMatch[0] as string) : "";

    id += 1;
    entries.push({ id, title, creator, absPath, type: "shot" });
  }

  return entries;
};

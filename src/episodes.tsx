import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { Entry } from "./utils/getEntries";
import { Episodes, getEntryEpisodes } from "./utils/getEntryEpisodes";

export default function EpisodeList({ entry }: { entry: Entry }) {
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<Episodes>({ episode: [], ova: [], movie: [] });

  // get episodes of entry
  useEffect(() => {
    (async () => {
      const episodes = await getEntryEpisodes(entry);
      setEpisodes(episodes);
    })();
  }, []);

  // set loading to false when episodes are loaded
  useEffect(() => {
    if (episodes.episode.length > 0 || episodes.ova.length > 0 || episodes.movie.length > 0) {
      setLoading(false);
    }
  }, [episodes]);

  return (
    <List isLoading={loading} navigationTitle={`${entry.creator} ${entry.title}`}>
      {episodes.episode.length > 0 && (
        <List.Section title="Episodes">
          {episodes.episode.map((episode) => (
            <List.Item
              key={episode.id}
              title={episode.num.toString()}
              subtitle={episode.title === "" ? `Episode` : episode.title}
              actions={
                <ActionPanel>
                  <Action.Open title="Watch" icon={Icon.Video} target={episode.absPath} />
                  <Action.ShowInFinder title="Open in Finder" icon={Icon.Folder} path={episode.absPath} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
      {episodes.ova.length > 0 && (
        <List.Section title="OVAs">
          {episodes.ova.map((ova) => (
            <List.Item key={ova.id} title={ova.num.toString()} subtitle={ova.title} />
          ))}
        </List.Section>
      )}
      {episodes.movie.length > 0 && (
        <List.Section title="Movies">
          {episodes.movie.map((movie) => (
            <List.Item key={movie.id} title={movie.num.toString()} subtitle={movie.title} />
          ))}
        </List.Section>
      )}
    </List>
  );
}

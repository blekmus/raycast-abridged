import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { Entry } from "./utils/getEntries";
import { Episodes, getEntryEpisodes } from "./utils/getEntryEpisodes";
import EpisodeMetadata from "./metadata";

export default function EpisodeList({ entry }: { entry: Entry }) {
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<Episodes>({ episode: [], ova: [], movie: [] });
  const [showMetadata, setShowMetadata] = useState(true);

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
    <List isLoading={loading} navigationTitle={`${entry.creator} ${entry.title}`} isShowingDetail={showMetadata}>
      {episodes.episode.length > 0 && (
        <List.Section title="Episodes">
          {episodes.episode.map((episode) => (
            <List.Item
              key={episode.id}
              title={episode.num.toString()}
              subtitle={episode.title === "" ? "Episode" : episode.title}
              detail={showMetadata ? <EpisodeMetadata episode={episode} /> : ""}
              actions={
                <ActionPanel>
                  <Action.Open title="Watch" icon={Icon.Video} target={episode.absPath} />
                  <Action.ShowInFinder title="Open in Finder" icon={Icon.Folder} path={episode.absPath} />
                  <Action.Open
                    title="Open in Terminal"
                    icon={Icon.Terminal}
                    target={entry.absPath}
                    application={"com.googlecode.iterm2"}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />
                  <Action
                    icon={Icon.Info}
                    title="Show Video Metadata"
                    onAction={async () => {
                      setShowMetadata(!showMetadata);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
      {episodes.ova.length > 0 && (
        <List.Section title="OVAs">
          {episodes.ova.map((ova) => (
            <List.Item
              key={ova.id}
              title={ova.num.toString()}
              subtitle={ova.title}
              detail={showMetadata ? <EpisodeMetadata episode={ova} /> : ""}
              actions={
                <ActionPanel>
                  <Action.Open title="Watch" icon={Icon.Video} target={ova.absPath} />
                  <Action.ShowInFinder title="Open in Finder" icon={Icon.Folder} path={ova.absPath} />
                  <Action.Open
                    title="Open in Terminal"
                    icon={Icon.Terminal}
                    target={entry.absPath}
                    application={"com.googlecode.iterm2"}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />
                  <Action
                    icon={Icon.Info}
                    title="Show Video Metadata"
                    onAction={async () => {
                      setShowMetadata(!showMetadata);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
      {episodes.movie.length > 0 && (
        <List.Section title="Movies">
          {episodes.movie.map((movie) => (
            <List.Item
              key={movie.id}
              title={movie.num.toString()}
              subtitle={movie.title}
              detail={showMetadata ? <EpisodeMetadata episode={movie} /> : ""}
              actions={
                <ActionPanel>
                  <Action.Open title="Watch" icon={Icon.Video} target={movie.absPath} />
                  <Action.ShowInFinder title="Open in Finder" icon={Icon.Folder} path={movie.absPath} />
                  <Action.Open
                    title="Open in Terminal"
                    icon={Icon.Terminal}
                    target={entry.absPath}
                    application={"com.googlecode.iterm2"}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />
                  <Action
                    icon={Icon.Info}
                    title="Show Video Metadata"
                    onAction={async () => {
                      setShowMetadata(!showMetadata);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

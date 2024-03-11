import { List } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { useMemo } from "react";
import { Episode } from "./utils/getEntryEpisodes";

function formatDate(inputDate: string) {
  const year = inputDate.substring(0, 4);
  const month = parseInt(inputDate.substring(4, 6), 10);
  const day = inputDate.substring(6, 8);

  const dateObject = new Date(`${year}-${month}-${day}`);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObject);

  return formattedDate;
}

export default function EpisodeMetadata({ episode }: { episode: Episode }) {
  try {
    const { isLoading, data, error } = useExec("/opt/homebrew/bin/ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      episode.absPath,
    ]);

    if (error) {
      return <List.Item.Detail isLoading={false} markdown="No metadata available" />;
    }

    if (data) {
      // too lazy to type this out
      const results: any = useMemo(() => JSON.parse(data), [data]);

      if (results.streams) {
        const imageStream = results.streams.find((stream: any) => stream.codec_type === "video");
        if (imageStream) {
          const image = imageStream.tags?.comment;
          if (image) {
            return (
              <List.Item.Detail
                isLoading={isLoading}
                markdown={results.format?.tags?.DESCRIPTION}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Title" text={results.format?.tags?.title} />
                    <List.Item.Detail.Metadata.Label title="Producer" text={results.format?.tags?.ARTIST} />
                    <List.Item.Detail.Metadata.Label title="Date" text={formatDate(results.format?.tags?.DATE)} />
                    <List.Item.Detail.Metadata.Separator />
                    {results.format?.tags?.PURL && results.format?.tags?.PURL.includes("youtube") && (
                      <List.Item.Detail.Metadata.Link title="Link" target={results.format?.tags?.PURL} text={"youtube.com"} />
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            );
          }
        }
      }

      return (
        <List.Item.Detail
          isLoading={isLoading}
          markdown={results.format?.tags?.DESCRIPTION}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Title" text={results.format?.tags?.title} />
              <List.Item.Detail.Metadata.Label title="Producer" text={results.format?.tags?.ARTIST} />
              <List.Item.Detail.Metadata.Label title="Date" text={formatDate(results.format?.tags?.DATE)} />
              <List.Item.Detail.Metadata.Separator />
              {results.format?.tags?.PURL && results.format?.tags?.PURL.includes("youtube") && (
                <List.Item.Detail.Metadata.Link title="Link" target={results.format?.tags?.PURL} text={"youtube.com"} />
              )}
            </List.Item.Detail.Metadata>
          }
        />
      );
    } else {
      return <List.Item.Detail isLoading={false} />;
    }

    // if there's an image attached, show it
  } catch (error) {
    return <List.Item.Detail isLoading={true} />;
  }
}

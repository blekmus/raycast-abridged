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
    const { isLoading, data } = useExec("/opt/homebrew/bin/ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      episode.absPath,
    ]);

    const results: any = useMemo(() => JSON.parse(data || ""), [data]);

    if (results.format.tags) {
      return (
        <List.Item.Detail
          isLoading={isLoading}
          markdown={results.format?.tags?.DESCRIPTION || results.format?.tags?.comment}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Title" text={results.format?.tags?.title} />
              {results.format?.tags?.ARTIST && (
                <List.Item.Detail.Metadata.Label title="Producer" text={results.format?.tags?.ARTIST} />
              )}
              {results.format?.tags?.DATE && (
                <List.Item.Detail.Metadata.Label title="Date" text={formatDate(results.format?.tags?.DATE)} />
              )}

              {results.format?.tags?.PURL && results.format?.tags?.PURL.includes("youtube") && (
                <>
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Link
                    title="Link"
                    target={results.format?.tags?.PURL}
                    text={"youtube.com"}
                  />
                </>
              )}
            </List.Item.Detail.Metadata>
          }
        />
      );
    } else {
      return <List.Item.Detail isLoading={true} />;
    }

    // if there's an image attached, show it
  } catch (error) {
    console.log(error)
    return <List.Item.Detail isLoading={false} />;
  }
}

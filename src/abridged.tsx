import { Icon, List, ActionPanel, Action, Color, getPreferenceValues, openExtensionPreferences } from "@raycast/api";
import { useEffect, useState } from "react";
import { getEntries, Entry } from "./utils/getEntries";
import EpisodeList from "./episodes";
import { useCachedState } from "@raycast/utils";

interface Preferences {
  abridgedDir: string;
}

export default function Command() {
  const categoryColors = {
    series: "#B69BF1",
    shot: "#59dc9b",
    short: "#70a4ff",
    song: "#ff8c9d",
  };

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchText, setSearchText] = useCachedState<string>("search", "");
  const [filteredList, setFilteredList] = useState<Entry[]>([]);

  const preferences = getPreferenceValues<Preferences>();

  // get entries from abridged directory
  useEffect(() => {
    (async () => {
      const entries = await getEntries(preferences.abridgedDir);

      // order by title alphabetically
      entries.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1;
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        }
        return 0;
      });

      setFilteredList(entries);
      setEntries(entries);
    })();
  }, []);

  // filter based on category and search text
  useEffect(() => {
    if (category === "all") {
      if (searchText === "") {
        setFilteredList(entries);
      } else {
        setFilteredList(
          entries.filter(
            (entry) =>
              entry.title.toLowerCase().includes(searchText.toLowerCase()) ||
              entry.type.toLowerCase().includes(searchText.toLowerCase()) ||
              entry.creator.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }
    } else {
      if (searchText === "") {
        setFilteredList(entries.filter((entry) => entry.type === category));
      } else {
        setFilteredList(
          entries.filter(
            (entry) =>
              entry.type === category &&
              (entry.title.toLowerCase().includes(searchText.toLowerCase()) ||
                entry.creator.toLowerCase().includes(searchText.toLowerCase()))
          )
        );
      }
    }

    // fixes issue where no List.EmptyView is shown before entries are loaded
    if (entries && entries.length > 0) {
      setLoading(false);
    }
  }, [category, searchText, entries]);

  return (
    <List
      isLoading={loading}
      navigationTitle={`Abridged - ${category.charAt(0).toUpperCase() + category.slice(1)} (${filteredList.length})`}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown tooltip="Select Category" onChange={setCategory} storeValue={true}>
          <List.Dropdown.Item
            title="All"
            value="all"
            icon={{ source: Icon.CircleFilled, tintColor: Color.PrimaryText }}
          />
          {Object.entries(categoryColors).map(([key, color]) => (
            <List.Dropdown.Item
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              value={key}
              icon={{ source: Icon.CircleProgress100, tintColor: color }}
            />
          ))}
        </List.Dropdown>
      }
    >
      {filteredList.length > 0 &&
        filteredList.map((entry) => {
          return (
            <List.Item
              key={entry.id}
              title={entry.title}
              subtitle={entry.creator}
              keywords={[entry.creator, entry.title, entry.type]}
              accessories={[{ tag: { value: entry.type, color: categoryColors[entry.type] } }]}
              actions={
                <ActionPanel>
                  <Action.Push title="List Episodes" icon={Icon.AppWindow} target={<EpisodeList entry={entry} />} />
                  <Action.ShowInFinder title="Open in Finder" icon={Icon.Folder} path={entry.absPath} />
                  <Action.Open
                    title="Open in Terminal"
                    icon={Icon.Terminal}
                    target={entry.absPath}
                    application={"com.googlecode.iterm2"}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />

                  <ActionPanel.Section>
                    <Action
                      title="Change Abridged Directory"
                      icon={Icon.NewFolder}
                      onAction={openExtensionPreferences}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            ></List.Item>
          );
        })}
    </List>
  );
}

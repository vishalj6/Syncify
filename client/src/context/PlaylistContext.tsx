import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface PlaylistContextType {
    playlist: any[];
    setPlaylist: Dispatch<SetStateAction<any[]>>;
    playlistLink: string | null;
    setPlaylistLink: Dispatch<SetStateAction<string | null>>;
}

export const PlaylistContext = createContext<PlaylistContextType>({
    playlist: [],
    setPlaylist: () => { },
    playlistLink: null,
    setPlaylistLink: () => { },
});

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
    const [playlist, setPlaylist] = useState<any[]>([]);
    const [playlistLink, setPlaylistLink] = useState<string | null>(null);

    return (
        <PlaylistContext.Provider value={{ playlist, setPlaylist, playlistLink, setPlaylistLink }}>
            {children}
        </PlaylistContext.Provider>
    );
};

export default PlaylistProvider;

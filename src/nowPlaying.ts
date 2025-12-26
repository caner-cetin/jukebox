import { fetchCoverArt } from './musicbrainz.js';
import { displayRecordingInfo, hideRecordingInfo } from './recordingInfo.js';

let currentTrack: string | null = null;
let currentArtist: string | null = null;
let hasLoadedOnce = false;

interface NowPlayingResponse {
    now_playing?: {
        song?: {
            artist?: string;
            title?: string;
            album?: string;
        };
    };
}

export async function fetchNowPlaying(): Promise<void> {
    try {
        const response = await fetch('https://radio.cansu.dev/api/nowplaying/wonderhoy');
        const data: NowPlayingResponse = await response.json();

        if (!data.now_playing?.song) return;

        const song = data.now_playing.song;
        const artist = song.artist || '';
        const title = song.title || '';

        if (currentTrack === title && currentArtist === artist) return;

        currentTrack = title;
        currentArtist = artist;

        if (!artist || !title) {
            hideRecordingInfo();
            return;
        }

        const result = await fetchCoverArt(artist, title);
        if (!result) {
            hideRecordingInfo();
            return;
        }

        displayRecordingInfo(result.recording, result.artistData);
        hasLoadedOnce = true;
    } catch (error) {
        console.error('Error fetching now playing:', error);
        
        if (!hasLoadedOnce) {
            return;
        }
        
        hideRecordingInfo();
    }
}

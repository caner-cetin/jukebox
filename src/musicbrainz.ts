export interface MusicBrainzArtist {
    id?: string;
    name?: string;
    type?: string;
    area?: { name: string };
    country?: string;
    'life-span'?: {
        begin?: string | null;
        end?: string | null;
        ended?: boolean | null;
    };
    'begin-area'?: { name: string };
    disambiguation?: string;
    tags?: Array<{ name: string; count?: number }>;
}

export interface MusicBrainzRecording {
    id?: string;
    title?: string;
    length?: number;
    'first-release-date'?: string;
    'artist-credit'?: Array<{
        artist: {
            id?: string;
            name?: string;
        };
    }>;
    releases?: Array<{
        id?: string;
        title?: string;
        country?: string;
        date?: string;
        'release-group'?: {
            'primary-type'?: string;
            'secondary-types'?: string[];
        };
    }>;
    tags?: Array<{ name: string; count?: number }>;
}

interface MusicBrainzArtistResponse {
    artists?: MusicBrainzArtist[];
}

interface MusicBrainzRecordingResponse {
    recordings?: MusicBrainzRecording[];
}

export async function fetchArtistInfo(artistName: string): Promise<MusicBrainzArtist | null> {
    try {
        const searchQuery = encodeURIComponent(`artist:"${artistName}"`);
        const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=${searchQuery}&fmt=json&limit=1`;

        const searchResponse = await fetch(searchUrl);
        const searchData: MusicBrainzArtistResponse = await searchResponse.json();

        return searchData.artists?.[0] || null;
    } catch (error) {
        console.error('Error fetching artist info:', error);
        return null;
    }
}

export async function fetchCoverArt(
    artist: string, 
    title: string
): Promise<{ recording: MusicBrainzRecording; artistData: MusicBrainzArtist | null } | null> {
    try {
        const searchQuery = encodeURIComponent(`artist:"${artist}" AND recording:"${title}"`);
        const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${searchQuery}&fmt=json&limit=1`;

        const searchResponse = await fetch(searchUrl);
        const searchData: MusicBrainzRecordingResponse = await searchResponse.json();

        const recording = searchData.recordings?.[0];
        
        if (recording) {
            let artistData: MusicBrainzArtist | null = null;
            if (recording['artist-credit'] && recording['artist-credit'].length > 0) {
                const primaryArtist = recording['artist-credit'][0].artist;
                if (primaryArtist && primaryArtist.name) {
                    artistData = await fetchArtistInfo(primaryArtist.name);
                }
            }
            
            return { recording, artistData };
        }
        return null;
    } catch (error) {
        console.error('Error fetching cover art:', error);
        return null;
    }
}

export function showCoverArt(url: string): void {
    const img = document.getElementById('coverImage') as HTMLImageElement;
    if (!img) return;
    img.src = url;
    img.onload = function() {
        img.classList.add('loaded');
    };
}

export function hideCoverArt(): void {
    const img = document.getElementById('coverImage') as HTMLImageElement;
    if (!img) return;
    img.classList.remove('loaded');
    img.src = '';
}


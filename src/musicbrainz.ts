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
        status?: string;
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

type Release = NonNullable<MusicBrainzRecording['releases']>[number];

function isOfficialAlbumOrEP(release: Release): boolean {
    if (!release) return false;
    
    const releaseGroup = release['release-group'];
    if (!releaseGroup) return false;
    
    const primaryType = releaseGroup['primary-type']?.toLowerCase();
    const secondaryTypes = releaseGroup['secondary-types']?.map(t => t.toLowerCase()) || [];
    
    if (secondaryTypes.includes('live')) return false;
    
    return primaryType === 'album' || primaryType === 'ep';
}

export async function fetchCoverArt(
    artist: string,
    title: string
): Promise<{ recording: MusicBrainzRecording; artistData: MusicBrainzArtist | null } | null> {
    try {
        const searchQuery = encodeURIComponent(
            `artist:"${artist}" AND recording:"${title}" AND status:official AND -secondarytype:live AND NOT type:video`
        );
        const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=${searchQuery}&fmt=json&limit=50`;

        const searchResponse = await fetch(searchUrl);
        const searchData: MusicBrainzRecordingResponse = await searchResponse.json();

        if (!searchData.recordings || searchData.recordings.length === 0) {
            return null;
        }

        for (const recording of searchData.recordings) {
            if (!recording.releases || recording.releases.length === 0) continue;

            const studioAlbums = recording.releases.filter(release => {
                const status = release.status?.toLowerCase();
                const primaryType = release['release-group']?.['primary-type']?.toLowerCase();
                const secondaryTypes = release['release-group']?.['secondary-types']?.map(t => t.toLowerCase()) || [];

                return status === 'official' &&
                       primaryType === 'album' &&
                       !secondaryTypes.includes('live') &&
                       !secondaryTypes.includes('compilation');
            });

            if (studioAlbums.length > 0) {
                const filteredRecording: MusicBrainzRecording = {
                    ...recording,
                    releases: studioAlbums
                };

                let artistData: MusicBrainzArtist | null = null;
                if (recording['artist-credit'] && recording['artist-credit'].length > 0) {
                    const primaryArtist = recording['artist-credit'][0].artist;
                    if (primaryArtist && primaryArtist.name) {
                        artistData = await fetchArtistInfo(primaryArtist.name);
                    }
                }

                return { recording: filteredRecording, artistData };
            }
        }

        for (const recording of searchData.recordings) {
            if (!recording.releases || recording.releases.length === 0) continue;

            const officialReleases = recording.releases.filter(release => {
                const status = release.status?.toLowerCase();
                return status === 'official' && isOfficialAlbumOrEP(release);
            });

            if (officialReleases.length > 0) {
                const filteredRecording: MusicBrainzRecording = {
                    ...recording,
                    releases: officialReleases
                };

                let artistData: MusicBrainzArtist | null = null;
                if (recording['artist-credit'] && recording['artist-credit'].length > 0) {
                    const primaryArtist = recording['artist-credit'][0].artist;
                    if (primaryArtist && primaryArtist.name) {
                        artistData = await fetchArtistInfo(primaryArtist.name);
                    }
                }

                return { recording: filteredRecording, artistData };
            }
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

    const fallbackUrl = '/public/cheee.jpg';

    img.classList.remove('loaded');
    img.onload = null;
    img.onerror = null;

    img.onload = function() {
        img.classList.add('loaded');
    };

    img.onerror = function() {
        if (!img.src || !img.src.includes('cheee.jpg')) {
            img.onload = function() {
                img.classList.add('loaded');
            };
            img.onerror = function() {
                img.classList.add('loaded');
            };
            img.src = fallbackUrl;
        } else {
            img.classList.add('loaded');
        }
    };

    img.src = url;
}

export function hideCoverArt(): void {
    const img = document.getElementById('coverImage') as HTMLImageElement;
    if (!img) return;

    const fallbackUrl = '/public/cheee.jpg';

    const currentSrc = img.src || '';
    const isAlreadyFallback = currentSrc.includes('cheee.jpg');

    if (isAlreadyFallback) {
        if (!img.classList.contains('loaded')) {
            img.classList.add('loaded');
        }
        return;
    }

    img.classList.remove('loaded');
    img.onload = function() {
        img.classList.add('loaded');
    };
    img.onerror = function() {
        img.classList.add('loaded');
    };
    img.src = fallbackUrl;
}


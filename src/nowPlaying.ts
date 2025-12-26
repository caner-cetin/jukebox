import { fetchCoverArt, showCoverArt, hideCoverArt, type MusicBrainzRecording } from './musicbrainz.js';
import { displayRecordingInfo, hideRecordingInfo } from './recordingInfo.js';

let currentTrack: string | null = null;
let currentArtist: string | null = null;
let hasLoadedOnce = false;

function updateTitleAnimation(titleElement: HTMLElement, titleWrapper: HTMLElement): void {
    setTimeout(() => {
        const containerWidth = titleElement.offsetWidth;
        const textWidth = titleWrapper.offsetWidth;
        
        if (textWidth > containerWidth) {
            const overflow = textWidth - containerWidth;
            const slideDistance = -(overflow + 20);
            const duration = Math.max(10, (textWidth / 50) * 2);
            
            titleElement.classList.add('sliding');
            titleElement.style.setProperty('--slide-distance', slideDistance + 'px');
            titleElement.style.setProperty('--slide-duration', duration + 's');
        } else {
            titleElement.classList.remove('sliding');
        }
    }, 0);
}

async function handleCoverArt(recording: MusicBrainzRecording): Promise<void> {
    const releaseId = recording?.releases?.[0]?.id;
    if (!releaseId) {
        hideCoverArt();
        return;
    }

    const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-250`;
    
    try {
        const coverResponse = await fetch(coverUrl, { method: 'HEAD' });
        
        if (coverResponse.ok) {
            showCoverArt(coverUrl);
        } else {
            hideCoverArt();
        }
    } catch (error) {
        console.error('Error checking cover art:', error);
        hideCoverArt();
    }
}

export async function fetchNowPlaying(): Promise<void> {
    try {
        const response = await fetch('https://radio.cansu.dev/status-json.xsl');
        const data = await response.json();

        if (!data.icestats?.source) return;

        const source = data.icestats.source;
        const artist = source.artist || '';
        const title = source.title || '';

        if (currentTrack === title && currentArtist === artist) return;

        currentTrack = title;
        currentArtist = artist;

        const titleElement = document.getElementById('trackTitle');
        const titleWrapper = titleElement?.querySelector('.track-title-wrapper');
        if (!titleElement || !titleWrapper) return;
        
        const titleText = title || 'Unknown Track';
        titleWrapper.textContent = titleText;
        updateTitleAnimation(titleElement, titleWrapper as HTMLElement);
        
        const trackArtist = document.getElementById('trackArtist');
        if (trackArtist) {
            trackArtist.textContent = artist || 'Unknown Artist';
        }

        if (!artist || !title) {
            hideCoverArt();
            hideRecordingInfo();
            return;
        }

        const result = await fetchCoverArt(artist, title);
        if (!result) {
            hideCoverArt();
            hideRecordingInfo();
            return;
        }

        displayRecordingInfo(result.recording, result.artistData);
        await handleCoverArt(result.recording);
        hasLoadedOnce = true;
    } catch (error) {
        console.error('Error fetching now playing:', error);
        
        hideCoverArt();
        
        if (!hasLoadedOnce) {
            return;
        }
        
        const titleElement = document.getElementById('trackTitle');
        const titleWrapper = titleElement?.querySelector('.track-title-wrapper');
        if (!titleWrapper) return;
        
        titleWrapper.textContent = 'Unable to load track info';
        if (titleElement) {
            updateTitleAnimation(titleElement, titleWrapper as HTMLElement);
        }
    }
}


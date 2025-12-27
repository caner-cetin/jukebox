import { formatDuration, formatDate, formatArtistCredit } from './utils.js';
import type { MusicBrainzArtist, MusicBrainzRecording } from './musicbrainz.js';

export function displayRecordingInfo(
    recording: MusicBrainzRecording, 
    artistData: MusicBrainzArtist | null = null
): void {
    const recordingInfoContent = document.getElementById('infoContent');
    
    if (!recordingInfoContent) return;
    
    recordingInfoContent.innerHTML = '';

    const titleItem = document.createElement('div');
    titleItem.className = 'recording-info-item';
    titleItem.innerHTML = `
        <div class="recording-info-label">Title</div>
        <div class="recording-info-value">${recording.title || 'Unknown'}</div>
    `;
    recordingInfoContent.appendChild(titleItem);

    if (recording['artist-credit'] && recording['artist-credit'].length > 0) {
        const artistItem = document.createElement('div');
        artistItem.className = 'recording-info-item';
        artistItem.innerHTML = `
            <div class="recording-info-label">Artist</div>
            <div class="recording-info-value">${formatArtistCredit(recording['artist-credit'])}</div>
        `;
        recordingInfoContent.appendChild(artistItem);
    }

    if (artistData) {
        if (artistData.type) {
            const typeItem = document.createElement('div');
            typeItem.className = 'recording-info-item';
            typeItem.innerHTML = `
                <div class="recording-info-label">Type</div>
                <div class="recording-info-value">${artistData.type}</div>
            `;
            recordingInfoContent.appendChild(typeItem);
        }

        if (artistData.area || artistData.country) {
            const areaItem = document.createElement('div');
            areaItem.className = 'recording-info-item';
            const areaName = artistData.area?.name || artistData.country || 'Unknown';
            areaItem.innerHTML = `
                <div class="recording-info-label">Country/Area</div>
                <div class="recording-info-value">${areaName}</div>
            `;
            recordingInfoContent.appendChild(areaItem);
        }

        if (artistData['life-span']) {
            const lifespan = artistData['life-span'];
            const beginDate = lifespan.begin || null;
            const endDate = lifespan.end || null;
            const ended = lifespan.ended;
            
            if (beginDate || endDate || ended !== null) {
                const lifespanItem = document.createElement('div');
                lifespanItem.className = 'recording-info-item';
                let lifespanText = '';
                if (beginDate && endDate) {
                    lifespanText = `${beginDate} - ${endDate}`;
                } else if (beginDate) {
                    lifespanText = `Since ${beginDate}`;
                } else if (endDate) {
                    lifespanText = `Until ${endDate}`;
                }
                if (ended === true) {
                    lifespanText += ' (Ended)';
                } else if (ended === false) {
                    lifespanText += ' (Active)';
                }
                lifespanItem.innerHTML = `
                    <div class="recording-info-label">Life Span</div>
                    <div class="recording-info-value">${lifespanText || 'Unknown'}</div>
                `;
                recordingInfoContent.appendChild(lifespanItem);
            }
        }

        if (artistData['begin-area']) {
            const beginAreaItem = document.createElement('div');
            beginAreaItem.className = 'recording-info-item';
            beginAreaItem.innerHTML = `
                <div class="recording-info-label">Origin</div>
                <div class="recording-info-value">${artistData['begin-area'].name}</div>
            `;
            recordingInfoContent.appendChild(beginAreaItem);
        }

        if (artistData.disambiguation) {
            const disambiguationItem = document.createElement('div');
            disambiguationItem.className = 'recording-info-item';
            disambiguationItem.innerHTML = `
                <div class="recording-info-label">About</div>
                <div class="recording-info-value">${artistData.disambiguation}</div>
            `;
            recordingInfoContent.appendChild(disambiguationItem);
        }

        if (artistData.tags && artistData.tags.length > 0) {
            const artistTagsItem = document.createElement('div');
            artistTagsItem.className = 'recording-info-item';
            const artistTagsHtml = artistData.tags.map(tag => 
                `<span class="recording-tag">${tag.name}</span>`
            ).join('');
            artistTagsItem.innerHTML = `
                <div class="recording-info-label">Artist Tags</div>
                <div class="recording-info-value">
                    <div class="recording-tags">${artistTagsHtml}</div>
                </div>
            `;
            recordingInfoContent.appendChild(artistTagsItem);
        }

        if (artistData.id) {
            const artistLinkItem = document.createElement('div');
            artistLinkItem.className = 'recording-info-item';
            artistLinkItem.innerHTML = `
                <div class="recording-info-label">Artist Page</div>
                <div class="recording-info-value">
                    <a href="https://musicbrainz.org/artist/${artistData.id}" target="_blank" rel="noopener noreferrer">
                        View Artist on MusicBrainz
                    </a>
                </div>
            `;
            recordingInfoContent.appendChild(artistLinkItem);
        }
    }

    if (recording.length) {
        const durationItem = document.createElement('div');
        durationItem.className = 'recording-info-item';
        durationItem.innerHTML = `
            <div class="recording-info-label">Duration</div>
            <div class="recording-info-value">${formatDuration(recording.length)}</div>
        `;
        recordingInfoContent.appendChild(durationItem);
    }

    if (recording['first-release-date']) {
        const dateItem = document.createElement('div');
        dateItem.className = 'recording-info-item';
        dateItem.innerHTML = `
            <div class="recording-info-label">First Released</div>
            <div class="recording-info-value">${formatDate(recording['first-release-date'])}</div>
        `;
        recordingInfoContent.appendChild(dateItem);
    }

    if (recording.tags && recording.tags.length > 0) {
        const tagsItem = document.createElement('div');
        tagsItem.className = 'recording-info-item';
        const tagsHtml = recording.tags.map(tag => 
            `<span class="recording-tag">${tag.name}</span>`
        ).join('');
        tagsItem.innerHTML = `
            <div class="recording-info-label">Tags</div>
            <div class="recording-info-value">
                <div class="recording-tags">${tagsHtml}</div>
            </div>
        `;
        recordingInfoContent.appendChild(tagsItem);
    }

    if (recording.releases && recording.releases.length > 0) {
        const releasesItem = document.createElement('div');
        releasesItem.className = 'recording-info-item recording-releases';
        releasesItem.innerHTML = `
            <div class="recording-info-label">Releases (${recording.releases.length})</div>
            <div class="recording-info-value">
                ${recording.releases.slice(0, 5).map(release => {
                    const releaseGroup = release['release-group'];
                    const releaseType = releaseGroup ? 
                        [releaseGroup['primary-type'], ...(releaseGroup['secondary-types'] || [])].filter(Boolean).join(', ') : 
                        'Unknown';
                    const country = release.country || 'Unknown';
                    const date = formatDate(release.date);
                    return `
                        <div class="recording-release-item">
                            <div class="recording-release-title">${release.title || 'Unknown'}</div>
                            <div class="recording-release-meta">${releaseType} • ${country} • ${date}</div>
                        </div>
                    `;
                }).join('')}
                ${recording.releases.length > 5 ? `<div style="margin-top: 8px; font-size: 12px; color: #666;">... and ${recording.releases.length - 5} more</div>` : ''}
            </div>
        `;
        recordingInfoContent.appendChild(releasesItem);
    }

    if (recording.id) {
        const linkItem = document.createElement('div');
        linkItem.className = 'recording-info-item';
        linkItem.innerHTML = `
            <div class="recording-info-label">MusicBrainz</div>
            <div class="recording-info-value">
                <a href="https://musicbrainz.org/recording/${recording.id}" target="_blank" rel="noopener noreferrer">
                    View on MusicBrainz
                </a>
            </div>
        `;
        recordingInfoContent.appendChild(linkItem);
    }

}

export function hideRecordingInfo(): void {
    const recordingInfoContent = document.getElementById('infoContent');
    if (!recordingInfoContent) return;
    recordingInfoContent.innerHTML = '<div class="loading">No recording information available</div>';
}


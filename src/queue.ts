interface QueueItem {
    cued_at: number;
    played_at: number;
    duration: number;
    playlist: string;
    is_request: boolean;
    song: {
        id: string;
        art: string;
        text: string;
        artist: string;
        title: string;
        album: string;
        genre: string;
        isrc: string;
        lyrics: string;
    };
    sent_to_autodj: boolean;
    is_played: boolean;
    autodj_custom_uri: string | null;
}

export async function fetchQueue(): Promise<QueueItem[]> {
    try {
        const response = await fetch('/api/station/1/queue');
        const data: QueueItem[] = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching queue:', error);
        return [];
    }
}

function formatTimeAgo(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
}

export function displayQueue(queueItems: QueueItem[]): void {
    const queueContent = document.getElementById('queueContent');
    if (!queueContent) return;

    if (queueItems.length === 0) {
        queueContent.innerHTML = '<div class="loading">No items in queue</div>';
        return;
    }

    const itemsHtml = queueItems.map((item, index) => {
        const number = index + 1;
        const song = item.song;
        const timeAgo = formatTimeAgo(item.cued_at);
        
        return `
            <div class="queue-item">
                <div class="queue-item-number">${number}</div>
                <div class="queue-item-art">
                    <img src="${song.art || '/public/cheee.jpg'}" alt="${song.title}" onerror="this.src='/public/cheee.jpg'">
                </div>
                <div class="queue-item-info">
                    <div class="queue-item-title">${song.title || 'Unknown Track'}</div>
                    <div class="queue-item-artist">${song.artist || 'Unknown Artist'} - ${song.album || 'Unknown Album'}</div>
                    <div class="queue-item-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');

    queueContent.innerHTML = itemsHtml;
}


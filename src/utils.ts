export function formatDuration(ms: number | null | undefined): string {
    if (!ms) return 'Unknown';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return dateString;
    }
}

interface ArtistCredit {
    artist: {
        name?: string;
    };
}

export function formatArtistCredit(artistCredit: ArtistCredit[] | null | undefined): string {
    if (!artistCredit || artistCredit.length === 0) return 'Unknown Artist';
    return artistCredit.map(ac => ac.artist.name || 'Unknown').join(', ');
}


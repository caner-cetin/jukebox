import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';

function init() {
    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000);
    initGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


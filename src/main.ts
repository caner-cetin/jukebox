import { setupPlayer } from './player.js';
import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';

function init() {
    setupPlayer();
    
    const coverImage = document.getElementById('coverImage') as HTMLImageElement;
    if (coverImage) {
        if (coverImage.src && coverImage.src.includes('cheee.jpg')) {
            coverImage.classList.add('loaded');
        } else if (!coverImage.src || coverImage.src === window.location.href) {
            coverImage.src = '/public/cheee.jpg';
            coverImage.onload = function() {
                coverImage.classList.add('loaded');
            };
            coverImage.onerror = function() {
                coverImage.classList.add('loaded');
            };
        }
    }
    
    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000);
    initGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


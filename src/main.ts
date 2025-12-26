import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';

function initHistoryToggle() {
    const toggleButton = document.getElementById('historyToggleButton');
    const historyEmbed = document.getElementById('historyEmbed');
    const toggleText = document.getElementById('historyToggleText');
    
    if (!toggleButton || !historyEmbed || !toggleText) return;
    
    toggleButton.addEventListener('click', () => {
        const isCollapsed = historyEmbed.classList.contains('collapsed');
        
        if (isCollapsed) {
            historyEmbed.classList.remove('collapsed');
            toggleText.textContent = 'Hide';
        } else {
            historyEmbed.classList.add('collapsed');
            toggleText.textContent = 'Show';
        }
    });
}

function init() {
    initHistoryToggle();
    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000);
    initGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


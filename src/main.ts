import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';

async function initHistoryToggle() {
    const toggleButton = document.getElementById('historyToggleButton');
    const historyPopover = document.getElementById('historyPopover');
    
    if (!toggleButton || !historyPopover) return;
    
    const { computePosition, flip, shift, offset } = window.FloatingUIDOM || {};
    if (!computePosition) {
        console.error('Floating UI not loaded');
        return;
    }
    
    let isOpen = false;
    
    async function updatePosition() {
        if (!isOpen || !historyPopover) return;
        
        const { x, y } = await computePosition(toggleButton, historyPopover, {
            placement: 'bottom-end',
            middleware: [
                offset(8),
                flip(),
                shift({ padding: 8 })
            ]
        });
        
        historyPopover.style.left = `${x}px`;
        historyPopover.style.top = `${y}px`;
    }
    
    toggleButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        
        if (!historyPopover) return;
        
        if (isOpen) {
            historyPopover.style.display = 'block';
            await updatePosition();
            
            const handleClickOutside = (event: MouseEvent) => {
                if (!historyPopover) return;
                if (!historyPopover.contains(event.target as Node) && 
                    !toggleButton.contains(event.target as Node)) {
                    isOpen = false;
                    historyPopover.style.display = 'none';
                    document.removeEventListener('click', handleClickOutside);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
        } else {
            historyPopover.style.display = 'none';
        }
    });
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
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


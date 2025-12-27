import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';
import { fetchQueue, displayQueue } from './queue.js';

function getFloatingUI() {
    const { computePosition, flip, shift, offset } = (window as any).FloatingUIDOM || {};
    if (!computePosition) {
        console.error('Floating UI not loaded');
        return null;
    }
    return { computePosition, flip, shift, offset };
}

function initPopover(
    buttonId: string,
    popoverId: string,
    placement: 'bottom-start' | 'bottom-end',
    onOpen?: () => Promise<void>
): void {
    const toggleButton = document.getElementById(buttonId);
    const popover = document.getElementById(popoverId);
    
    if (!toggleButton || !popover) return;
    
    const floatingUI = getFloatingUI();
    if (!floatingUI) return;
    
    const { computePosition, flip, shift, offset } = floatingUI;
    let isOpen = false;
    
    async function updatePosition() {
        if (!isOpen || !popover) return;
        
        const { x, y } = await computePosition(toggleButton, popover, {
            placement,
            middleware: [
                offset(8),
                flip(),
                shift({ padding: 8 })
            ]
        });
        
        popover.style.left = `${x}px`;
        popover.style.top = `${y}px`;
    }
    
    function setupClickOutside() {
        const handleClickOutside = (event: MouseEvent) => {
            if (!popover || !toggleButton) return;
            if (!popover.contains(event.target as Node) && 
                !toggleButton.contains(event.target as Node)) {
                isOpen = false;
                popover.style.display = 'none';
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }
    
    toggleButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        
        if (!popover) return;
        
        if (isOpen) {
            popover.style.display = 'block';
            if (onOpen) {
                await onOpen();
            }
            await updatePosition();
            setupClickOutside();
        } else {
            popover.style.display = 'none';
        }
    });
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
}

function initInfoToggle(): void {
    initPopover('infoToggleButton', 'infoPopover', 'bottom-start');
}

function initHistoryToggle(): void {
    initPopover('historyToggleButton', 'historyPopover', 'bottom-end');
}

function initQueueToggle(): void {
    async function loadAndDisplayQueue() {
        const queueItems = await fetchQueue();
        displayQueue(queueItems);
    }
    
    initPopover('queueToggleButton', 'queuePopover', 'bottom-start', loadAndDisplayQueue);
}

function init() {
    initInfoToggle();
    initHistoryToggle();
    initQueueToggle();
    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000);
    initGallery();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


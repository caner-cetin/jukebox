interface YuriImage {
    sample_url?: string;
    file_url?: string;
    source?: string;
}

let yuriImageCache: YuriImage[] = [];
let isLoadingYuri = false;
let autoFetchEnabled = true;
let fetchInterval: ReturnType<typeof setInterval> | null = null;
const tagSets = [
    'yuri+touhou+-loli',
    'yuri+umamusume+-loli',
    'yuri+bocchi_the_rock+-loli'
];
let currentTagIndex = 0;

function getRandomPage(): number {
    return Math.floor(Math.random() * 100);
}

function getNextTags(): string {
    const tags = tagSets[currentTagIndex];
    currentTagIndex = (currentTagIndex + 1) % tagSets.length;
    return tags;
}

export async function fetchYuriImages(): Promise<void> {
    if (isLoadingYuri) return;
    isLoadingYuri = true;

    try {
        const page = getRandomPage();
        const tags = getNextTags();
        const response = await fetch(`/api/yuri?page=${page}&limit=20&tags=${encodeURIComponent(tags)}`);
        const data: YuriImage[] = await response.json();

        if (data && data.length > 0) {
            yuriImageCache.push(...data);

            if (yuriImageCache.length > 50) {
                const itemsToRemove = yuriImageCache.length - 50;
                const galleryScroll = document.getElementById('galleryScroll');
                if (galleryScroll && galleryScroll.children.length > 0) {
                    const currentItems = Array.from(galleryScroll.children) as HTMLElement[];
                    const itemsToFadeOut = currentItems.slice(0, itemsToRemove * 2);
                    
                    itemsToFadeOut.forEach((item) => {
                        item.style.transition = 'opacity 0.5s ease-out';
                        item.style.opacity = '0';
                    });
                    
                    setTimeout(() => {
                        yuriImageCache = yuriImageCache.slice(itemsToRemove);
                        updateGalleryDisplay();
                    }, 500);
                    return;
                } else {
                    yuriImageCache = yuriImageCache.slice(itemsToRemove);
                }
            }

            updateGalleryDisplay();
        }
    } catch (error) {
        const galleryScroll = document.getElementById('galleryScroll');
        if (yuriImageCache.length === 0 && galleryScroll) {
            galleryScroll.innerHTML = '<div class="loading">Failed to load images.</div>';
        }
    } finally {
        isLoadingYuri = false;
    }
}

function createYuriItem(item: YuriImage, index: number): HTMLElement {
    const yuriItem = document.createElement('div');
    yuriItem.className = 'yuri-item';
    yuriItem.style.opacity = '0';
    yuriItem.style.transition = 'opacity 0.5s ease-in';

    const img = document.createElement('img');
    img.src = item.sample_url || item.file_url || '';
    img.alt = 'Yuri image';
    img.loading = 'lazy';

    yuriItem.appendChild(img);

    if (item.source) {
        const sourceLink = document.createElement('a');
        sourceLink.href = item.source;
        sourceLink.className = 'source-link';
        sourceLink.textContent = 'source';
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        yuriItem.appendChild(sourceLink);
    }

    requestAnimationFrame(() => {
        yuriItem.style.opacity = '1';
    });

    return yuriItem;
}

function updateGalleryDisplay(): void {
    const galleryScroll = document.getElementById('galleryScroll');
    if (!galleryScroll) return;

    if (yuriImageCache.length === 0) return;

    const allItems = [...yuriImageCache, ...yuriImageCache];
    const currentItems = Array.from(galleryScroll.children) as HTMLElement[];
    const currentCount = currentItems.length;
    const targetCount = allItems.length;

    if (currentCount === 0) {
        allItems.forEach((item, index) => {
            const yuriItem = createYuriItem(item, index);
            galleryScroll.appendChild(yuriItem);
        });
        return;
    }

    if (targetCount > currentCount) {
        const newItems = allItems.slice(currentCount);
        newItems.forEach((item, index) => {
            const yuriItem = createYuriItem(item, currentCount + index);
            galleryScroll.appendChild(yuriItem);
        });
    } else if (targetCount < currentCount) {
        const itemsToRemove = currentCount - targetCount;
        const itemsToFadeOut = Array.from(galleryScroll.children).slice(0, itemsToRemove) as HTMLElement[];
        
        itemsToFadeOut.forEach((item) => {
            item.style.transition = 'opacity 0.5s ease-out';
            item.style.opacity = '0';
            setTimeout(() => {
                if (item.parentNode === galleryScroll) {
                    galleryScroll.removeChild(item);
                }
            }, 500);
        });
    }
}

export function toggleAutoFetch(enabled: boolean): void {
    autoFetchEnabled = enabled;
    const galleryScroll = document.getElementById('galleryScroll');

    if (enabled) {
        galleryScroll?.classList.remove('paused');
        if (!fetchInterval) {
            fetchInterval = setInterval(() => {
                if (autoFetchEnabled) {
                    fetchYuriImages();
                }
            }, 10000);
        }
    } else {
        galleryScroll?.classList.add('paused');
        if (fetchInterval) {
            clearInterval(fetchInterval);
            fetchInterval = null;
        }
    }
}

export function initGallery(): void {
    const toggle = document.getElementById('autoFetchToggle') as HTMLInputElement;
    if (toggle) {
        toggle.addEventListener('change', function(e) {
            const target = e.target as HTMLInputElement;
            toggleAutoFetch(target.checked);
        });
    }

    fetchYuriImages();
    fetchInterval = setInterval(() => {
        if (autoFetchEnabled) {
            fetchYuriImages();
        }
    }, 10000);
}


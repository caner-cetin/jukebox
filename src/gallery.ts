interface YuriImage {
    sample_url?: string;
    file_url?: string;
    source?: string;
}

declare const anime: any;

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
                yuriImageCache = yuriImageCache.slice(itemsToRemove);
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

function createYuriItem(item: YuriImage): HTMLElement {
    const yuriItem = document.createElement('div');
    yuriItem.className = 'yuri-item';

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

    return yuriItem;
}

function updateGalleryDisplay(): void {
    const galleryScroll = document.getElementById('galleryScroll');
    if (!galleryScroll) return;

    if (yuriImageCache.length === 0) return;

    const allItems = [...yuriImageCache, ...yuriImageCache];
    const currentItems = Array.from(galleryScroll.children).filter(
        (child) => child.classList.contains('yuri-item')
    ) as HTMLElement[];

    if (currentItems.length === 0) {
        allItems.forEach((item) => {
            const yuriItem = createYuriItem(item);
            yuriItem.style.opacity = '0';
            galleryScroll.appendChild(yuriItem);
        });

        const itemWidth = 315;
        const totalWidth = allItems.length * itemWidth;
        const scrollDistance = totalWidth / 2;
        galleryScroll.style.setProperty('--scroll-distance', `-${scrollDistance}px`);

        if (typeof anime !== 'undefined') {
            anime({
                targets: galleryScroll.querySelectorAll('.yuri-item'),
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad',
                delay: anime.stagger(50)
            });
        } else {
            currentItems.forEach((item) => {
                item.style.opacity = '1';
            });
        }
        return;
    }

    const targetCount = allItems.length;
    const currentCount = currentItems.length;

    if (targetCount > currentCount) {
        const computedStyle = window.getComputedStyle(galleryScroll);
        const matrix = new DOMMatrix(computedStyle.transform);
        const currentTranslateX = matrix.m41;
        const wasPaused = galleryScroll.classList.contains('paused');
        const animation = computedStyle.animation;
        const animationDuration = parseFloat(computedStyle.animationDuration) * 1000;
        
        galleryScroll.classList.add('paused');
        
        const newItems = allItems.slice(currentCount);
        const newElements: HTMLElement[] = [];

        newItems.forEach((item) => {
            const yuriItem = createYuriItem(item);
            yuriItem.style.opacity = '0';
            galleryScroll.appendChild(yuriItem);
            newElements.push(yuriItem);
        });

        const itemWidth = 315;
        const oldTotalWidth = currentCount * itemWidth;
        const oldScrollDistance = oldTotalWidth / 2;
        const totalWidth = targetCount * itemWidth;
        const scrollDistance = totalWidth / 2;
        galleryScroll.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
        
        if (currentTranslateX !== 0 && oldScrollDistance !== 0 && !wasPaused) {
            const currentProgress = Math.abs(currentTranslateX) / Math.abs(oldScrollDistance);
            const newAnimationDelay = -(currentProgress * animationDuration);
            
            galleryScroll.style.animation = 'none';
            requestAnimationFrame(() => {
                galleryScroll.style.transform = `translateX(${currentTranslateX}px)`;
                galleryScroll.style.animation = `scroll ${animationDuration}ms linear infinite`;
                galleryScroll.style.animationDelay = `${newAnimationDelay}ms`;
                if (!wasPaused) {
                    galleryScroll.classList.remove('paused');
                }
            });
        } else {
            if (!wasPaused) {
                galleryScroll.classList.remove('paused');
            }
        }

        if (typeof anime !== 'undefined') {
            anime({
                targets: newElements,
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad',
                delay: anime.stagger(50)
            });
        } else {
            newElements.forEach((item) => {
                item.style.opacity = '1';
            });
        }
    } else if (targetCount < currentCount) {
        const itemsToRemove = currentCount - targetCount;
        const itemsToFadeOut = currentItems.slice(0, itemsToRemove);

        if (typeof anime !== 'undefined') {
            anime({
                targets: itemsToFadeOut,
                opacity: [1, 0],
                duration: 500,
                easing: 'easeInQuad',
                complete: () => {
                    itemsToFadeOut.forEach((item) => {
                        if (item.parentNode === galleryScroll) {
                            galleryScroll.removeChild(item);
                        }
                    });
                }
            });
        } else {
            itemsToFadeOut.forEach((item) => {
                if (item.parentNode === galleryScroll) {
                    galleryScroll.removeChild(item);
                }
            });
        }
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

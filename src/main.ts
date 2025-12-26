import { setupPlayer } from './player.js';
import { fetchNowPlaying } from './nowPlaying.js';
import { initGallery } from './gallery.js';

setupPlayer();

fetchNowPlaying();
setInterval(fetchNowPlaying, 10000);

initGallery();


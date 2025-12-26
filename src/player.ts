export function setupPlayer(): void {
    const audioPlayer = document.getElementById('player') as HTMLAudioElement;
    if (!audioPlayer) return;
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    audioPlayer.addEventListener('error', function() {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
                audioPlayer.load();
            }, 3000);
        }
    });

    audioPlayer.addEventListener('stalled', function() {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
                audioPlayer.load();
            }, 2000);
        }
    });

    audioPlayer.addEventListener('canplay', function() {
        reconnectAttempts = 0;
    });

    audioPlayer.addEventListener('playing', function() {
        reconnectAttempts = 0;
    });
}


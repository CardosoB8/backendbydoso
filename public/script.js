const adUrls = ['', '', ''];
let countdownTime = 30;

function getRandomAds(data, count) {
    const ads = [];
    const usedIndexes = new Set();

    while (ads.length < count && ads.length < data.length) {
        const randomIndex = Math.floor(Math.random() * data.length);
        if (!usedIndexes.has(randomIndex)) {
            ads.push(data[randomIndex]);
            usedIndexes.add(randomIndex);
        }
    }

    return ads;
}

function loadAds() {
    fetch('/ads/ads.json')
        .then(response => response.json())
        .then(data => {
            const selectedAds = getRandomAds(data, 3);
            selectedAds.forEach((ad, index) => {
                const adImage = document.querySelectorAll('.ad-image')[index];
                adImage.src = ad.image;
                adUrls[index] = ad.url;
                adImage.classList.add('show');
            });
        })
        .catch(error => console.error('Erro ao carregar anúncios:', error));
}

function openAdLink(adIndex) {
    if (adUrls[adIndex]) {
        window.open(adUrls[adIndex], '_blank');
    }
}

function startCountdown() {
    const countdownElement = document.getElementById('time');
    const interval = setInterval(() => {
        countdownTime--;
        countdownElement.textContent = countdownTime;
        if (countdownTime <= 0) {
            clearInterval(interval);

            // Exibir o botão de continuar com um atraso
            setTimeout(() => {
                document.getElementById('continue-button').style.display = 'block';
                // Adicionar um atraso antes de redirecionar
                setTimeout(continueToNextPage, 20000); // Aguarda 5 segundos antes de redirecionar
            }, 3000); // Aguarda 2 segundos antes de mostrar o botão
        }
    }, 1000);
}

function continueToNextPage() {
    const alias = window.location.pathname.split('/')[2];
    window.location.href = `/veri/${alias}`;
}

function loopAds() {
    const adImages = document.querySelectorAll('.ad-image');
    let currentAdIndex = 0;

    setInterval(() => {
        adImages[currentAdIndex].classList.remove('show');
        adImages[currentAdIndex].classList.add('exit');

        setTimeout(() => {
            adImages[currentAdIndex].classList.remove('exit');
            currentAdIndex = (currentAdIndex + 1) % adImages.length;
            adImages[currentAdIndex].classList.add('show');
        }, 1000);
    }, 5000);
}

loadAds();
startCountdown();
loopAds();

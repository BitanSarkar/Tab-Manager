document.getElementById('searchInput').addEventListener('input', render);

function render () {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    if (searchText && searchText.length >= 3) {
        resultsContainer.style.display = 'block';
        chrome.tabs.query({}, function(tabs) {
            resultMatch = 0;
            tabs.forEach(tab => {
                if (searchFunctionality(tab, searchText)) {
                    const tabElement = document.createElement('div');
                    tabElement.className = 'result-item';
                    addFavIcon(tab, tabElement);
                    addTabDescription(tab, tabElement);
                    addMuteButton(tab, tabElement);
                    addCloseButton(tab, tabElement);
                    resultsContainer.appendChild(tabElement);
                    resultMatch++;
                }
            });
            if(resultMatch == 0){
                const tabElement = document.createElement('div');
                tabElement.textContent = 'No match found';
                resultsContainer.appendChild(tabElement);
            }
        });
    }
    else {
        resultsContainer.style.display = 'none';
    }
}

function searchFunctionality(tab, searchText) {
    var title = tab.title.toLowerCase();
    var url = tab.url.toLowerCase();
    searchText = searchText.toLowerCase().trim();
    const k = searchText.length;
    var maxAllowedMistakes = 0;
    if(k < 5) maxAllowedMistakes = 0;
    else if (k < 10) maxAllowedMistakes = 1;
    else if (k < 20) maxAllowedMistakes = 3;
    else if (k < 30) maxAllowedMistakes = 5;
    else maxAllowedMistakes = 10;
    var words = searchText.split(/\s+/).filter(word => word.length > 0)
    var flag = 0;
    for(var i = 0; i < words.length; i++) {
        if(title.includes(words[i]) || url.includes(words[i]))
            flag++;
    }
    return flag == words.length;
}

function addMuteButton(tab, tabElement) {
    const muteButton = document.createElement('button');
    muteButton.className = 'mute-button';

    const muteIcon = document.createElement('img');
    muteIcon.className = 'mute-icon';
    muteIcon.src = tab.mutedInfo.muted ? 'volume-mute.png' : 'volume.png'; // Use the appropriate icon based on the muted state
    muteButton.appendChild(muteIcon);

    let isMuted = tab.mutedInfo.muted;
    muteButton.onclick = function (event) {
        event.stopPropagation();
        isMuted = !isMuted;
        chrome.tabs.update(tab.id, { muted: isMuted }, function () {
            muteIcon.src = isMuted ?  'volume-mute.png' : 'volume.png'; // Update the icon based on the new muted state
        });
    };
    tabElement.appendChild(muteButton);
}


function addTabDescription(tab, tabElement) {
    const description = document.createElement('div');
    description.className = 'tab-description';
    description.textContent = `${tab.title}`;
    tabElement.appendChild(description);
    description.addEventListener('click', () => chrome.tabs.update(tab.id, { active: true }));
}

function addFavIcon(tab, tabElement) {
    const favicon = document.createElement('img');
    favicon.src = tab.favIconUrl || 'default-icon.png';
    favicon.className = 'favicon';
    favicon.alt = "";
    tabElement.appendChild(favicon);
}

function addCloseButton(tab, tabElement) {
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close tab';
    closeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        chrome.tabs.remove(tab.id, function() {
            if (!chrome.runtime.lastError) {
                render();
            } else {
                console.error('Failed to close tab:', chrome.runtime.lastError);
            }
        });
    });
    
    tabElement.appendChild(closeButton);
}
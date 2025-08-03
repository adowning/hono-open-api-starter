(function () {
    console.log('Nolimit loader.js', '1.2.439');

    var modernBrowser = 'WebSocket' in window;
    var vendorBrowser = /SamsungBrowser/.test(navigator.userAgent);
    var container = document.getElementById('container');

    var NO_LOGO_OPERATORS = ['B10', 'CMAXI', 'BETS10', 'CASINOMAXI'];
    var ADDITIONAL_LOGO_GAMES = ['Campaign'];

    const skinMap = {
        "labs":{
            color:'rgb(70,130,183)',
            logo:"logo/labs.png"
        },
        "overthelimit":{
            color:'rgb(93,93,93)',
            logo:"logo/overthelimit.png"
        }
    }

    function parseQuery() {
        var query = {};

        if (location.search.length > 0) {
            var queries = location.search.substr(1).split('&');
            for (var i = 0; i < queries.length; i++) {
                var pair = queries[i].split('=');
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
        return query;
    }

    var query = parseQuery();
    var progress = document.getElementById('progress');
    var errorLoading = false;

    function receiveMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (location.hostname.indexOf('test.') === 0) {
                console.log('Loader - message received:', event.data);
            }
             if (!errorLoading) {
                 if (data.loaderSkin !== undefined){
                     setSkin(data.loaderSkin);
                 }
                 if (data.game === 'ready') {
                       finishLoading();
                 }
                 if (data.error) {
                    if (location.hostname.indexOf('test.') === 0) {
                        console.log(event.data);
                    }
                    if (data.message) {
             			document.getElementById("containermessage").style.display = "table";
            			document.getElementById("container").style.display = "none";
                        document.getElementById('message-info').innerHTML = decodeURIComponent(data.message);
                    } else if (typeof data.error === 'string') {
            			document.getElementById("container").style.display = "none";
                        document.getElementById("containermessage").style.display = "table";
                        document.getElementById('message-info').innerHTML = decodeURIComponent(data.error);
                    } else {
                        location.href = 'error.html';
                    }
                         errorLoading = true;
                }
            }
        } catch (e) {
            console.warn('Error receiving loader message:', e);
        }
    }

    function finishLoading() {
        progress.setAttribute('class', 'finishing');
        setTimeout(onFinished, 100);
    }

    function onFinished() {
        if (!modernBrowser || vendorBrowser) {
            container.style.display = 'none';
            var unsupported = document.createElement('div');
            unsupported.id = 'unsupported';
            unsupported.innerHTML = '<p>This browser is not supported. If you have problems, please try Google Chrome!</p>';
            var okButton = document.createElement('button');
            okButton.type = 'button';
            okButton.textContent = 'Continue';
            okButton.onclick = loaderReady;
            unsupported.appendChild(okButton);
            document.body.appendChild(unsupported);
        } else {
            loaderReady();
        }
    }

    function loaderReady() {
        var message = JSON.stringify({
            loader: 'ready'
        });
        container.style.opacity = 0;
        window.parent.postMessage(message, '*');
    }

    function onLoad() {
        if (NO_LOGO_OPERATORS.indexOf(query.operator) !== -1) {
            document.getElementById('logo').style.visibility = 'hidden';
        }
        document.getElementById('container').style.opacity = 1;
        progress.setAttribute('class', 'loading');

        if (ADDITIONAL_LOGO_GAMES.indexOf(query.game) !== -1 && query.operator) {
            var operatorLogoRequest = new XMLHttpRequest();
            operatorLogoRequest.open('GET', '1.2.439/logo/' + query.operator.toLowerCase() + '.png');
            operatorLogoRequest.responseType = 'blob';
            operatorLogoRequest.onload = function () {
                if (operatorLogoRequest.status === 200) {
                    document.getElementById('operator').src = URL.createObjectURL(operatorLogoRequest.response);
                }
            };
            operatorLogoRequest.send();
        }
    }

    function setSkin(skinId){
        const skinData = skinMap[skinId] || {};
        if (skinData.color !== undefined){
            setBackground(skinData.color);
        }
        if (skinData.logo !== undefined) {
            var request = new XMLHttpRequest();
            request.open('GET',  '1.2.439/' + skinData.logo);
            request.responseType = 'blob';
            request.onload = function () {
                if (request.status === 200) {
                    const div = document.getElementById('subDiv');
                    const img = document.getElementById('sub');
                    img.src = URL.createObjectURL(request.response);
                    img.classList.add("heightAnimC");
                    div.classList.add("subDivAnim");
                }
            };
            request.send();
        }
    }

    function setBackground(fillColor){
        const svgString = `<svg xmlns='http://www.w3.org/2000/svg'
                         xmlns:xlink='http://www.w3.org/1999/xlink'
                         viewBox="0,0,100,100"
                         preserveAspectRatio="none">
            <defs>
                <rect id="shape" width="130" height="130" x="-15" y="-15" />
                <filter id="noise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="10"
                        numOctaves="1"
                        result="turbulence"
                    />
                    <feComposite operator="in" in="turbulence" in2="SourceAlpha" result="composite"/>
                    <feColorMatrix in="composite" type="luminanceToAlpha" />
                    <feBlend in="SourceGraphic" in2="composite" mode="multiply" />
                </filter>
                <mask id="gradient">
                    <radialGradient id="fade">
                        <stop offset="0%" stop-color="white" stop-opacity="1" />
                        <stop offset="100%" stop-color="white" stop-opacity="0.6" />
                    </radialGradient>
                    <use href="#shape" fill="url('#fade')" />
                </mask>
            </defs>
            <use href="#shape" fill="${fillColor}" mask="url(#gradient)" filter="url('#noise')" />
        </svg>`

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const urlObj = URL.createObjectURL(blob);
        const bg = document.body.getElementsByClassName("bg")[0]
        if (bg){
            bg.style.backgroundImage = `url(${urlObj})`;
            bg.classList.add("bgAnimation");
        }
    }

    window.addEventListener('message', receiveMessage, false);
    window.addEventListener('load', onLoad);
})();
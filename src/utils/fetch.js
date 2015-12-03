import fetch from 'isomorphic-fetch'
import checkStatus from 'utils/check-status'
import parseJson from 'utils/parse-json'
import getApiUrl from 'utils/get-api-url'

const DEFAULTS = {
    //mode: 'cors',
    method: 'get',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
}

export default function APIFetch(url, options, body) {
    if (url.indexOf('/') === 0 && url.indexOf('//') !== 0) url = getApiUrl(url)

    const fetchOptions = Object.assign(
        {},
        DEFAULTS,
        options, {body: JSON.stringify(body)}
    );

    return fetch(url, fetchOptions)
        .then(checkStatus)
        .then(parseJson)
}

export default function SpotifyFetch(url, options, body) {
    const fetchOptions = Object.assign(
        {},
        DEFAULTS,
        options, {body: JSON.stringify(body)}
    );

    return fetch("https://api.spotify.com/v1/" + url, fetchOptions)
        .then(checkStatus)
        .then(parseJson)
}


// https://api.spotify.com/v1/search?market=au&type=track&limit=50&q=
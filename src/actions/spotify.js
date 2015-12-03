import { createAction } from 'redux-actions'
import { SpotifyFetch } from 'utils/fetch';


export const SEARCH = 'SEARCH';
export const search = createAction(SEARCH, (query) => {
    return SpotifyFetch('search?market=au&type=track&limit=50&q=' + encodeURIComponent(query))
});

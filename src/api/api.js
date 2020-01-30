const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const {
  BASE_URL         , SEARCH_URL             , BROWSE_URL , 
  ANIME_VIDEO_URL  , BASE_EPISODE_IMG_URL   , 
  BASE_JIKA_URL    , BASE_MYANIME_LIST_URL
} = require('./urls');


const getAnimeVideoPromo = async(title) =>{
  const res = await cloudscraper.get(`${BASE_JIKA_URL}${title}`);
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title);
  const malId = matchAnime[0].mal_id;

  if(typeof matchAnime[0].mal_id === 'undefined') return null;

  const jikanCharactersURL = `https://api.jikan.moe/v3/anime/${malId}/videos`;
  const data = await cloudscraper.get(jikanCharactersURL);
  const body = JSON.parse(data).promo;
  const promises = [];
  
  body.map(doc =>{
    promises.push({
      title: doc.title,
      previewImage: doc.image_url,
      videoURL: doc.video_url
    });
  });

  return Promise.all(promises);
};

const getAnimeCharacters = async(title) =>{
  const res = await cloudscraper.get(`${BASE_JIKA_URL}${title}`);
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title);
  const malId = matchAnime[0].mal_id;

  if(typeof matchAnime[0].mal_id === 'undefined') return null;

  const jikanCharactersURL = `https://api.jikan.moe/v3/anime/${malId}/characters_staff`;
  const data = await cloudscraper.get(jikanCharactersURL);
  let body = JSON.parse(data).characters;

  if(typeof body === 'undefined') return null;

  const charactersId = body.map(doc =>{
    return doc.mal_id
  })
  const charactersNames = body.map(doc => {
    return doc.name;
  });
  const charactersImages = body.map(doc =>{
    return doc.image_url
  });
  const charactersRoles = body.map(doc =>{
    return doc.role
  });

  let characters = [];
  Array.from({length: charactersNames.length} , (v , k) =>{
    const id = charactersId[k];
    let name = charactersNames[k];
    let characterImg = charactersImages[k];
    let role = charactersRoles[k];
    characters.push({
      character:{
        id: id,
        name: name,
        image: characterImg,
        role: role
      }
    });
  });
  
  return Promise.all(characters);
};

const search = async(query) =>{
  const res = await cloudscraper.get(`${SEARCH_URL}${query}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    let poster = $element.find('a div.Image figure img').attr('src') ||
                 $element.find('a div.Image figure img').attr('data-cfsrc');
    
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null,
      characters: characters || null
    })))
  })
  return Promise.all(promises);
};


const animeByState = async(state , order , page ) => {
  const res = await cloudscraper.get(`${BROWSE_URL}type%5B%5D=tv&status%5B%5D=${state}&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const tv = async(order , page) => {
  const res = await cloudscraper.get(`${BROWSE_URL}type%5B%5D=tv&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const ova = async(order , page ) => {
  const res = await cloudscraper.get(`${BROWSE_URL}type%5B%5D=ova&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const special = async(order , page) => {
  const res = await cloudscraper.get(`${BROWSE_URL}type%5B%5D=special&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const movies = async(order , page) => {
  const res = await cloudscraper.get(`${BROWSE_URL}type%5B%5D=movie&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const animeByGenres = async(genre , order , page) => {
  const res = await cloudscraper.get(`${BROWSE_URL}genre%5B%5D=${genre}&order=${order}&page=${page}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];

  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').eq(1).text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return Promise.all(promises);
};

const latestEpisodesAdded = async() =>{
  const res = await cloudscraper.get(`${BASE_URL}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];
  $('div.Container ul.ListEpisodios li').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('a').attr('href').replace('/ver/' , '').trim();
    const title = $element.find('a strong.Title').text();
    const poster = BASE_URL + $element.find('a span.Image img').attr('src');
    const episode = parseInt($element.find('a span.Capi').text().match(/\d+/g) , 10);
    promises.push(getAnimeServers(id).then(servers => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      episode: episode || null,
      servers: servers || null,
    })))
  })
  return await Promise.all(promises);
};

const latestAnimeAdded = async() =>{
  const res = await cloudscraper.get(`${BASE_URL}`);
  const body = await res;
  const $ = cheerio.load(body);
  const promises = [];
  $('div.Container ul.ListAnimes li article').each((index , element) =>{
    const $element = $(element);
    const id = $element.find('div.Description a.Button').attr('href');
    const title = $element.find('a h3').text();
    const poster = BASE_URL + $element.find('a div.Image figure img').attr('src')
    const type = $element.find('div.Description p span.Type').text();
    const synopsis = $element.find('div.Description p').text().trim();
    const rating = $element.find('div.Description p span.Vts').text();
    const debut = $element.find('a span.Estreno').text().toLowerCase();
    promises.push(animeEpisodesHandler(id).then(extra => ({
      title: title || null,
      //id: id || null,
      poster: poster || null,
      synopsis: synopsis || null,
      debut: debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises);
};

const animeEpisodesHandler = async(id) =>{
  const res = await cloudscraper.get(`${BASE_URL}${id}`);
  const body = await res;
  const $ = cheerio.load(body);
  const scripts = $('script');
  const anime_info_ids = [];
  const anime_eps_data = [];
  const genres = [];
  let listByEps;
  
  $('main.Main section.WdgtCn nav.Nvgnrs a').each((index , element) =>{
    const $element = $(element);
    const genre = $element.attr('href').split('=')[1] || null;
    genres.push(genre);
  });

  try{
    Array.from({length: scripts.length} , (v , k) =>{
      const $script = $(scripts[k]);
      const contents = $script.html();
      if((contents || '').includes('var anime_info = [')) {
        let anime_info = contents.split('var anime_info = ')[1].split(';')[0];
        let dat_anime_info = JSON.parse(anime_info);
        anime_info_ids.push(dat_anime_info);
      }
      if((contents || '').includes('var episodes = [')) {
        let episodes = contents.split('var episodes = ')[1].split(';')[0];
        let eps_data = JSON.parse(episodes)
        anime_eps_data.push(eps_data);
      }
    });
    const AnimeThumbnailsId = anime_info_ids[0][0];
    const animeId = anime_info_ids[0][2];
    let nextEpisodeDate = anime_info_ids[0][3] || null
    const amimeTempList = [];
    for(const [key , value] of Object.entries(anime_eps_data)){
      let episode = anime_eps_data[key].map(x => x[0]);
      let episodeId = anime_eps_data[key].map(x => x[1]);
      amimeTempList.push(episode , episodeId);
    }
    const animeListEps = [{nextEpisodeDate: nextEpisodeDate}];
    Array.from({length: amimeTempList[1].length} , (v , k) =>{
      let data = amimeTempList.map(x => x[k]);
      let episode = data[0];
      let id = data[1];
      let imagePreview = `${BASE_EPISODE_IMG_URL}${AnimeThumbnailsId}/${episode}/th_3.jpg`
      let link = `${id}/${animeId}-${episode}`
      animeListEps.push({
        episode: episode,
        id: link,
        imagePreview
      })
    })
    //listByEps = animeListEps.reduce((id , episodes) =>{
    //  id[episodes.episode] = episodes;
    //  return id;
    //})
    listByEps = animeListEps;
  }catch(err){
    console.error(err)
  }
  return {listByEps , genres};
};

const getAnimeServers = async(id) =>{
  const res = await cloudscraper.get(`${ANIME_VIDEO_URL}${id}`);
  const body = await res;
  const $ = cheerio.load(body);
  const scripts = $('script');
  const servers = [];
  
  Array.from({length: scripts.length} , (v , k) =>{
    const $script = $(scripts[k]);
    const contents = $script.html();
    if((contents || '').includes('var videos = {')) {
      let videos = contents.split('var videos = ')[1].split(';')[0];
      let data = JSON.parse(videos)
      let serverList = data.SUB;
      servers.push(serverList)
    }
  });
  return servers[0];
};


module.exports = {
  latestAnimeAdded,
  latestEpisodesAdded,
  getAnimeVideoPromo,
  getAnimeCharacters,
  getAnimeServers,
  animeByGenres,
  animeByState,
  search,
  movies,
  special,
  ova,
  tv,
};

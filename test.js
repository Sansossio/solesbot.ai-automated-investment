;(async () => {
  const axios = require('axios')
  const qs = require('qs');
  let data = qs.stringify({
    'returnUrl': '',
    'client_id': '',
    'Email': 'me@julio.com.ve',
    'Password': 'diqnid-9hanry-Dysvev' 
  });
  
  let config = {
    method: 'post',
    url: 'https://bot.solesbot.ai/login',
    maxRedirects: 0,
    headers: { 
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Cookie': '.ASPXAUTH=735B372CBFA1EC49B3142A4D62E3E5DCACE707A1A9F7CB8D3D570D9BB65404166425971BF4EE2B7FE21F0C8F331420DF588C2E9CE6C776D54E714968398F8DC142530A5AC4055B0D8AE5B0DC98C2CECE26C6845F0D1EC1F828A72E1E7B306EFDBD68DF5E9AB1EF7A59117AD1F19DD5337064F0CCF4822EC14BA4A0743297ECB7F2AE80C95644D1DDD6DFCC07AE51DF915ED33F2EDCD7591A730716173BC6488EACE9511C463945781C03185DB1EE8D93C2DE61B3DA32207138B911755D44E92FC6222C00160A412B67B908583FE6116E6C90C8AB; __cfwaitingroom=ChhJMjhReG1NYk95YTJiNkE2eXNwNFRRPT0S8AE0bFRvcC9tY0lHZXpiUUIyRWZsMTZwZEVZNzhERnNnOXpxQlFNdk94dWRicEZzQ3ZzQjFjQ2kvVFVRL2dQVVhjeE95SitJRXlRb0xPQmgxUGVMRFlER0E3b3VoLzVuNHhHM2QwWWlaTzcyYTBtamRzbTB3TjM2b2UwMlZ6U0k3bXMyZWR1dlVlOEtmNGsrcVBoa1NQNE5kTlJvQkF2QVJkTzF6WVA2TGhmblZjR2xuejAyVk9zSXo3VVlESFBHYUU2YW1CT1dvU2QzclExVGFWMGJGM0ZNbEsxWVpvckNETDBFL1VGdnBrNGV3ZFl1UzE%3D'
    },
    data : data
  };
  
  console.log(await axios.request(config))
})()
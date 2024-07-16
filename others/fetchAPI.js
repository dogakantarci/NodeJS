const axios = require('axios');
const apiUrl = 'https://api.github.com/users/octocat';

// Veri çekme işlemi (Promises ile)
axios.get(apiUrl)
  .then(response => {
    console.log('Kullanıcı Bilgileri (Promises):', response.data);
  })
  .catch(error => {
    console.error('Bir hata oluştu (Promises):', error);
  });

// Asenkron veri çekme işlemi (async/await ile)
const fetchGitHubUserData = async () => {
  try {
    const response = await axios.get(apiUrl);
    console.log('Kullanıcı Bilgileri (async/await):', response.data);
  } catch (error) {
    console.error('Bir hata oluştu (async/await):', error);
  }
};

fetchGitHubUserData();

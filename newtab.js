
    const clientId = localStorage.getItem('unsplash_access_key');
    const clientSecret = localStorage.getItem('unsplash_client_secret');
    const accessToken = localStorage.getItem('unsplash_access_token');
    const oauthRedirectUri = window.location.origin + window.location.pathname;
    const oauthCode = new URLSearchParams(window.location.search).get('code');

    const getCurrentQuery = () => {
      const hour = new Date().getHours();
      const dayKeywords = ['nature', 'landscape'];
      const nightKeywords = ['night', 'dark', 'midnight', 'blackout', 'milky way', 'galaxy', 'snow', 'mountain'];
      const keywords = (hour >= 6 && hour < 19) ? dayKeywords : nightKeywords;
      return 'wallpaper ' + keywords.join(' ');
    };

    function fetchRandomImage() {
      const loginBtn = document.getElementById('loginBtn');
      loginBtn.style.display = 'hidden';
      
      if (!accessToken) {
        alert(`Please log in first`);
        loginBtn.style.display = 'inline-block';
        return;
      }

      const query = getCurrentQuery();
			const topics = 'bo8jQKTaE0Y,6sMVjTLSkeQ,xHxYTMHLgOc'

      fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${clientId}&count=10&topics=${topics}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(data => {

				const image = data[Math.floor(Math.random() * data.length)]

        const imageUrl = image.urls.raw; //.full
        const backgroundElement = document.getElementById('background');
        const tempImg = new Image();
        tempImg.src = imageUrl;
        tempImg.onload = () => {
          backgroundElement.style.backgroundImage = `url(${imageUrl})`;
          backgroundElement.style.opacity = 1;
          backgroundElement.style.transform = 'scale(1.005)';
        };

        document.getElementById('downloadBtn').onclick = () => {
          window.open(imageUrl, '_blank');
        };

        document.getElementById('likeBtn').onclick = () => {
          saveImageToUnsplash(image.id);
        };

        updateFooter(image.user);
      })
      .catch(error => console.error('Error fetching image:', error));
    }

    function saveImageToUnsplash(photoId) {
      const accessToken = localStorage.getItem('unsplash_access_token');
      fetch(`https://api.unsplash.com/photos/${photoId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Image liked/saved!');
        } else {
          alert('Error liking/saving image');
        }
      })
      .catch(error => console.error('Error liking/saving image:', error));
    }

    function handleLogin() {
      if (oauthCode) {
        fetch(`https://unsplash.com/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: oauthRedirectUri,
            code: oauthCode,
            grant_type: 'authorization_code'
          })
        })
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('unsplash_access_token', data.access_token);
          window.location.href = redirectUri; // Redirect to clean the URL
        })
        .catch(error => console.error('Error fetching access token:', error));
      }
    }

    function updateFooter(user) {
      document.getElementById('userAvatarLink').href = `https://unsplash.com/@${user.username}`;
      document.getElementById('userAvatar').src = `${user.profile_image.small}`;
      document.getElementById('userNameLink').href = `https://unsplash.com/@${user.username}`;
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userLocationLink').href = `https://unsplash.com/search/photos/${encodeURIComponent(user.location)}`;
      document.getElementById('userLocation').textContent = user.location;
    }

    document.getElementById('loginBtn').onclick = () => {
      const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${oauthRedirectUri}&response_type=code&scope=public+write_likes`;
      window.location.href = authUrl;
    };

    if (oauthCode) {
      handleLogin();
    }
    else {
      fetchRandomImage();
    }
document.addEventListener('DOMContentLoaded', function() {
  const searchBar = document.getElementById('search-bar');
  const locationInput = document.getElementById('location-input');
  const unitTypeInput = document.getElementById('unit-type-input');
  const searchResults = document.getElementById('search-results');
  const dataFile = 'ASSETS FROM E4.xlsx - Sheet1.csv'; // Path to your local CSV file
  const localStorageKey = 'cachedCSVData'; // Key for storing CSV data in local storage

  searchBar.addEventListener('input', function() {
      const query = searchBar.value.toLowerCase().trim();
      if (query.length > 0) {
          const cachedData = loadCachedData();
          if (cachedData) {
              displayResults(parseCSV(cachedData), query);
          }
      } else {
          clearResults();
      }
  });

  locationInput.addEventListener('input', updateSearchResults);
  unitTypeInput.addEventListener('input', updateSearchResults);

  function fetchDataAndCache() {
      fetch(dataFile)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.text();
          })
          .then(data => {
              // Cache the data in local storage
              localStorage.setItem(localStorageKey, data);
              console.log('Data cached successfully.');

              // Display results immediately from the newly fetched data
              displayResults(parseCSV(data), searchBar.value.toLowerCase().trim());
          })
          .catch(error => {
              console.error('Error fetching data:', error);
              searchResults.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
          });
  }

  function loadCachedData() {
      const cachedData = localStorage.getItem(localStorageKey);
      if (cachedData) {
          console.log('Loading data from local storage.');
          return cachedData;
      } else {
          console.log('No cached data found. Fetching from server...');
          fetchDataAndCache(); // If no data is cached, fetch and cache it
          return null;
      }
  }

  function parseCSV(csv) {
      return csv.split('\n').map(line => line.split(','));
  }

  function displayResults(data, query) {
      searchResults.innerHTML = '';
      const headers = ['Unit #', 'Unit Description', 'Department', 'Area', 'Model No.', 'Critical Unit', 'Serial No.', 'Install Date', 'Refrigerant', 'Filter Size', 'Tons', 'Asset Type', 'Location List', 'Number of Filters', 'Weight'];
      let filteredData;

      if (/^[a-zA-Z0-9]{3}$/.test(query)) {
          filteredData = data.filter(row => row[headers.indexOf('Unit #')].toLowerCase().includes(query));
      } else if (/^[a-zA-Z0-9]{4}$/.test(query)) {
          filteredData = data.filter(row => row[headers.indexOf('Serial No.')].toLowerCase().includes(query));
      } else {
          filteredData = data.filter(row => row.some(cell => cell.toLowerCase().includes(query)));
      }

      if (filteredData.length === 0) {
          searchResults.innerHTML = '<p>No results found.</p>';
      } else {
          filteredData.forEach(result => {
              const resultDiv = document.createElement('div');
              resultDiv.classList.add('result');

              headers.forEach((header, index) => {
                  const p = document.createElement('p');
                  const cellContent = result[index] || 'N/A';
                  p.innerHTML = `${header}: ${highlightMatches(cellContent, query)}`;
                  resultDiv.appendChild(p);
              });

              // Create Share Button
              const shareButton = document.createElement('button');
              shareButton.textContent = 'Share';
              shareButton.classList.add('share-button');
              shareButton.addEventListener('click', () => shareUnit(result));
              resultDiv.appendChild(shareButton);

              searchResults.appendChild(resultDiv);
          });
      }

      if (filteredData.length === 1) {
          const preciseResult = filteredData[0];
          locationInput.value = preciseResult[headers.indexOf('Location List')] || '';
          unitTypeInput.value = preciseResult[headers.indexOf('Asset Type')] || '';
      } else {
          clearAutofill();
      }
  }

  function shareUnit(unitData) {
      const uniqueId = generateUniqueId();
      const url = `${window.location.origin}/unit/${uniqueId}`;

      // Store unit data in localStorage with a timestamp for expiration
      localStorage.setItem(`unit_${uniqueId}`, JSON.stringify({
          data: unitData,
          expires: Date.now() + 24 * 60 * 60 * 1000 // Expires in 24 hours
      }));

      // Attempt to copy the URL to the clipboard
      navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
      }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy the link. Please try again.');
      });
  }

  function generateUniqueId() {
      return Math.random().toString(36).substr(2, 9);
  }

  function updateSearchResults() {
      const unitQuery = searchBar.value.toLowerCase().trim();
      const locationQuery = locationInput.value.toLowerCase().trim();
      const unitTypeQuery = unitTypeInput.value.toLowerCase().trim();

      const filteredResults = searchResults.querySelectorAll('.result');
      filteredResults.forEach(result => {
          const resultText = result.textContent.toLowerCase();
          const unitMatch = unitQuery.length === 0 || resultText.includes(unitQuery);
          const locationMatch = locationQuery.length === 0 || resultText.includes(locationQuery);
          const unitTypeMatch = unitTypeQuery.length === 0 || resultText.includes(unitTypeQuery);

          result.style.display = (unitMatch && locationMatch && unitTypeMatch) ? 'block' : 'none';
      });
  }

  function clearResults() {
      searchResults.innerHTML = '';
      clearAutofill();
  }

  function clearAutofill() {
      locationInput.value = '';
      unitTypeInput.value = '';
  }

  function highlightMatches(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, `<span class="highlight">$1</span>`);
  }
});

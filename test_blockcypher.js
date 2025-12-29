
const token = '7fd9adfa1e3f47dc8f864dbd44956ca4';
const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Genesis address (has balance)
const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=${token}`;

console.log('Fetching:', url);

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('Data:', data);
  })
  .catch(err => {
    console.error('Error:', err);
  });

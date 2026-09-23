import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Home = ({ id, account, togglePop, realEstate, realEstateMarket }) => {
  const [home, setHome] = useState(null);
  const [rate, setRate] = useState(null);

  const fetchDetails = async () => {
    try {
      console.log("Fetching home details for ID:", id);
      const tokenURI = await realEstate.getURI(id);
      const res = await fetch(tokenURI);
      const metadata = await res.json();
      setHome(metadata);
    } catch (err) {
      console.error('Error fetching home details:', err);
    }
  };

  const fetchRate = async () => {
    try {
      const response = await fetch("http://localhost:8000/eth-usd");
      const data = await response.json();
      setRate(data.eth_usd);
      console.log("ETH Rate:", data.eth_usd);
    } catch (error) {
      console.error("Error fetching ETH rate:", error);
    }
  };

  const handleBuy = async () => {
    try {
      console.log(" home:", home);
      console.log(" rate:", rate);
      console.log(" realEstateMarket:", realEstateMarket);
      if (!rate || !home || !realEstateMarket) {
        alert("Required data not loaded.");
        return;
      }
      const listing = await realEstateMarket.listings(id);
      const usdPrice = Number(listing.price);
      const ethUsdRate = Number(rate)

      // Convert USD price to ETH using rate
      const priceInEth = usdPrice / ethUsdRate;
      console.log("Price in ETH:", priceInEth);
      const valueInWei = ethers.parseEther(priceInEth.toString());

      const tx = await realEstateMarket.buyNFT(id, Math.floor(ethUsdRate), {
        value: valueInWei,
      });

      await tx.wait();
      alert("Purchase successful!");
    } catch (error) {
      console.error("Buy transaction failed:", error);
      alert("Transaction failed: " + (error.message || "Unknown error"));
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchRate();
  }, []);

  if (!home) {
    return <div>Loading home details...</div>;
  }

  return (
    <div className="home">
      <div className='home__details'>
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>
        <div className="home__overview">
          <h1>{home.name}</h1>
          <p>
            <strong>{home.rooms}</strong> bds |
            <strong>{home.bathrooms}</strong> ba |
            <strong>{home.sqm}</strong> sqft
          </p>
          <p>{home.location}</p>

          <h2>{home.price} USD</h2>
          <button className='home__buy' onClick={handleBuy}>
            Buy
          </button>
          <hr />
          <h2>Overview</h2>
          <p>{home.description}</p>
          <hr />
          <p>Year built: {home.yearBuilt}</p>
        </div>
        <button onClick={togglePop} className="home__close">
          <img src="/path/to/close-icon.svg" alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Home;

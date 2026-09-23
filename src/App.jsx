import { useState, useEffect } from 'react';
import { ethers,BrowserProvider } from 'ethers';
import config from './config.json';
import RealEstateNFT from './abis/realEstate.json';
import RealEstateMarketplace from './abis/realEstateMarket.json';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Manage from './components/Manage';
import Navigation from './components/Navigation';
import Verify from './components/Verify';
import Mint from './components/Mint';
import Home from './components/Home';

function App() {
  const [listings, setListings] = useState([]);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [realEstate, setRealEstate] = useState(null);
  const [realEstateMarket, setRealEstateMarket] = useState(null);
  const [metadataMap, setMetadataMap] = useState({});
  const [toggle, setToggle] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
    // This makes the component run the async logic after mounting
    const loadBlockchainData = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);

        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);

        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        console.log('Chain ID:', chainId);
        console.log('Network:', network);

        const realEstate = new ethers.Contract(
          config[chainId].realEstate.address,
          RealEstateNFT.abi,
          signer
        );
        setRealEstate(realEstate);

        const realEstateMarket = new ethers.Contract(
          config[chainId].market.address,
          RealEstateMarketplace.abi,
          signer
        );
        setRealEstateMarket(realEstateMarket);

        window.ethereum.on('accountsChanged', async () => {
          const newSigner = await provider.getSigner();
          const newAccount = await newSigner.getAddress();
          setAccount(newAccount);
        });

        // Fetch listings from the contract
        const listings = await realEstateMarket.getAllListings();
        const parsedListings = listings.map((l) => ({
          tokenId: l.tokenId.toString(),
          seller: l.seller,
          price: l.price,
          active: l.active,
        }));

        console.log("Loaded listings:", parsedListings);
        setListings(parsedListings);

        // Fetch metadata for each listing
        const metadataMap = {};
        for (const listing of parsedListings) {
          const tokenId = listing.tokenId;
          try {
            let uri = await realEstate.getURI(tokenId);
            if (uri.startsWith("ipfs://")) {
              uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
            }

            const response = await fetch(uri);
            const metadata = await response.json();
            metadataMap[tokenId] = metadata;
          } catch (err) {
            console.error(`Error fetching metadata for token ${tokenId}:`, err);
            metadataMap[tokenId] = null;
          }
        }

        setMetadataMap(metadataMap);
      } catch (err) {
        console.error("Failed to load blockchain data:", err);
      }
    };

    loadBlockchainData(); // Call the async function inside useEffect
  }, []); // Empty dependency array ensures it runs only once when the component mounts
  //console.log("Metadata Map:", metadataMap[1]);

  const togglePop = (id) => {
    setId(id)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
    <BrowserRouter>
      <div>
        <Navigation account={account} setAccount={setAccount} />
        <Routes>
        <Route
          path="/manage"
    element={<Manage realEstate={realEstate} realEstateMarket={realEstateMarket} account={account} />}/>
          <Route path="/verify" element={<Verify />} />
          <Route path="/mint" element={<Mint realEstate={realEstate}/>} />
        </Routes>
      </div>
      <p>Homes to buy and sell</p>
    </BrowserRouter>
    <div className="cards">
  {listings.map((l) => {
    const tokenId = l.tokenId.toString();
    const meta = metadataMap[tokenId];
    console.log("Metadata:", meta);

    // Skip if metadata hasn't loaded yet
   if (!meta) return null;

    return (
      <div
        className="card"
        key={tokenId}
        onClick={() => togglePop(tokenId)}
      >
        <div className="card__image">
          <img src={meta.image} alt="Home" />
        </div>
        <div className="card__info">
          <h4>{l.price} USD</h4>
          <p>
            <strong>{meta.rooms}</strong> bds |{" "}
            <strong>{meta.bathrooms}</strong> ba |{" "}
            <strong>{meta.sqm}</strong> sqm
          </p>
          <p>{meta.address}</p>
        </div>
      </div>
    );
  })}
</div>
{toggle && (
        <Home id={id} account={account} togglePop={togglePop} realEstate={realEstate} realEstateMarket={realEstateMarket} />
      )}

</div>
  );
}

export default App;

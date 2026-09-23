import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

function Manage({ realEstate, realEstateMarket, account }) {
  const [properties, setProperties] = useState([]);
  const [listings, setListings] = useState([]);
  const [price, setPrice] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Load owned properties with metadata
  const loadMyProperties = async () => {
    try {
      setLoading(true);
      const ids = await realEstate.getMyProperties();
      const myAssets = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i].toString();
        const asset = await realEstate.getAsset(id);
        const tokenURI = await realEstate.getURI(id);

        // Fetch metadata JSON from IPFS
        const res = await fetch(tokenURI);
        const metadata = await res.json();

        myAssets.push({
          id,
          asset,
          metadata,
        });
      }

      setProperties(myAssets);
    } catch (err) {
      console.error('Error loading my properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all marketplace listings
  const loadListings = async () => {
    try {
      const allListings = await realEstateMarket.getAllListings();
      console.log('All listings:', allListings);
      const active = allListings.map((listing) => listing.tokenId.toString());
      setListings(active);
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  const isListed = (id) => listings.includes(id);

  const handleList = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'listing' }));
      
      const tokenOwner = await realEstate.ownerOf(id);
      console.log("Token Owner:", tokenOwner);
      console.log("Sender address:", account);
  
      if (tokenOwner !== account) {
        console.error("You do not own this NFT!");
        alert("You do not own this NFT!");
        return;
      }
  
      const currentListing = await realEstateMarket.listings(id);
      if (currentListing && currentListing.active) {
        console.log("This property is already listed.");
        alert("This property is already listed.");
        return;
      }
  
      const numericId = parseInt(id);
  
      // Add approval step
      const approvalTx = await realEstate.approve(realEstateMarket.target, numericId);
      await approvalTx.wait();
      console.log("Approval successful");
  
      const listingTx = await realEstateMarket.listNFT(numericId, price[id], {
        gasLimit: 5000000,
      });
      console.log("Listing Transaction:", listingTx);
      await listingTx.wait();
  
      loadListings(); // Refresh the listings
      alert(`Property listed successfully for ${price[id]}`);
      console.log("Property listed successfully");
      
    } catch (err) {
      console.error("Error listing property:", err);
      if (err.data) {
        console.error("Error Data:", err.data);
      }
      if (err.message) {
        console.error("Error Message:", err.message);
      }
      alert("Error listing property. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleDelist = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'delisting' }));
      
      // Check if the current user is the seller
      const listing = await realEstateMarket.listings(id);
      if (listing.seller.toLowerCase() !== account.toLowerCase()) {
        console.error("You are not the seller of this NFT.");
        alert("You are not the seller of this NFT.");
        return;
      }
  
      console.log("Delisting token ID:", id);
      const tx = await realEstateMarket.delistNFT(id);
      await tx.wait();
      console.log("Successfully delisted token:", id);
  
      // Revoke approval
      const revokeTx = await realEstate.approve(ethers.ZeroAddress, id);
      await revokeTx.wait();
      console.log("Approval revoked");
  
      loadListings(); // Refresh listings
      alert("Property delisted successfully");
      
    } catch (err) {
      console.error("Error delisting property:", err);
      if (err.error?.message) {
        console.error("Revert reason:", err.error.message);
      }
      alert("Error delisting property. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handlePriceChange = (id, value) => {
    setPrice(prev => ({ ...prev, [id]: Number(value) }));
  };

  useEffect(() => {
    if (realEstate && realEstateMarket && account) {
      loadMyProperties();
      loadListings();
    }
  }, [realEstate, realEstateMarket, account]);

  if (loading) {
    return (
      <div style={{
        fontFamily: '"Open Sans", sans-serif',
        background: 'linear-gradient(135deg, #6C63FF 0%, #4c46b6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #6C63FF',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: '#6C63FF', margin: 0 }}>Loading Your Properties...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '"Open Sans", sans-serif',
      background: 'linear-gradient(135deg, #6C63FF 0%, #4c46b6 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#6C63FF',
            fontSize: '2.5em',
            fontWeight: '800',
            margin: '0 0 10px 0'
          }}>
            My Properties
          </h2>
          <p style={{
            color: '#707070',
            fontSize: '1.1em',
            margin: '0'
          }}>
            Manage your real estate NFT portfolio
          </p>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            padding: '60px 30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>🏠</div>
            <h3 style={{ color: '#707070', marginBottom: '10px' }}>No Properties Found</h3>
            <p style={{ color: '#707070' }}>You haven't minted any property NFTs yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {properties.map(({ id, asset, metadata }) => (
              <div key={id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'all 250ms ease',
                cursor: 'pointer',
                border: isListed(id) ? '2px solid #4fb646' : '1px solid #e0e0e0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
              >
                {/* Listing Status Badge */}
                {isListed(id) && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: '#4fb646',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8em',
                    fontWeight: '600',
                    zIndex: 1
                  }}>
                    ✓ LISTED
                  </div>
                )}

                {/* Property Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={metadata.image}
                    alt={asset.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f0f0f0',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3em',
                    color: '#ccc'
                  }}>
                    🏠
                  </div>
                </div>

                {/* Property Details */}
                <div style={{ padding: '25px' }}>
                  <h3 style={{
                    color: '#202020',
                    fontSize: '1.4em',
                    fontWeight: '600',
                    margin: '0 0 8px 0'
                  }}>
                    {metadata.name}
                  </h3>
                  
                  <p style={{
                    color: '#6C63FF',
                    fontSize: '1em',
                    fontWeight: '500',
                    margin: '0 0 10px 0'
                  }}>
                    📍 {asset.location}
                  </p>
                  
                  <p style={{
                    color: '#707070',
                    fontSize: '0.9em',
                    margin: '0 0 15px 0',
                    lineHeight: '1.4'
                  }}>
                    {asset.description}
                  </p>

                  {/* Property Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '6px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#202020' }}>
                        {asset.rooms}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#707070' }}>Rooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#202020' }}>
                        {asset.bathrooms}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#707070' }}>Bathrooms</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#202020' }}>
                        {asset.sqm}m²
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#707070' }}>Area</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2em', fontWeight: '600', color: '#202020' }}>
                        {asset.yearBuilt}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#707070' }}>Built</div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div>
                    {isListed(id) ? (
                      <button
                        onClick={() => handleDelist(id)}
                        disabled={actionLoading[id] === 'delisting'}
                        style={{
                          width: '100%',
                          height: '45px',
                          backgroundColor: actionLoading[id] === 'delisting' ? '#9CA3AF' : '#ef4444',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontFamily: '"Open Sans", sans-serif',
                          fontSize: '1em',
                          fontWeight: '600',
                          cursor: actionLoading[id] === 'delisting' ? 'not-allowed' : 'pointer',
                          transition: 'all 250ms ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (actionLoading[id] !== 'delisting') {
                            e.target.style.backgroundColor = '#dc2626';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (actionLoading[id] !== 'delisting') {
                            e.target.style.backgroundColor = '#ef4444';
                          }
                        }}
                      >
                        {actionLoading[id] === 'delisting' ? (
                          <>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid #ffffff',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                              marginRight: '8px'
                            }}></div>
                            Delisting...
                          </>
                        ) : (
                          '🗑️ Remove from Market'
                        )}
                      </button>
                    ) : (
                      <div>
                        <input
                          type="number"
                          placeholder="Price in USD"
                          value={price[id] || ''}
                          onChange={(e) => handlePriceChange(id, e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '1em',
                            fontFamily: '"Open Sans", sans-serif',
                            marginBottom: '15px',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
                          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                        <button
                          onClick={() => handleList(id)}
                          disabled={actionLoading[id] === 'listing' || !price[id]}
                          style={{
                            width: '100%',
                            height: '45px',
                            backgroundColor: actionLoading[id] === 'listing' ? '#9CA3AF' : 
                                           !price[id] ? '#e0e0e0' : '#4fb646',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontFamily: '"Open Sans", sans-serif',
                            fontSize: '1em',
                            fontWeight: '600',
                            cursor: actionLoading[id] === 'listing' || !price[id] ? 'not-allowed' : 'pointer',
                            transition: 'all 250ms ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (actionLoading[id] !== 'listing' && price[id]) {
                              e.target.style.backgroundColor = '#22c55e';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (actionLoading[id] !== 'listing' && price[id]) {
                              e.target.style.backgroundColor = '#4fb646';
                            }
                          }}
                        >
                          {actionLoading[id] === 'listing' ? (
                            <>
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                marginRight: '8px'
                              }}></div>
                              Listing...
                            </>
                          ) : (
                            '💰 List for Sale'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Manage;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Mint({ realEstate }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    rooms: '',
    bathrooms: '',
    sqm: '',
    yearBuilt: '',
    description: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
//ADD API KEYS FOR PINATA BELOW
  const navigate = useNavigate();
  const pinataAPI = axios.create({
    baseURL: 'https://api.pinata.cloud/pinning',
    headers: {
      'pinata_api_key': '...',
      'pinata_secret_api_key': '...',
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToIPFS = async (metadata, image) => {
    try {
      const imgForm = new FormData();
      imgForm.append('file', image);
      const imgRes = await pinataAPI.post('/pinFileToIPFS', imgForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imgURL = `https://ipfs.io/ipfs/${imgRes.data.IpfsHash}`;
      const metaWithImage = { ...metadata, image: imgURL };
      const metaRes = await pinataAPI.post('/pinJSONToIPFS', metaWithImage);
      return `https://ipfs.io/ipfs/${metaRes.data.IpfsHash}`;
    } catch (err) {
      console.error('Error uploading to IPFS', err);
      setError('Error uploading to IPFS: ' + err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const metadata = {
      name: form.name,
      location: form.location,
      rooms: form.rooms,
      bathrooms: form.bathrooms,
      sqm: form.sqm,
      yearBuilt: form.yearBuilt,
      description: form.description,
    };

    const ipfsURI = await uploadToIPFS(metadata, form.image);
    if (!ipfsURI) return setLoading(false);

    try {
      const tx = await realEstate.mintProperty(
        ipfsURI,
        metadata.name,
        metadata.location,
        metadata.description,
        metadata.rooms,
        metadata.bathrooms,
        metadata.sqm,
        metadata.yearBuilt
      );
      await tx.wait();
      setLoading(false);
      alert('NFT minted successfully!');
      navigate('/success');
    } catch (err) {
      console.error('Minting failed:', err);
      setError('Minting failed, please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '1em',
    fontFamily: '"Open Sans", sans-serif',
    transition: 'all 250ms ease',
    outline: 'none',
    backgroundColor: '#fff',
    marginBottom: '20px'
  };

  return (
    <div style={{
      fontFamily: '"Open Sans", sans-serif',
      background: 'linear-gradient(135deg, #6C63FF 0%, #4c46b6 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: '#6C63FF', fontSize: '2.5em', fontWeight: 800 }}>
              Mint Property NFT
            </h2>
            <p style={{ color: '#707070', fontSize: '1em' }}>
              Create a unique NFT for your real estate property
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #fcc',
              marginBottom: '20px',
              textAlign: 'center'
            }}>{error}</div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {/* Left column */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Property Name"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="number"
                name="rooms"
                placeholder="Number of Rooms"
                value={form.rooms}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="number"
                name="bathrooms"
                placeholder="Number of Bathrooms"
                value={form.bathrooms}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="number"
                name="sqm"
                placeholder="Square Meters"
                value={form.sqm}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="number"
                name="yearBuilt"
                placeholder="Year Built"
                value={form.yearBuilt}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                rows="4"
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Right column */}
            <div>
              <h3 style={{
                color: '#202020',
                fontSize: '1.3em',
                fontWeight: 600,
                marginBottom: '20px',
                borderBottom: '2px solid #6C63FF',
                paddingBottom: '10px'
              }}>
                Property Image
              </h3>
              <div style={{
                border: '2px dashed #6C63FF',
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#f8f9ff',
                cursor: 'pointer',
                transition: 'all 250ms ease',
                position: 'relative'
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f2ff'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9ff'}
              >
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />

                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                    />
                    <p style={{ color: '#4fb646', fontWeight: 600 }}>
                      ✓ Image selected — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '3em', color: '#6C63FF', marginBottom: '10px' }}>📷</div>
                    <p style={{ color: '#6C63FF', fontWeight: 600 }}>Click to upload image</p>
                    <p style={{ color: '#707070', fontSize: '0.9em', margin: 0 }}>
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>

              <div style={{
                backgroundColor: '#f8f9ff',
                border: '1px solid #e8ebff',
                borderRadius: '4px',
                padding: '20px',
                marginTop: '20px'
              }}>
                <h4 style={{ color: '#6C63FF', fontWeight: 600, margin: '0 0 10px 0' }}>
                  🔗 IPFS Storage
                </h4>
                <p style={{
                  color: '#707070',
                  fontSize: '0.9em',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  Your property data & image will be stored on IPFS for permanent, decentralized access.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '60px',
              backgroundColor: loading ? '#9CA3AF' : '#6C63FF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.2em',
              fontWeight: 600,
              marginTop: '30px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 250ms ease'
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#4c46b6')}
            onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#6C63FF')}
          >
            {loading ? (
              <>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #fff',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '12px'
                }} />
                {form.image ? 'Uploading & Minting...' : 'Minting NFT...'}
              </>
            ) : (
              '🏠 Mint Property NFT'
            )}
          </button>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#fff8e1',
            borderRadius: '4px',
            border: '1px solid #ffecb3'
          }}>
            <h4 style={{
              color: '#f57c00',
              fontWeight: 600,
              margin: '0 0 10px 0'
            }}>⚠️ Important Notes</h4>
            <ul style={{
              color: '#ef6c00',
              fontSize: '0.9em',
              paddingLeft: '20px',
              margin: 0,
              lineHeight: 1.6
            }}>
              <li>Ensure all property details are accurate before minting</li>
              <li>Minting creates a permanent NFT on the blockchain</li>
              <li>Gas fees will apply for the minting transaction</li>
              <li>Your wallet must be connected to complete the process</li>
            </ul>
          </div>
        </form>

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

export default Mint;
